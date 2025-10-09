'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Database,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Play,
  Loader2
} from 'lucide-react';

interface DatabaseStatus {
  connected: boolean;
  tablesExist: boolean;
  tableStatus: {
    users: string;
    packages: string;
    topics: string;
    bookings: string;
    attendanceLogs: string;
    studentStats: string;
  };
}

export default function SetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [setting, setSetting] = useState(false);
  const [setupResult, setSetupResult] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
    } else {
      checkDatabaseStatus();
    }
  }, [status, session, router]);

  const checkDatabaseStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/setup/database');
      if (response.ok) {
        const data = await response.json();
        setDbStatus(data);
      } else {
        const error = await response.json();
        setDbStatus({
          connected: false,
          tablesExist: false,
          tableStatus: {
            users: 'error',
            packages: 'error',
            topics: 'error',
            bookings: 'error',
            attendanceLogs: 'error',
            studentStats: 'error'
          }
        });
      }
    } catch (error) {
      console.error('Error checking database status:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupDatabase = async () => {
    setSetting(true);
    setSetupResult(null);
    try {
      const response = await fetch('/api/setup/database', {
        method: 'POST',
      });

      const result = await response.json();
      setSetupResult(result);

      if (response.ok) {
        // Refresh status after successful setup
        setTimeout(() => checkDatabaseStatus(), 2000);
      }
    } catch (error) {
      console.error('Error setting up database:', error);
      setSetupResult({
        success: false,
        error: 'Failed to setup database'
      });
    } finally {
      setSetting(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
    return <div className="min-h-screen flex items-center justify-center">Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/admin')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Panel
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Database Setup
              </h1>
              <p className="text-gray-600">
                Initialize your Mindset LMS database with all required tables
              </p>
            </div>
            <Button 
              onClick={checkDatabaseStatus}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Check Status
            </Button>
          </div>
        </div>

        {/* Database Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dbStatus ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {dbStatus.connected ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={dbStatus.connected ? 'text-green-700' : 'text-red-700'}>
                    {dbStatus.connected ? 'Connected to Neon database' : 'Failed to connect to database'}
                  </span>
                </div>

                {dbStatus.connected && (
                  <div>
                    <h4 className="font-medium mb-3">Table Status:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(dbStatus.tableStatus).map(([table, status]) => (
                        <div key={table} className="flex items-center gap-2">
                          {status === 'exists' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-sm capitalize">{table}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">Loading database status...</div>
            )}
          </CardContent>
        </Card>

        {/* Setup Action */}
        {dbStatus?.connected && !dbStatus?.tablesExist && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                Database Setup Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-700 mb-4">
                Your database is connected but tables haven't been created yet. 
                Click the button below to create all required tables for the LMS.
              </p>
              <Button 
                onClick={setupDatabase}
                disabled={setting}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {setting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting up database...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Setup Database Tables
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Setup Result */}
        {setupResult && (
          <Card className={`mb-6 ${setupResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${setupResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {setupResult.success ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
                Setup {setupResult.success ? 'Successful' : 'Failed'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={setupResult.success ? 'text-green-700' : 'text-red-700'}>
                {setupResult.message || setupResult.error}
              </p>
              {setupResult.tables && (
                <div className="mt-4">
                  <h4 className="font-medium text-green-800 mb-2">Tables Created:</h4>
                  <ul className="space-y-1">
                    {setupResult.tables.map((table: string, index: number) => (
                      <li key={index} className="text-sm text-green-700 flex items-center gap-2">
                        <CheckCircle className="h-3 w-3" />
                        {table}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* All Good */}
        {dbStatus?.connected && dbStatus?.tablesExist && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                Database Ready!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 mb-4">
                Your database is fully set up and ready to use. All tables have been created successfully.
              </p>
              <div className="flex gap-3">
                <Button 
                  onClick={() => router.push('/admin/registration')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Start Registering Students
                </Button>
                <Button 
                  onClick={() => router.push('/admin/database')}
                  variant="outline"
                >
                  View Database
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Schema Migration Section */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <CheckCircle className="h-5 w-5" />
              Update Database Schema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 mb-4">
              Update the database schema to support student IDs and active status. 
              This adds new columns to enable the student card system.
            </p>
            <Button 
              onClick={async () => {
                setSetting(true);
                try {
                  const response = await fetch('/api/admin/migrate-schema', {
                    method: 'POST',
                  });
                  const result = await response.json();
                  setSetupResult(result);
                } catch (error) {
                  setSetupResult({ 
                    success: false, 
                    error: 'Failed to migrate schema' 
                  });
                } finally {
                  setSetting(false);
                }
              }}
              disabled={setting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {setting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating schema...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Update Schema for Student IDs
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Database Cleanup Section */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Clean Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-4">
              <strong>Warning:</strong> This will remove all dummy/seed data including test students, teachers, and bookings. 
              Only use this to start fresh with real data. Admin accounts will be preserved.
            </p>
            <Button 
              onClick={async () => {
                if (confirm('Are you sure you want to clean all dummy data? This cannot be undone.')) {
                  setSetting(true);
                  try {
                    const response = await fetch('/api/admin/cleanup', {
                      method: 'POST',
                    });
                    const result = await response.json();
                    setSetupResult(result);
                  } catch (error) {
                    setSetupResult({ 
                      success: false, 
                      error: 'Failed to cleanup database' 
                    });
                  } finally {
                    setSetting(false);
                  }
                }
              }}
              disabled={setting}
              className="bg-red-600 hover:bg-red-700"
            >
              {setting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cleaning up...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Clean All Dummy Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}