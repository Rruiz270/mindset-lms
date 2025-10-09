'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Users,
  Database,
  RefreshCw,
  Eye,
  Calendar,
  Package,
  BookOpen
} from 'lucide-react';
import { format } from 'date-fns';

interface Student {
  id: string;
  name: string;
  email: string;
  role: string;
  level: string;
  createdAt: string;
  packages: {
    id: string;
    totalLessons: number;
    usedLessons: number;
    remainingLessons: number;
    validFrom: string;
    validUntil: string;
  }[];
  studentBookings: {
    id: string;
    scheduledAt: string;
    status: string;
    topic: {
      name: string;
    };
    teacher: {
      name: string;
    };
  }[];
}

export default function DatabasePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
    } else {
      fetchStudents();
    }
  }, [status, session, router]);

  const fetchStudents = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/admin/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      
      <div className="max-w-7xl mx-auto px-4 py-8">
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
                Database Management
              </h1>
              <p className="text-gray-600">
                View and manage all data in the system
              </p>
            </div>
            <Button 
              onClick={fetchStudents}
              disabled={refreshing}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </div>

        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Registered Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No students registered yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {students.map((student) => (
                      <Card key={student.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-lg">{student.name}</h4>
                              <Badge variant="outline">{student.level}</Badge>
                              <Badge>{student.role}</Badge>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">{student.email}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                              {/* Account Info */}
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <h5 className="font-medium text-blue-900 mb-2">Account</h5>
                                <p className="text-sm text-blue-700">
                                  ID: {student.id.slice(0, 8)}...
                                </p>
                                <p className="text-sm text-blue-700">
                                  Created: {format(new Date(student.createdAt), 'MMM d, yyyy')}
                                </p>
                              </div>

                              {/* Package Info */}
                              <div className="bg-green-50 p-3 rounded-lg">
                                <h5 className="font-medium text-green-900 mb-2">Package</h5>
                                {student.packages.length > 0 ? (
                                  <>
                                    <p className="text-sm text-green-700">
                                      Lessons: {student.packages[0].usedLessons}/{student.packages[0].totalLessons}
                                    </p>
                                    <p className="text-sm text-green-700">
                                      Remaining: {student.packages[0].remainingLessons}
                                    </p>
                                    <p className="text-sm text-green-700">
                                      Valid until: {format(new Date(student.packages[0].validUntil), 'MMM d, yyyy')}
                                    </p>
                                  </>
                                ) : (
                                  <p className="text-sm text-green-700">No package assigned</p>
                                )}
                              </div>

                              {/* Bookings Info */}
                              <div className="bg-purple-50 p-3 rounded-lg">
                                <h5 className="font-medium text-purple-900 mb-2">Recent Activity</h5>
                                {student.studentBookings.length > 0 ? (
                                  <>
                                    <p className="text-sm text-purple-700">
                                      Total bookings: {student.studentBookings.length}
                                    </p>
                                    <p className="text-sm text-purple-700">
                                      Last class: {format(new Date(student.studentBookings[0].scheduledAt), 'MMM d')}
                                    </p>
                                    <p className="text-sm text-purple-700">
                                      Topic: {student.studentBookings[0].topic.name}
                                    </p>
                                  </>
                                ) : (
                                  <p className="text-sm text-purple-700">No bookings yet</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="teachers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Teachers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Teacher data viewer coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  All Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Bookings data viewer coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Student Packages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.flatMap(student => 
                    student.packages.map(pkg => (
                      <Card key={pkg.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{student.name}</h4>
                            <p className="text-sm text-gray-600">{student.email}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Total Lessons</p>
                                <p className="font-medium">{pkg.totalLessons}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Used</p>
                                <p className="font-medium">{pkg.usedLessons}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Remaining</p>
                                <p className="font-medium text-green-600">{pkg.remainingLessons}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Valid Until</p>
                                <p className="font-medium">{format(new Date(pkg.validUntil), 'MMM d, yyyy')}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}