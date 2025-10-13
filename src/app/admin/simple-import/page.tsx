'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Upload, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function SimpleImportPage() {
  const { data: session, status } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (status === 'loading') return <div className="p-8">Loading...</div>;
  
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/import-csv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        imported: 0,
        errors: ['Failed to import file'],
        students: []
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
          <h1 className="text-2xl font-bold mt-4">Import Students from CSV</h1>
        </div>

        {/* Upload Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
              />
              
              {file && (
                <div className="bg-blue-50 p-4 rounded">
                  <p>Selected: {file.name}</p>
                  <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded">
                <h4 className="font-medium mb-2">CSV Format Expected:</h4>
                <p className="text-sm text-blue-600 mb-2">Supports both comma (,) and semicolon (;) separators</p>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Full Name</strong> (required)</li>
                  <li>• <strong>Email</strong> (required)</li>
                  <li>• <strong>Phone</strong></li>
                  <li>• <strong>Course</strong> (Smart Learning, Conversaciones, etc.)</li>
                  <li>• <strong>Total Lessons</strong></li>
                  <li>• <strong>Level</strong> (Basico, Survivor, Explorer, Expert, etc.)</li>
                  <li>• <strong>Inicio Contrato</strong> (optional)</li>
                  <li>• <strong>Contract End</strong> (DD/MM/YYYY format)</li>
                </ul>
                <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                  <p className="font-medium text-blue-800">Example header:</p>
                  <code className="text-blue-600">Full Name;Email;Phone;Course;Total Lessons;Level;Inicio Contrato;Contract End</code>
                </div>
              </div>

              <Button 
                onClick={handleImport} 
                disabled={!file || importing}
                className="w-full"
              >
                {importing ? 'Importing...' : 'Import Students'}
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
                      ✅ Successfully imported {result.imported} out of {result.total || result.imported} students!
                    </p>
                  </div>
                  
                  {result.students && result.students.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded">
                      <p className="font-medium text-blue-800 mb-2">Sample imported students:</p>
                      <div className="text-sm space-y-1">
                        {result.students.slice(0, 5).map((student: any, index: number) => (
                          <div key={index} className="text-blue-700">
                            • {student.name} ({student.studentId}) - Level: {student.level}
                          </div>
                        ))}
                        {result.students.length > 5 && <p className="text-blue-600">...and {result.students.length - 5} more</p>}
                      </div>
                    </div>
                  )}
                  
                  {result.errors && result.errors.length > 0 && (
                    <div className="bg-yellow-50 p-4 rounded">
                      <p className="font-medium text-yellow-800">Some students were skipped:</p>
                      <ul className="text-sm text-yellow-700 mt-1">
                        {result.errors.slice(0, 5).map((error: string, index: number) => (
                          <li key={index}>• {error}</li>
                        ))}
                        {result.errors.length > 5 && <p>...and {result.errors.length - 5} more errors</p>}
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
                      <ul className="text-sm">
                        {result.errors.slice(0, 10).map((error: string, index: number) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4">
                <Link href="/admin/users">
                  <Button variant="outline">View All Students</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}