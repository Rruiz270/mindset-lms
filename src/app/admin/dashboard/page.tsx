'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Users,
  Building2,
  Calendar,
  BarChart3,
  TrendingUp,
  BookOpen,
  GraduationCap,
  Clock,
  Globe,
  UserCheck,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface StudentMetrics {
  totalActive: number;
  byLevel: {
    A1: number;
    A2: number;
    B1: number;
    B2: number;
    C1: number;
    C2: number;
  };
  byInternalLevel: {
    STARTER: number;
    SURVIVOR: number;
    EXPLORER: number;
    EXPERT: number;
  };
  byCourse: {
    smartLearning: number;
    smartConversation: number;
    conversaciones: number;
    privateLessons: number;
  };
  b2b: number;
  b2c: number;
  companies: string[];
}

interface ContractInfo {
  studentId: string;
  studentName: string;
  startDate: string;
  endDate: string;
  course: string;
  level: string;
  company?: string;
}

interface AttendanceMetrics {
  overallRate: number;
  totalClasses: number;
  attendedClasses: number;
  lateArrivals: number;
  perfectAttendance: number;
  needsAttention: number;
  byLevel: {
    A1: number;
    A2: number;
    B1: number;
    B2: number;
    C1: number;
    C2: number;
  };
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [metrics, setMetrics] = useState<StudentMetrics>({
    totalActive: 0,
    byLevel: { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 },
    byInternalLevel: { STARTER: 0, SURVIVOR: 0, EXPLORER: 0, EXPERT: 0 },
    byCourse: {
      smartLearning: 0,
      smartConversation: 0,
      conversaciones: 0,
      privateLessons: 0
    },
    b2b: 0,
    b2c: 0,
    companies: []
  });
  const [contracts, setContracts] = useState<ContractInfo[]>([]);
  const [attendanceMetrics, setAttendanceMetrics] = useState<AttendanceMetrics>({
    overallRate: 0,
    totalClasses: 0,
    attendedClasses: 0,
    lateArrivals: 0,
    perfectAttendance: 0,
    needsAttention: 0,
    byLevel: { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
    } else {
      fetchMetrics();
    }
  }, [status, session, router]);

  const fetchMetrics = async () => {
    try {
      // TODO: Replace with actual API calls
      // Simulating data fetch
      setMetrics({
        totalActive: 156,
        byLevel: { A1: 25, A2: 30, B1: 45, B2: 35, C1: 15, C2: 6 },
        byInternalLevel: { STARTER: 55, SURVIVOR: 45, EXPLORER: 35, EXPERT: 21 },
        byCourse: {
          smartLearning: 78,
          smartConversation: 42,
          conversaciones: 24,
          privateLessons: 12
        },
        b2b: 89,
        b2c: 67,
        companies: ['Tech Corp', 'Finance Ltd', 'Health Co', 'Retail Inc']
      });

      setContracts([
        {
          studentId: '1',
          studentName: 'John Doe',
          startDate: '2024-01-15',
          endDate: '2025-01-14',
          course: 'Smart Learning',
          level: 'B1 - SURVIVOR',
          company: 'Tech Corp'
        },
        {
          studentId: '2',
          studentName: 'Jane Smith',
          startDate: '2024-02-01',
          endDate: '2025-01-31',
          course: 'Smart Conversation',
          level: 'A2 - STARTER',
        }
      ]);

      setAttendanceMetrics({
        overallRate: 87,
        totalClasses: 423,
        attendedClasses: 368,
        lateArrivals: 34,
        perfectAttendance: 89,
        needsAttention: 23,
        byLevel: { A1: 82, A2: 85, B1: 90, B2: 88, C1: 92, C2: 89 }
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
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
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Analytics
          </h1>
          <p className="text-gray-600">
            Comprehensive overview of student metrics and performance
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Total Active Students</CardTitle>
              <Users className="h-8 w-8 text-blue-600" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-700">{metrics.totalActive}</p>
              <div className="mt-2 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-green-600">+12% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">B2B Students</CardTitle>
              <Building2 className="h-8 w-8 text-purple-600" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-700">{metrics.b2b}</p>
              <p className="text-sm text-gray-600 mt-1">
                {metrics.companies.length} partner companies
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">B2C Students</CardTitle>
              <Users className="h-8 w-8 text-green-600" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-700">{metrics.b2c}</p>
              <p className="text-sm text-gray-600 mt-1">Individual learners</p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Analytics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Attendance Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-green-900">Overall Attendance</h4>
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-700">{attendanceMetrics.overallRate}%</p>
                <p className="text-xs text-green-600">{attendanceMetrics.attendedClasses}/{attendanceMetrics.totalClasses} classes</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-blue-900">Perfect Attendance</h4>
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-700">{attendanceMetrics.perfectAttendance}</p>
                <p className="text-xs text-blue-600">Students (100% rate)</p>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-orange-900">Late Arrivals</h4>
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-orange-700">{attendanceMetrics.lateArrivals}</p>
                <p className="text-xs text-orange-600">This month</p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-red-900">Needs Attention</h4>
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-red-700">{attendanceMetrics.needsAttention}</p>
                <p className="text-xs text-red-600">Students (&lt;75% rate)</p>
              </div>
            </div>

            {/* Attendance by Level */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-4">Attendance Rate by Level</h4>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {Object.entries(attendanceMetrics.byLevel).map(([level, rate]) => (
                  <div key={level} className="text-center">
                    <div className="mb-2">
                      <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center relative">
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-gray-300"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - rate / 100)}`}
                            className={rate >= 90 ? 'text-green-500' : rate >= 80 ? 'text-yellow-500' : 'text-red-500'}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold">{rate}%</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">{level}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Distribution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">Smart Learning</h4>
                <p className="text-2xl font-bold text-blue-700">{metrics.byCourse.smartLearning}</p>
                <p className="text-xs text-blue-600">Group classes</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900">Smart Conversation</h4>
                <p className="text-2xl font-bold text-green-700">{metrics.byCourse.smartConversation}</p>
                <p className="text-xs text-green-600">Conversation focus</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900">Conversaciones</h4>
                <p className="text-2xl font-bold text-purple-700">{metrics.byCourse.conversaciones}</p>
                <p className="text-xs text-purple-600">Spanish program</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-medium text-orange-900">Private Lessons</h4>
                <p className="text-2xl font-bold text-orange-700">{metrics.byCourse.privateLessons}</p>
                <p className="text-xs text-orange-600">1-on-1 classes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Level Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* CEFR Levels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                CEFR Level Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(metrics.byLevel).map(([level, count]) => (
                  <div key={level} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{level}</Badge>
                      <span className="text-sm text-gray-600">Level</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(count / metrics.totalActive) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Internal Levels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Mindset Level Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(metrics.byInternalLevel).map(([level, count]) => (
                  <div key={level} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={
                          level === 'STARTER' ? 'bg-green-600' :
                          level === 'SURVIVOR' ? 'bg-blue-600' :
                          level === 'EXPLORER' ? 'bg-purple-600' :
                          'bg-orange-600'
                        }
                      >
                        {level}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            level === 'STARTER' ? 'bg-green-600' :
                            level === 'SURVIVOR' ? 'bg-blue-600' :
                            level === 'EXPLORER' ? 'bg-purple-600' :
                            'bg-orange-600'
                          }`}
                          style={{ width: `${(count / metrics.totalActive) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Contracts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Student Contracts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Student</th>
                    <th className="text-left py-2 px-4">Course</th>
                    <th className="text-left py-2 px-4">Level</th>
                    <th className="text-left py-2 px-4">Start Date</th>
                    <th className="text-left py-2 px-4">End Date</th>
                    <th className="text-left py-2 px-4">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.slice(0, 5).map((contract) => (
                    <tr key={contract.studentId} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{contract.studentName}</p>
                          {contract.company && (
                            <p className="text-xs text-gray-500">{contract.company}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">{contract.course}</td>
                      <td className="py-3 px-4">{contract.level}</td>
                      <td className="py-3 px-4">{format(new Date(contract.startDate), 'MMM d, yyyy')}</td>
                      <td className="py-3 px-4">{format(new Date(contract.endDate), 'MMM d, yyyy')}</td>
                      <td className="py-3 px-4">
                        <Badge variant={contract.company ? "default" : "secondary"}>
                          {contract.company ? 'B2B' : 'B2C'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Partner Companies */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Partner Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metrics.companies.map((company) => (
                <div key={company} className="p-4 bg-gray-50 rounded-lg text-center">
                  <Building2 className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                  <p className="font-medium text-sm">{company}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}