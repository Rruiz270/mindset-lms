'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Users, Settings } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import Navbar from '@/components/layout/navbar'

interface Booking {
  id: string;
  scheduledAt: string;
  student: {
    name: string;
    email: string;
    level: string;
  };
  topic: {
    name: string;
    level: string;
  };
  status: string;
}

interface Stats {
  todayClasses: number;
  weekClasses: number;
  totalStudents: number;
  cancelledClasses: number;
}

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats>({
    todayClasses: 0,
    weekClasses: 0,
    totalStudents: 0,
    cancelledClasses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'TEACHER') {
      router.push('/auth/login');
    } else {
      fetchData();
    }
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/bookings?upcoming=true');
      const upcomingBookings = response.data;
      setBookings(upcomingBookings);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekFromNow = new Date(today);
      weekFromNow.setDate(weekFromNow.getDate() + 7);

      const todayClasses = upcomingBookings.filter((b: Booking) => {
        const bookingDate = new Date(b.scheduledAt);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate.getTime() === today.getTime() && b.status === 'SCHEDULED';
      }).length;

      const weekClasses = upcomingBookings.filter((b: Booking) => {
        const bookingDate = new Date(b.scheduledAt);
        return bookingDate <= weekFromNow && b.status === 'SCHEDULED';
      }).length;

      const uniqueStudents = new Set(upcomingBookings.map((b: Booking) => b.student.email));

      setStats({
        todayClasses,
        weekClasses,
        totalStudents: uniqueStudents.size,
        cancelledClasses: upcomingBookings.filter((b: Booking) => b.status === 'CANCELLED').length,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClass = async (bookingId: string) => {
    try {
      await axios.patch(`/api/bookings/${bookingId}`, { status: 'CANCELLED' });
      fetchData();
    } catch (error) {
      console.error('Error cancelling class:', error);
    }
  };

  const handleMarkCompleted = async (bookingId: string) => {
    try {
      await axios.patch(`/api/bookings/${bookingId}`, { status: 'COMPLETED' });
      fetchData();
    } catch (error) {
      console.error('Error marking class as completed:', error);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Teacher Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayClasses}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.weekClasses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cancelledClasses}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Classes</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          {/* Upcoming Classes Tab */}
          <TabsContent value="upcoming" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Classes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.filter(b => b.status === 'SCHEDULED').length === 0 ? (
                    <p className="text-muted-foreground">No upcoming classes scheduled.</p>
                  ) : (
                    bookings
                      .filter(b => b.status === 'SCHEDULED')
                      .map((booking) => (
                        <div key={booking.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">
                                {format(new Date(booking.scheduledAt), 'PPp')}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Student: {booking.student.name} ({booking.student.level})
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Topic: {booking.topic.name}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelClass(booking.id)}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleMarkCompleted(booking.id)}
                              >
                                Mark Completed
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My Availability</CardTitle>
                <Button onClick={() => router.push('/teacher/availability')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Availability
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Configure your weekly availability schedule to allow students to book classes.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from(new Set(bookings.map(b => b.student.email))).map((email) => {
                    const student = bookings.find(b => b.student.email === email)?.student;
                    if (!student) return null;
                    return (
                      <div key={email} className="border rounded-lg p-4">
                        <h4 className="font-semibold">{student.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {student.email} • Level: {student.level}
                        </p>
                      </div>
                    );
                  })}
                  {bookings.length === 0 && (
                    <p className="text-muted-foreground">No students yet.</p>
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