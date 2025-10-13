'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Users
} from 'lucide-react';
import Link from 'next/link';

interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  students: any[];
}

export default function BulkImportPage() {
  const { data: session, status } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [preview, setPreview] = useState<any[]>([]);

  if (status === 'loading') return <div className="p-8">Loading...</div>;
  
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  const downloadTemplate = () => {
    const csvContent = `Full Name,Email,Phone,Birth Date,Gender,Address,CEFR Level,Course,Total Lessons,Contract Start,Contract End,Notes
John Doe,john@example.com,+1-555-123-4567,1990-01-15,Male,123 Main St,B1,Smart Learning,80,2025-01-01,2025-12-31,Existing student
Jane Smith,jane@example.com,+1-555-987-6543,1985-05-22,Female,456 Oak Ave,A2,Smart Conversation,60,2025-02-01,2026-01-31,Transfer student`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      previewFile(selectedFile);
    }
  };

  const previewFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });
      setPreview(rows.filter(row => row['Full Name'] && row['Email']));
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/bulk-import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        imported: 0,
        errors: ['Failed to import file: ' + (error instanceof Error ? error.message : 'Unknown error')],
        students: []
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin Panel
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Upload className="h-6 w-6" />
                  Bulk Student Import
                </h1>
                <p className="text-gray-600">Import multiple students from CSV file</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Import Section */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Download Template */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Step 1: Download Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Download our CSV template with the correct format and example data.
                </p>
                <Button onClick={downloadTemplate} variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Download CSV Template
                </Button>
              </CardContent>
            </Card>

            {/* Step 2: Upload File */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Step 2: Upload Your File
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="mb-4"
                    />
                    <p className="text-sm text-gray-500">
                      Supported format: CSV files only
                    </p>
                  </div>

                  {file && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="font-medium text-blue-800">Selected File:</p>
                      <p className="text-blue-600">{file.name}</p>
                      <p className="text-sm text-blue-600">Size: {(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Preview Section */}
            {preview.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Preview (First 5 rows)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lessons</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {preview.map((row, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 text-sm">{row['Full Name']}</td>
                            <td className="px-3 py-2 text-sm">{row['Email']}</td>
                            <td className="px-3 py-2 text-sm">{row['CEFR Level']}</td>
                            <td className="px-3 py-2 text-sm">{row['Total Lessons']}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Import */}
            {file && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Step 3: Import Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleImport} 
                    disabled={importing || !file}
                    className="w-full"
                  >
                    {importing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Import Students
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Instructions Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Required Columns</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Full Name</strong> (required)</li>
                  <li>• <strong>Email</strong> (required, unique)</li>
                  <li>• <strong>Phone</strong> (required)</li>
                  <li>• <strong>Birth Date</strong> (YYYY-MM-DD)</li>
                  <li>• <strong>Gender</strong> (Male/Female/Other)</li>
                  <li>• <strong>Address</strong></li>
                  <li>• <strong>CEFR Level</strong> (A1, A2, B1, B2, C1, C2)</li>
                  <li>• <strong>Course</strong> (Smart Learning, etc.)</li>
                  <li>• <strong>Total Lessons</strong> (number)</li>
                  <li>• <strong>Contract Start</strong> (YYYY-MM-DD)</li>
                  <li>• <strong>Contract End</strong> (YYYY-MM-DD)</li>
                  <li>• <strong>Notes</strong> (optional)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Import Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>✅ Auto-generates Student IDs</li>
                  <li>✅ Creates lesson packages</li>
                  <li>✅ Validates email uniqueness</li>
                  <li>✅ Sets students as active</li>
                  <li>✅ Generates temporary passwords</li>
                  <li>✅ Error reporting</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <Card className="mt-6">
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
              <div className="space-y-4">
                {result.success ? (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-green-800 font-medium">
                      ✅ Successfully imported {result.imported} students!
                    </p>
                    <p className="text-green-700 text-sm mt-1">
                      Students have been created with temporary passwords. 
                      You can view them in the Users section.
                    </p>
                  </div>
                ) : (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-red-800 font-medium">
                      ❌ Import failed or completed with errors
                    </p>
                    <p className="text-red-700 text-sm">
                      {result.imported} students imported successfully
                    </p>
                  </div>
                )}

                {result.errors.length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-yellow-800 font-medium flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Errors ({result.errors.length})
                    </p>
                    <ul className="text-yellow-700 text-sm mt-2 space-y-1">
                      {result.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2">
                  <Link href="/admin/users">
                    <Button variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      View All Students
                    </Button>
                  </Link>
                  <Button onClick={() => {
                    setFile(null);
                    setResult(null);
                    setPreview([]);
                  }} variant="outline">
                    Import Another File
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}