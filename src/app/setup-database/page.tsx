'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Database, Loader2, ArrowRight } from 'lucide-react';

export default function SetupDatabasePage() {
  const [setting, setSetting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const router = useRouter();

  const setupDatabase = async () => {
    setSetting(true);
    try {
      const response = await fetch('/api/setup-database', {
        method: 'POST',
      });
      const data = await response.json();
      setResult(data);
      
      console.log('Database setup result:', data);
      
      if (!data.success) {
        console.error('Database setup error:', data);
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
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-center">
            <Database className="h-6 w-6" />
            Setup Database Tables
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">
            Create the required database tables in your Neon database before setting up admin accounts.
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
                {result.success && result.tablesCreated && (
                  <div className="mt-3 text-sm text-green-700">
                    <p><strong>Tables Created:</strong></p>
                    <ul className="list-disc list-inside mt-1">
                      {result.tablesCreated.map((table: string, index: number) => (
                        <li key={index}>{table}</li>
                      ))}
                    </ul>
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
            onClick={setupDatabase}
            disabled={setting}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {setting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating tables...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Create Database Tables
              </>
            )}
          </Button>

          {result?.success && (
            <Button 
              onClick={() => router.push('/setup-admin')}
              variant="outline"
              className="w-full"
            >
              Next: Create Admin Account
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          <div className="text-xs text-gray-500 text-center mt-4">
            Step 1 of 2: Database Setup → Admin Creation
          </div>
        </CardContent>
      </Card>
    </div>
  );
}