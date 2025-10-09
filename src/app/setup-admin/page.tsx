'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, User, Loader2 } from 'lucide-react';

export default function SetupAdminPage() {
  const [setting, setSetting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const router = useRouter();

  const setupAdmin = async () => {
    setSetting(true);
    try {
      const response = await fetch('/api/init-system', {
        method: 'POST',
      });
      const data = await response.json();
      setResult(data);
      
      // Log all results for debugging
      console.log('Init system result:', data);
      
      if (!data.success) {
        console.error('System initialization error:', data);
      }
    } catch (error) {
      console.error('Network error:', error);
      setResult({ 
        success: false, 
        error: 'Network error - failed to connect to server',
        details: error instanceof Error ? error.message : 'Unknown network error'
      });
    } finally {
      setSetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-center">
            <User className="h-6 w-6" />
            Setup Admin Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">
            Create the initial admin account to access the system.
          </p>

          {result && (
            <Card className={`${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <CardContent className="pt-4">
                <div className={`flex items-center gap-2 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                  {result.success ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                  <span className="font-medium">{result.message || result.error}</span>
                </div>
                {result.success && result.adminEmail && (
                  <div className="mt-3 text-sm text-green-700">
                    <p><strong>Email:</strong> {result.adminEmail}</p>
                    {result.defaultPassword && (
                      <p><strong>Password:</strong> {result.defaultPassword}</p>
                    )}
                  </div>
                )}
                {!result.success && result.details && (
                  <div className="mt-3 text-sm text-red-600">
                    <p><strong>Error Details:</strong> {result.details}</p>
                    {result.code && <p><strong>Code:</strong> {result.code}</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Button 
            onClick={setupAdmin}
            disabled={setting}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {setting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Setting up admin...
              </>
            ) : (
              <>
                <User className="h-4 w-4 mr-2" />
                Create Admin Account
              </>
            )}
          </Button>

          {result?.success && (
            <Button 
              onClick={() => router.push('/auth/login')}
              variant="outline"
              className="w-full"
            >
              Go to Login
            </Button>
          )}

          {result?.action === 'setup_required' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Database Setup Required:</strong><br/>
                The database tables need to be created first. You can try accessing the admin setup page directly or contact your system administrator.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}