'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function DataViewerPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      console.log('Raw API response:', data);
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <h1 className="text-2xl font-bold mt-4">Database Data Viewer</h1>
          <p className="text-gray-600">Raw database records</p>
        </div>

        {error && (
          <Card className="mb-4 border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">All Users ({users.length})</h2>
          
          {users.map((user, index) => (
            <Card key={user.id || index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                    user.role === 'TEACHER' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                  {user.name}
                  {user.studentId && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                      ID: {user.studentId}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Email:</strong> {user.email}
                  </div>
                  <div>
                    <strong>Level:</strong> {user.level || 'N/A'}
                  </div>
                  <div>
                    <strong>Active:</strong> {user.isActive !== undefined ? (user.isActive ? 'Yes' : 'No') : 'N/A'}
                  </div>
                  <div>
                    <strong>Created:</strong> {formatDate(user.createdAt)}
                  </div>
                  <div>
                    <strong>Phone:</strong> {user.phone || 'N/A'}
                  </div>
                  <div>
                    <strong>Birth Date:</strong> {user.birthDate || 'N/A'}
                  </div>
                </div>
                
                {user.packages && user.packages.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <strong>Packages:</strong>
                    {user.packages.map((pkg, i) => (
                      <div key={i} className="text-sm mt-1">
                        {pkg.remainingLessons}/{pkg.totalLessons} lessons remaining
                      </div>
                    ))}
                  </div>
                )}
                
                {user._count && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <strong>Counts:</strong>
                    <div className="text-sm">
                      Packages: {user._count.packages}, 
                      Bookings: {user._count.studentBookings}, 
                      Classes: {user._count.teacherClasses}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Button onClick={fetchData} variant="outline">
            Refresh Data
          </Button>
        </div>
      </div>
    </div>
  );
}