'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Table2, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function GoogleSheetsImportPage() {
  const { data: session, status } = useSession();
  const [sheetUrl, setSheetUrl] = useState('https://docs.google.com/spreadsheets/d/1lYJTVQ3psD4Yt7lv_zeZGu2K1vnKjFuc87Qv-Bttov8/edit?gid=0#gid=0');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (status === 'loading') return <div className="p-8">Loading...</div>;
  
  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  const handleImport = async () => {
    if (!sheetUrl || !sheetUrl.includes('docs.google.com/spreadsheets')) {
      alert('Please enter a valid Google Sheets URL');
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/google-sheets-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetUrl }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        imported: 0,
        errors: ['Failed to import from Google Sheets'],
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
          <h1 className="text-2xl font-bold mt-4">Import from Google Sheets</h1>
          <p className="text-gray-600 mt-2">
            Import all students directly from your Google Sheets spreadsheet
          </p>
        </div>

        {/* Import Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Table2 className="h-5 w-5" />
              Google Sheets Import
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded">
                <h4 className="font-medium mb-2 text-blue-800">How it works:</h4>
                <ul className="text-sm space-y-1 text-blue-700">
                  <li>• Fetches all student data from your Google Sheets</li>
                  <li>• Generates unique student IDs (MST-2025-XXXX)</li>
                  <li>• Creates lesson packages with contract dates</li>
                  <li>• Updates existing students if emails match</li>
                  <li>• Maps course levels automatically</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Google Sheets URL
                </label>
                <Input
                  type="url"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Make sure the spreadsheet is publicly accessible or shared
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <h4 className="font-medium text-yellow-800">Expected Format:</h4>
                </div>
                <p className="text-sm text-yellow-700">
                  Columns: Name, Email, Phone, Course Type, Lessons, Level, Contract End Date (DD/MM/YYYY)
                </p>
              </div>

              <Button 
                onClick={handleImport} 
                disabled={importing || !sheetUrl}
                className="w-full"
                size="lg"
              >
                {importing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Importing from Google Sheets...
                  </>
                ) : (
                  'Import All Students from Google Sheets'
                )}
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
                    <div className="text-green-700 text-sm mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div>Total: {result.total}</div>
                      <div>Imported: {result.imported}</div>
                      <div>Updated: {result.updated || 0}</div>
                      <div>Errors: {result.errors?.length || 0}</div>
                    </div>
                  </div>
                  
                  {result.sampleStudents && result.sampleStudents.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded">
                      <p className="font-medium text-blue-800 mb-2">New students imported:</p>
                      <div className="text-sm space-y-1">
                        {result.sampleStudents.map((student: any, index: number) => (
                          <div key={index} className="text-blue-700">
                            • {student.name} ({student.studentId}) - {student.email} - {student.lessons} lessons
                          </div>
                        ))}
                        {result.imported > 5 && (
                          <p className="text-blue-600 mt-2">...and {result.imported - 5} more students</p>
                        )}
                      </div>
                    </div>
                  )}

                  {result.updates && result.updates.length > 0 && (
                    <div className="bg-purple-50 p-4 rounded">
                      <p className="font-medium text-purple-800 mb-2">Updated existing students:</p>
                      <div className="text-sm space-y-1">
                        {result.updates.map((update: string, index: number) => (
                          <div key={index} className="text-purple-700">• {update}</div>
                        ))}
                        {result.updated > 5 && (
                          <p className="text-purple-600 mt-2">...and {result.updated - 5} more updates</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {result.errors && result.errors.length > 0 && (
                    <div className="bg-yellow-50 p-4 rounded">
                      <p className="font-medium text-yellow-800">Some entries were skipped:</p>
                      <ul className="text-sm text-yellow-700 mt-1 max-h-40 overflow-y-auto">
                        {result.errors.slice(0, 10).map((error: string, index: number) => (
                          <li key={index}>• {error}</li>
                        ))}
                        {result.errors.length > 10 && <p>...and {result.errors.length - 10} more</p>}
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
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <Link href="/admin/users">
                  <Button variant="outline">View All Students</Button>
                </Link>
                {result.success && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setResult(null);
                      setSheetUrl('');
                    }}
                  >
                    Import Another Sheet
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}