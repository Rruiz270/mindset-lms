'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/navbar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, BookOpen, Calendar, Settings, GraduationCap, DollarSign } from 'lucide-react'
import axios from 'axios'
import { format } from 'date-fns'

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalBookings: number;
  activePackages: number;
  totalRevenue: number;
  upcomingClasses: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  level?: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalBookings: 0,
    activePackages: 0,
    totalRevenue: 0,
    upcomingClasses: 0,
  })
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/auth/login');
    } else {
      fetchData();
    }
  }, [status, session, router])

  const fetchData = async () => {
    try {
      // Fetch users
      const usersResponse = await axios.get('/api/admin/users');
      setUsers(usersResponse.data);

      // Calculate stats
      const students = usersResponse.data.filter((u: User) => u.role === 'STUDENT').length;
      const teachers = usersResponse.data.filter((u: User) => u.role === 'TEACHER').length;

      // Fetch bookings
      const bookingsResponse = await axios.get('/api/bookings');
      const bookings = bookingsResponse.data;
      const upcoming = bookings.filter((b: any) => 
        new Date(b.scheduledAt) > new Date() && b.status === 'SCHEDULED'
      ).length;

      setStats({
        totalStudents: students,
        totalTeachers: teachers,
        totalBookings: bookings.length,
        activePackages: 0, // TODO: implement packages endpoint
        totalRevenue: 0, // TODO: implement revenue calculation
        upcomingClasses: upcoming,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your Mindset LMS platform
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeachers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Packages</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePackages}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Classes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingClasses}</div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Management Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <Button onClick={() => router.push('/admin/users/new')}>
                  <Users className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading users...</p>
                ) : users.length === 0 ? (
                  <p className="text-muted-foreground">No users found.</p>
                ) : (
                  <div className="space-y-2">
                    {users.slice(0, 10).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{user.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {user.email} • {user.role}
                            {user.level && ` • ${user.level}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Joined {format(new Date(user.createdAt), 'PP')}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                        >
                          Edit
                        </Button>
                      </div>
                    ))}
                    {users.length > 10 && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => router.push('/admin/users')}
                      >
                        View All Users ({users.length})
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Booking Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  View and manage all class bookings across the platform.
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => router.push('/admin/bookings')}
                >
                  Manage Bookings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Topics</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage topics for all levels
                    </p>
                    <Button size="sm" onClick={() => router.push('/admin/topics')}>
                      Manage Topics
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Exercises</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create and edit exercises
                    </p>
                    <Button size="sm" onClick={() => router.push('/admin/exercises')}>
                      Manage Exercises
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Live Class Content</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage slides, exercises, and media for live classes
                    </p>
                    <Button size="sm" onClick={() => router.push('/admin/live-class-content')}>
                      Manage Live Class Content
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Database</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage database and migrations
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Run Migrations</Button>
                      <Button size="sm" variant="outline">Backup Database</Button>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">API Keys</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Configure external service integrations
                    </p>
                    <Button size="sm" onClick={() => router.push('/admin/settings/api')}>
                      Manage API Keys
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}