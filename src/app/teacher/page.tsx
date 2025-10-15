'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Clock,
  Users,
  Settings,
  Video,
  FileText,
  HelpCircle,
  Star,
  TrendingUp,
  CheckCircle,
  XCircle,
  Play,
  BookOpen,
  BarChart3,
  DollarSign,
  MessageSquare,
  Award,
  UserCheck,
  Globe,
  Eye
} from 'lucide-react';
import { format, isToday, startOfMonth, endOfMonth } from 'date-fns';
import axios from 'axios';
import Navbar from '@/components/layout/navbar';
import LiveAttendanceTracker from '@/components/attendance/LiveAttendanceTracker';

interface Student {
  id: string;
  name: string;
  email: string;
  level: string;
  attendanceRate: number;
  lastClass: string;
  totalClasses: number;
}

interface DayClass {
  id: string;
  time: string;
  courseType: 'Smart Learning' | 'Smart Conversation' | 'Conversaciones' | 'Private Lessons';
  topic: string;
  students: Student[];
  maxStudents: number;
  googleMeetLink?: string;
  status: 'upcoming' | 'live' | 'completed';
  materialId: string;
}

interface TeacherReview {
  id: string;
  studentName: string;
  rating: number;
  comment: string;
  date: string;
  topic: string;
}

interface MonthlyStats {
  classesCompleted: number;
  studentsAttended: number;
  averageRating: number;
  earnings: number;
  attendanceRate: number;
  totalHours: number;
}

interface TeacherStats {
  todayClasses: number;
  nextClasses: number;
  totalStudents: number;
  monthlyStats: MonthlyStats;
  recentReviews: TeacherReview[];
}

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [todayClasses, setTodayClasses] = useState<DayClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<TeacherStats>({
    todayClasses: 0,
    nextClasses: 0,
    totalStudents: 0,
    monthlyStats: {
      classesCompleted: 0,
      studentsAttended: 0,
      averageRating: 0,
      earnings: 0,
      attendanceRate: 0,
      totalHours: 0
    },
    recentReviews: []
  });
  const [loading, setLoading] = useState(true);
  const [showAttendanceForClass, setShowAttendanceForClass] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'TEACHER') {
      router.push('/auth/login');
    } else {
      fetchTeacherData();
    }
  }, [session, status, router]);

  const fetchTeacherData = async () => {
    try {
      // TODO: Replace with actual API calls
      // Mock data for demonstration
      const mockTodayClasses: DayClass[] = [
        {
          id: '1',
          time: '09:00',
          courseType: 'Smart Learning',
          topic: 'Shopping: How Much Is It?',
          students: [
            { id: '1', name: 'John Doe', email: 'john@email.com', level: 'A2', attendanceRate: 95, lastClass: '2024-01-08', totalClasses: 15 },
            { id: '2', name: 'Jane Smith', email: 'jane@email.com', level: 'A2', attendanceRate: 88, lastClass: '2024-01-08', totalClasses: 12 }
          ],
          maxStudents: 8,
          googleMeetLink: 'https://meet.google.com/abc-def-ghi',
          status: 'upcoming',
          materialId: 'topic-1'
        },
        {
          id: '2',
          time: '14:00',
          courseType: 'Smart Conversation',
          topic: 'Travel: Getting Around',
          students: [
            { id: '3', name: 'Carlos Rodriguez', email: 'carlos@email.com', level: 'B1', attendanceRate: 92, lastClass: '2024-01-07', totalClasses: 20 },
            { id: '4', name: 'Maria Lopez', email: 'maria@email.com', level: 'B1', attendanceRate: 100, lastClass: '2024-01-07', totalClasses: 18 }
          ],
          maxStudents: 6,
          googleMeetLink: 'https://meet.google.com/xyz-abc-def',
          status: 'upcoming',
          materialId: 'topic-5'
        },
        {
          id: '3',
          time: '16:30',
          courseType: 'Private Lessons',
          topic: 'Business English: Presentations',
          students: [
            { id: '5', name: 'David Wilson', email: 'david@email.com', level: 'C1', attendanceRate: 100, lastClass: '2024-01-06', totalClasses: 8 }
          ],
          maxStudents: 1,
          googleMeetLink: 'https://meet.google.com/private-123',
          status: 'upcoming',
          materialId: 'topic-business-1'
        }
      ];

      const mockStudents: Student[] = [
        { id: '1', name: 'John Doe', email: 'john@email.com', level: 'A2', attendanceRate: 95, lastClass: '2024-01-08', totalClasses: 15 },
        { id: '2', name: 'Jane Smith', email: 'jane@email.com', level: 'A2', attendanceRate: 88, lastClass: '2024-01-08', totalClasses: 12 },
        { id: '3', name: 'Carlos Rodriguez', email: 'carlos@email.com', level: 'B1', attendanceRate: 92, lastClass: '2024-01-07', totalClasses: 20 },
        { id: '4', name: 'Maria Lopez', email: 'maria@email.com', level: 'B1', attendanceRate: 100, lastClass: '2024-01-07', totalClasses: 18 },
        { id: '5', name: 'David Wilson', email: 'david@email.com', level: 'C1', attendanceRate: 100, lastClass: '2024-01-06', totalClasses: 8 }
      ];

      const mockReviews: TeacherReview[] = [
        {
          id: '1',
          studentName: 'John Doe',
          rating: 5,
          comment: 'Excellent teacher! Very patient and clear explanations.',
          date: '2024-01-08',
          topic: 'Shopping: How Much Is It?'
        },
        {
          id: '2',
          studentName: 'Maria Lopez',
          rating: 5,
          comment: 'Great conversation practice. Really helped my speaking confidence.',
          date: '2024-01-07',
          topic: 'Travel: Getting Around'
        },
        {
          id: '3',
          studentName: 'David Wilson',
          rating: 4,
          comment: 'Professional and well-prepared. Good business examples.',
          date: '2024-01-06',
          topic: 'Business English'
        }
      ];

      setTodayClasses(mockTodayClasses);
      setStudents(mockStudents);
      setStats({
        todayClasses: mockTodayClasses.length,
        nextClasses: 12,
        totalStudents: mockStudents.length,
        monthlyStats: {
          classesCompleted: 28,
          studentsAttended: 45,
          averageRating: 4.8,
          earnings: 2800,
          attendanceRate: 94,
          totalHours: 42
        },
        recentReviews: mockReviews
      });
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartClass = (googleMeetLink: string) => {
    window.open(googleMeetLink, '_blank');
  };

  const handleClassMaterials = (materialId: string) => {
    router.push(`/teacher/materials/${materialId}`);
  };

  const handleTeacherGuide = (materialId: string) => {
    router.push(`/teacher/guide/${materialId}`);
  };

  const handleShowAttendance = (classId: string) => {
    setShowAttendanceForClass(showAttendanceForClass === classId ? null : classId);
  };

  const getCourseTypeColor = (courseType: string) => {
    switch (courseType) {
      case 'Smart Learning': return 'bg-blue-600';
      case 'Smart Conversation': return 'bg-green-600';
      case 'Conversaciones': return 'bg-purple-600';
      case 'Private Lessons': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session?.user?.name}!
          </h1>
          <p className="text-gray-600">
            Today is {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
              <Calendar className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{stats.todayClasses}</div>
              <p className="text-xs text-blue-600 mt-1">Classes scheduled</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Classes</CardTitle>
              <Clock className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{stats.nextClasses}</div>
              <p className="text-xs text-green-600 mt-1">Upcoming this week</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <Users className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{stats.totalStudents}</div>
              <p className="text-xs text-purple-600 mt-1">Current students</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <Star className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">{stats.monthlyStats.averageRating}</div>
              <p className="text-xs text-orange-600 mt-1">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="today" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="today">Today's Classes</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Today's Classes Tab */}
          <TabsContent value="today" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Today's Schedule - {format(new Date(), 'MMMM d, yyyy')}
                </CardTitle>
                <CardDescription>
                  Your classes for today with student lists and materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayClasses.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No classes scheduled for today</p>
                  ) : (
                    todayClasses.map((classItem) => (
                      <Card key={classItem.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="font-semibold text-lg">{classItem.time}</span>
                                <Badge className={getCourseTypeColor(classItem.courseType)}>
                                  {classItem.courseType}
                                </Badge>
                                <Badge variant="outline">
                                  {classItem.students.length}/{classItem.maxStudents} students
                                </Badge>
                              </div>
                              <h3 className="font-medium text-gray-900 mb-2">{classItem.topic}</h3>
                              
                              {/* Student List */}
                              <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Students attending:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {classItem.students.map((student) => (
                                    <div key={student.id} className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                                      <UserCheck className="h-3 w-3 text-green-600" />
                                      <span className="text-xs">{student.name}</span>
                                      <Badge variant="outline" className="text-xs">{student.level}</Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-3 flex-wrap">
                            <Button 
                              onClick={() => handleStartClass(classItem.googleMeetLink!)}
                              className="bg-green-600 hover:bg-green-700"
                              disabled={!classItem.googleMeetLink}
                            >
                              <Video className="h-4 w-4 mr-2" />
                              Start Class
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => handleClassMaterials(classItem.materialId)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Class Materials
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => handleTeacherGuide(classItem.materialId)}
                            >
                              <HelpCircle className="h-4 w-4 mr-2" />
                              Teacher Guide
                            </Button>
                            <Button 
                              variant={showAttendanceForClass === classItem.id ? "default" : "outline"}
                              onClick={() => handleShowAttendance(classItem.id)}
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              {showAttendanceForClass === classItem.id ? 'Hide' : 'Live'} Attendance
                            </Button>
                          </div>
                          
                          {/* Live Attendance Tracker */}
                          {showAttendanceForClass === classItem.id && (
                            <div className="mt-6 pt-6 border-t">
                              <LiveAttendanceTracker 
                                bookingId={classItem.id}
                                isTeacher={true}
                                autoRefresh={true}
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
                  <UserCheck className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">{stats.monthlyStats.attendanceRate}%</div>
                  <p className="text-xs text-green-600 mt-1">This month</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Classes with Full Attendance</CardTitle>
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700">18</div>
                  <p className="text-xs text-blue-600 mt-1">Out of {stats.monthlyStats.classesCompleted} classes</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
                  <Clock className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-700">8</div>
                  <p className="text-xs text-orange-600 mt-1">Students this month</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Recent Classes Attendance
                </CardTitle>
                <CardDescription>
                  Attendance tracking for your recent classes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayClasses.map((classItem) => (
                    <Card key={classItem.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{classItem.topic}</h4>
                          <p className="text-sm text-gray-600">{format(new Date(), 'MMM d')} • {classItem.time}</p>
                        </div>
                        <Badge className={getCourseTypeColor(classItem.courseType)}>
                          {classItem.courseType}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">
                              {classItem.students.length}/{classItem.maxStudents} expected
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600">
                              {Math.round((classItem.students.length / classItem.maxStudents) * 100)}% attendance
                            </span>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleShowAttendance(classItem.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-green-500 rounded-full"
                            style={{ width: `${(classItem.students.length / classItem.maxStudents) * 100}%` }}
                          />
                        </div>
                      </div>
                      
                      {/* Live Attendance Details */}
                      {showAttendanceForClass === classItem.id && (
                        <div className="mt-4 pt-4 border-t">
                          <LiveAttendanceTracker 
                            bookingId={classItem.id}
                            isTeacher={true}
                            autoRefresh={true}
                          />
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Attendance Trends
                </CardTitle>
                <CardDescription>
                  Student attendance patterns and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">Excellent Attendance (90%+)</h4>
                      <div className="space-y-2">
                        {students.filter(s => s.attendanceRate >= 90).map((student) => (
                          <div key={student.id} className="flex items-center justify-between">
                            <span className="text-sm">{student.name}</span>
                            <Badge variant="outline" className="text-green-600">{student.attendanceRate}%</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-2">Needs Attention (&lt;85%)</h4>
                      <div className="space-y-2">
                        {students.filter(s => s.attendanceRate < 85).map((student) => (
                          <div key={student.id} className="flex items-center justify-between">
                            <span className="text-sm">{student.name}</span>
                            <Badge variant="outline" className="text-yellow-600">{student.attendanceRate}%</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Student Attendance & Progress
                </CardTitle>
                <CardDescription>
                  Track your students' attendance and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.map((student) => (
                    <Card key={student.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium">{student.name}</h4>
                            <Badge variant="outline">{student.level}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{student.email}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className={getAttendanceColor(student.attendanceRate)}>
                                {student.attendanceRate}% attendance
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4 text-blue-600" />
                              <span>{student.totalClasses} classes</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span>Last: {format(new Date(student.lastClass), 'MMM d')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-16 h-2 bg-gray-200 rounded-full mb-1">
                            <div 
                              className="h-2 bg-green-500 rounded-full"
                              style={{ width: `${student.attendanceRate}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{student.attendanceRate}%</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Monthly Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Classes Completed</span>
                    <span className="font-semibold">{stats.monthlyStats.classesCompleted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Students Attended</span>
                    <span className="font-semibold">{stats.monthlyStats.studentsAttended}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Hours</span>
                    <span className="font-semibold">{stats.monthlyStats.totalHours}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Attendance Rate</span>
                    <span className="font-semibold text-green-600">{stats.monthlyStats.attendanceRate}%</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Earnings & Ratings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Monthly Earnings</span>
                    <span className="font-semibold text-green-600">${stats.monthlyStats.earnings}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">{stats.monthlyStats.averageRating}/5</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Reviews</span>
                    <span className="font-semibold">{stats.recentReviews.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Student Reviews & Feedback
                </CardTitle>
                <CardDescription>
                  Recent feedback from your students after live classes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentReviews.map((review) => (
                    <Card key={review.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{review.studentName}</h4>
                          <p className="text-sm text-gray-600">{review.topic}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${
                                i < review.rating 
                                  ? 'text-yellow-500 fill-current' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          ))}
                          <span className="ml-1 text-sm text-gray-600">
                            {format(new Date(review.date), 'MMM d')}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">{review.comment}</p>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Teacher Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/teacher/availability')}
                  className="w-full justify-start"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Manage Availability
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/teacher/profile')}
                  className="w-full justify-start"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/teacher/classes')}
                  className="w-full justify-start"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Manage Classes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/teacher/materials')}
                  className="w-full justify-start"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Teaching Materials
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/teacher/attendance')}
                  className="w-full justify-start"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Attendance Reports
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}