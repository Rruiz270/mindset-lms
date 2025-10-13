'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function AutoPopulatePage() {
  const { data: session, status } = useSession();
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (status === 'loading') return <div className="p-8">Loading...</div>;
  
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  const handleAutoPopulate = async () => {
    if (!confirm('This will import 100 NEW students from your CSV data (completely fresh batch). Continue?')) {
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/auto-populate', {
        method: 'POST',
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        imported: 0,
        errors: ['Failed to auto-populate students'],
        sampleStudents: []
      });
    } finally {
      setImporting(false);
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
          <h1 className="text-2xl font-bold mt-4">Auto-Populate Students</h1>
          <p className="text-gray-600 mt-2">
            Import all students from UPLOAD ALUNOS.numbers file directly into the database
          </p>
        </div>

        {/* Auto-Populate Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Bulk Import from Numbers File
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded">
                <h4 className="font-medium mb-2 text-blue-800">What this will do:</h4>
                <ul className="text-sm space-y-1 text-blue-700">
                  <li>• Import 100 NEW students from CSV data (Batch 5 - fresh batch)</li>
                  <li>• Generate unique student IDs (MST-2025-XXXX format)</li>
                  <li>• Create lesson packages based on contract data</li>
                  <li>• Parse DD/MM/YYYY date format correctly</li>
                  <li>• Map Portuguese/Spanish levels to system levels</li>
                  <li>• Generate temporary passwords for all students</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <h4 className="font-medium text-yellow-800">Important:</h4>
                </div>
                <p className="text-sm text-yellow-700">
                  Students with existing email addresses will be skipped. This operation cannot be undone.
                </p>
              </div>

              <Button 
                onClick={handleAutoPopulate} 
                disabled={importing}
                className="w-full"
                size="lg"
              >
{importing ? 'Importing 100 NEW Students...' : 'Import 100 NEW Students'}
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
                Import Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.success ? (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded">
                    <p className="text-green-800 font-medium">
                      ✅ {result.message}
                    </p>
                    <p className="text-green-700 text-sm mt-1">
                      Total: {result.total} | Imported: {result.imported} | Errors: {result.errors?.length || 0}
                    </p>
                  </div>
                  
                  {result.sampleStudents && result.sampleStudents.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded">
                      <p className="font-medium text-blue-800 mb-2">Sample imported students:</p>
                      <div className="text-sm space-y-1">
                        {result.sampleStudents.map((student: any, index: number) => (
                          <div key={index} className="text-blue-700">
                            • {student.name} ({student.studentId}) - Level: {student.level} - Lessons: {student.lessons}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {result.errors && result.errors.length > 0 && (
                    <div className="bg-yellow-50 p-4 rounded">
                      <p className="font-medium text-yellow-800">Some students were skipped:</p>
                      <ul className="text-sm text-yellow-700 mt-1 max-h-40 overflow-y-auto">
                        {result.errors.slice(0, 10).map((error: string, index: number) => (
                          <li key={index}>• {error}</li>
                        ))}
                        {result.errors.length > 10 && <p>...and {result.errors.length - 10} more errors</p>}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-red-50 p-4 rounded">
                  <p className="text-red-800 font-medium">Import failed</p>
                  <p className="text-red-600 text-sm mt-1">{result.error}</p>
                  {result.details && (
                    <p className="text-red-600 text-sm">{result.details}</p>
                  )}
                  {result.errors && result.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">Errors:</p>
                      <ul className="text-sm max-h-40 overflow-y-auto">
                        {result.errors.slice(0, 10).map((error: string, index: number) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <Link href="/admin/users">
                  <Button variant="outline">View All Students</Button>
                </Link>
                <Link href="/admin/simple-import">
                  <Button variant="outline">CSV Import</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}