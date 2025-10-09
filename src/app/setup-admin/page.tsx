'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, User, Loader2, Database } from 'lucide-react';

export default function SetupAdminPage() {
  const [setting, setSetting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [dbSetup, setDbSetup] = useState(false);
  const [dbResult, setDbResult] = useState<any>(null);
  const router = useRouter();

  const setupDatabase = async () => {
    setDbSetup(true);
    try {
      const response = await fetch('/api/setup-database', {
        method: 'POST',
      });
      const data = await response.json();
      setDbResult(data);
      
      console.log('Database setup result:', data);
      
      if (!data.success) {
        console.error('Database setup error:', data);
      }
    } catch (error) {
      console.error('Database setup network error:', error);
      setDbResult({ 
        success: false, 
        error: 'Network error - failed to connect to server',
        details: error instanceof Error ? error.message : 'Unknown network error'
      });
    } finally {
      setDbSetup(false);
    }
  };

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
            <Database className="h-6 w-6" />
            System Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">
            Set up your Mindset LMS system in 2 steps.
          </p>

          {/* Step 1: Database Setup */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Step 1: Create Database Tables</h3>
            
            {dbResult && (
              <Card className={`${dbResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <CardContent className="pt-4">
                  <div className={`flex items-center gap-2 ${dbResult.success ? 'text-green-700' : 'text-red-700'}`}>
                    {dbResult.success ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                    <span className="font-medium">{dbResult.message || dbResult.error}</span>
                  </div>
                  {dbResult.success && dbResult.tablesCreated && (
                    <div className="mt-3 text-sm text-green-700">
                      <p><strong>Tables Created:</strong> {dbResult.tablesCreated.length} tables</p>
                    </div>
                  )}
                  {!dbResult.success && dbResult.details && (
                    <div className="mt-3 text-sm text-red-600">
                      <p><strong>Error:</strong> {dbResult.details}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Button 
              onClick={setupDatabase}
              disabled={dbSetup}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {dbSetup ? (
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
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-3">Step 2: Create Admin Account</h3>

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
              disabled={setting || !dbResult?.success}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
            >
              {setting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating admin...
                </>
              ) : (
                <>
                  <User className="h-4 w-4 mr-2" />
                  Create Admin Account
                </>
              )}
            </Button>
            
            {!dbResult?.success && (
              <p className="text-sm text-gray-500 text-center">
                Complete Step 1 first to enable admin creation
              </p>
            )}
          </div>

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