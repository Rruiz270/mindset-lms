'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Database, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function UpdateStudentDataPage() {
  const { data: session, status } = useSession();
  const [updating, setUpdating] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (status === 'loading') return <div className="p-8">Loading...</div>;
  
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  const handleUpdateStudentData = async () => {
    if (!confirm('This will update student data with remaining hours and phone numbers from Fix up.csv. Continue?')) {
      return;
    }

    setUpdating(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/update-student-data', {
        method: 'POST',
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to update student data',
        summary: { total: 0, updated: 0, notFound: 0, errors: 1 }
      });
    } finally {
      setUpdating(false);
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
          <h1 className="text-2xl font-bold mt-4">Update Student Data</h1>
          <p className="text-gray-600 mt-2">
            Import remaining hours and phone numbers from Fix up.csv file
          </p>
        </div>

        {/* Update Data Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Update Student Remaining Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded">
                <h4 className="font-medium mb-2 text-blue-800">What this will do:</h4>
                <ul className="text-sm space-y-1 text-blue-700">
                  <li>• Update students with remaining hours from Fix up.csv (column O)</li>
                  <li>• Add phone numbers to student profiles</li>
                  <li>• Add comments from the CSV file</li>
                  <li>• Match students by email address</li>
                  <li>• Show remaining hours on student cards</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <h4 className="font-medium text-yellow-800">Important:</h4>
                </div>
                <p className="text-sm text-yellow-700">
                  This will update existing student records. Students not found by email will be skipped.
                </p>
              </div>

              <Button 
                onClick={handleUpdateStudentData} 
                disabled={updating}
                className="w-full"
                size="lg"
              >
                {updating ? 'Updating Student Data...' : 'Update Student Data from Fix up.csv'}
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
                Update Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.success ? (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded">
                    <p className="text-green-800 font-medium">
                      ✅ {result.message}
                    </p>
                    <div className="text-green-700 text-sm mt-2 space-y-1">
                      <p>Total students processed: {result.summary.total}</p>
                      <p>Successfully updated: {result.summary.updated}</p>
                      <p>Not found in database: {result.summary.notFound}</p>
                      <p>Errors: {result.summary.errors}</p>
                    </div>
                  </div>
                  
                  {result.results && result.results.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded">
                      <p className="font-medium text-blue-800 mb-2">Sample updated students:</p>
                      <div className="text-sm space-y-1">
                        {result.results.map((student: any, index: number) => (
                          <div key={index} className="text-blue-700">
                            • {student.email} - {student.status === 'updated' 
                              ? `${student.remainingHours} hours remaining (${student.studentId})`
                              : student.status
                            }
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-red-50 p-4 rounded">
                  <p className="text-red-800 font-medium">Update failed</p>
                  <p className="text-red-600 text-sm mt-1">{result.error}</p>
                  {result.details && (
                    <p className="text-red-600 text-sm">{result.details}</p>
                  )}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <Link href="/admin/users">
                  <Button variant="outline">View All Students</Button>
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