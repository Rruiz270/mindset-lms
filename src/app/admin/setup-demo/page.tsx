'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, CheckCircle, XCircle, Key } from 'lucide-react';
import Link from 'next/link';

export default function SetupDemoPage() {
  const [setting, setSetting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSetupDemo = async () => {
    setSetting(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/setup-demo-accounts', {
        method: 'POST',
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to setup demo accounts'
      });
    } finally {
      setSetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <h1 className="text-2xl font-bold mt-4">Setup Demo Accounts</h1>
          <p className="text-gray-600 mt-2">
            Recreate demo accounts after database schema changes
          </p>
        </div>

        {/* Setup Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Demo Account Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded">
                <h4 className="font-medium mb-2 text-blue-800">This will create/update:</h4>
                <ul className="text-sm space-y-1 text-blue-700">
                  <li>• Admin: admin@mindset.com / admin123</li>
                  <li>• Teacher: teacher1@mindset.com / teacher123</li>
                  <li>• Student: student1@mindset.com / student123</li>
                  <li>• Sample lesson package for student</li>
                </ul>
              </div>

              <Button 
                onClick={handleSetupDemo} 
                disabled={setting}
                className="w-full"
                size="lg"
              >
                {setting ? 'Setting up Demo Accounts...' : 'Setup Demo Accounts'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                Setup Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.success ? (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded">
                    <p className="text-green-800 font-medium">
                      ✅ {result.message}
                    </p>
                  </div>
                  
                  {result.credentials && (
                    <div className="bg-blue-50 p-4 rounded">
                      <p className="font-medium text-blue-800 mb-2">Demo Credentials:</p>
                      <div className="text-sm space-y-1 text-blue-700">
                        <p>Admin: {result.credentials.admin}</p>
                        <p>Teacher: {result.credentials.teacher}</p>
                        <p>Student: {result.credentials.student}</p>
                      </div>
                    </div>
                  )}
                  
                  {result.results && result.results.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="font-medium text-gray-800 mb-2">Account Status:</p>
                      <div className="text-sm space-y-1">
                        {result.results.map((account: any, index: number) => (
                          <div key={index} className="text-gray-700">
                            • {account.email} - {account.status} ({account.role})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-red-50 p-4 rounded">
                  <p className="text-red-800 font-medium">Setup failed</p>
                  <p className="text-red-600 text-sm mt-1">{result.error}</p>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <Link href="/auth/login">
                  <Button variant="outline">Test Login</Button>
                </Link>
                <Link href="/admin">
                  <Button variant="outline">Back to Admin</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}