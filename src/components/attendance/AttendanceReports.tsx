'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users,
  Calendar,
  Download,
  Filter,
  Search,
  UserCheck,
  UserX,
  Clock,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface AttendanceRecord {
  id: string;
  studentName: string;
  studentEmail: string;
  level: string;
  course: string;
  topic: string;
  scheduledAt: string;
  joinedAt: string | null;
  leftAt: string | null;
  duration: number; // minutes
  status: 'present' | 'absent' | 'late' | 'left_early';
  teacherName: string;
  action: string;
}

interface AttendanceStats {
  totalClasses: number;
  attendedClasses: number;
  attendanceRate: number;
  lateCount: number;
  leftEarlyCount: number;
  perfectAttendance: number;
  averageDuration: number;
}

interface AttendanceReportsProps {
  isAdmin?: boolean;
  teacherId?: string;
}

export default function AttendanceReports({ isAdmin = false, teacherId }: AttendanceReportsProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalClasses: 0,
    attendedClasses: 0,
    attendanceRate: 0,
    lateCount: 0,
    leftEarlyCount: 0,
    perfectAttendance: 0,
    averageDuration: 0
  });
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateRange, setDateRange] = useState('this_month');

  useEffect(() => {
    fetchAttendanceRecords();
  }, [teacherId, dateRange]);

  useEffect(() => {
    applyFilters();
  }, [records, searchTerm, selectedCourse, selectedLevel, selectedStatus]);

  const fetchAttendanceRecords = async () => {
    try {
      // TODO: Replace with actual API call
      // Mock data for demonstration
      const mockRecords: AttendanceRecord[] = [
        {
          id: '1',
          studentName: 'John Doe',
          studentEmail: 'john@email.com',
          level: 'A2',
          course: 'Smart Learning',
          topic: 'Shopping: How Much Is It?',
          scheduledAt: '2024-01-09T09:00:00Z',
          joinedAt: '2024-01-09T09:02:00Z',
          leftAt: '2024-01-09T09:58:00Z',
          duration: 56,
          status: 'present',
          teacherName: 'Sarah Johnson',
          action: 'joined'
        },
        {
          id: '2',
          studentName: 'Jane Smith',
          studentEmail: 'jane@email.com',
          level: 'A2',
          course: 'Smart Learning',
          topic: 'Shopping: How Much Is It?',
          scheduledAt: '2024-01-09T09:00:00Z',
          joinedAt: '2024-01-09T09:05:00Z',
          leftAt: '2024-01-09T09:45:00Z',
          duration: 40,
          status: 'left_early',
          teacherName: 'Sarah Johnson',
          action: 'joined'
        },
        {
          id: '3',
          studentName: 'Carlos Rodriguez',
          studentEmail: 'carlos@email.com',
          level: 'B1',
          course: 'Smart Conversation',
          topic: 'Travel: Getting Around',
          scheduledAt: '2024-01-08T14:00:00Z',
          joinedAt: null,
          leftAt: null,
          duration: 0,
          status: 'absent',
          teacherName: 'Sarah Johnson',
          action: 'marked_absent'
        },
        {
          id: '4',
          studentName: 'Maria Lopez',
          studentEmail: 'maria@email.com',
          level: 'B1',
          course: 'Smart Conversation',
          topic: 'Travel: Getting Around',
          scheduledAt: '2024-01-08T14:00:00Z',
          joinedAt: '2024-01-08T14:08:00Z',
          leftAt: '2024-01-08T15:00:00Z',
          duration: 52,
          status: 'late',
          teacherName: 'Sarah Johnson',
          action: 'joined'
        },
        {
          id: '5',
          studentName: 'David Wilson',
          studentEmail: 'david@email.com',
          level: 'C1',
          course: 'Private Lessons',
          topic: 'Business English: Presentations',
          scheduledAt: '2024-01-07T16:30:00Z',
          joinedAt: '2024-01-07T16:30:00Z',
          leftAt: '2024-01-07T17:30:00Z',
          duration: 60,
          status: 'present',
          teacherName: 'Sarah Johnson',
          action: 'joined'
        }
      ];

      setRecords(mockRecords);
      
      // Calculate stats
      const totalClasses = mockRecords.length;
      const attendedClasses = mockRecords.filter(r => r.status !== 'absent').length;
      const attendanceRate = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;
      const lateCount = mockRecords.filter(r => r.status === 'late').length;
      const leftEarlyCount = mockRecords.filter(r => r.status === 'left_early').length;
      const perfectAttendance = mockRecords.filter(r => r.status === 'present' && r.duration >= 55).length;
      const averageDuration = mockRecords.filter(r => r.duration > 0).reduce((sum, r) => sum + r.duration, 0) / 
                             Math.max(1, mockRecords.filter(r => r.duration > 0).length);

      setStats({
        totalClasses,
        attendedClasses,
        attendanceRate,
        lateCount,
        leftEarlyCount,
        perfectAttendance,
        averageDuration: Math.round(averageDuration)
      });
      
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = records;

    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.topic.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCourse) {
      filtered = filtered.filter(record => record.course === selectedCourse);
    }

    if (selectedLevel) {
      filtered = filtered.filter(record => record.level === selectedLevel);
    }

    if (selectedStatus) {
      filtered = filtered.filter(record => record.status === selectedStatus);
    }

    setFilteredRecords(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-600';
      case 'late': return 'bg-yellow-600';
      case 'left_early': return 'bg-orange-600';
      case 'absent': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return UserCheck;
      case 'late': return Clock;
      case 'left_early': return AlertTriangle;
      case 'absent': return UserX;
      default: return Users;
    }
  };

  const exportToCSV = () => {
    const headers = ['Student Name', 'Email', 'Level', 'Course', 'Topic', 'Scheduled At', 'Joined At', 'Left At', 'Duration (min)', 'Status', 'Teacher'];
    const csvData = filteredRecords.map(record => [
      record.studentName,
      record.studentEmail,
      record.level,
      record.course,
      record.topic,
      format(new Date(record.scheduledAt), 'yyyy-MM-dd HH:mm'),
      record.joinedAt ? format(new Date(record.joinedAt), 'yyyy-MM-dd HH:mm') : 'N/A',
      record.leftAt ? format(new Date(record.leftAt), 'yyyy-MM-dd HH:mm') : 'N/A',
      record.duration,
      record.status,
      record.teacherName
    ]);

    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-gray-500">Loading attendance reports...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-blue-700">{stats.attendanceRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-green-600">Perfect Attendance</p>
                <p className="text-2xl font-bold text-green-700">{stats.perfectAttendance}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-yellow-600">Late Arrivals</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.lateCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600">Avg Duration</p>
                <p className="text-2xl font-bold text-purple-700">{stats.averageDuration}m</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Attendance Records
            </CardTitle>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search students, topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Courses</SelectItem>
                <SelectItem value="Smart Learning">Smart Learning</SelectItem>
                <SelectItem value="Smart Conversation">Smart Conversation</SelectItem>
                <SelectItem value="Conversaciones">Conversaciones</SelectItem>
                <SelectItem value="Private Lessons">Private Lessons</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                <SelectItem value="A1">A1</SelectItem>
                <SelectItem value="A2">A2</SelectItem>
                <SelectItem value="B1">B1</SelectItem>
                <SelectItem value="B2">B2</SelectItem>
                <SelectItem value="C1">C1</SelectItem>
                <SelectItem value="C2">C2</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="left_early">Left Early</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Records Table */}
          <div className="space-y-3">
            <div className="text-sm text-gray-600 mb-3">
              Showing {filteredRecords.length} of {records.length} records
            </div>
            
            {filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No attendance records found matching your criteria
              </div>
            ) : (
              filteredRecords.map((record) => {
                const StatusIcon = getStatusIcon(record.status);
                
                return (
                  <Card key={record.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`h-5 w-5 ${
                              record.status === 'present' ? 'text-green-600' :
                              record.status === 'late' ? 'text-yellow-600' :
                              record.status === 'left_early' ? 'text-orange-600' :
                              'text-red-600'
                            }`} />
                            <div>
                              <h4 className="font-medium">{record.studentName}</h4>
                              <p className="text-sm text-gray-600">{record.studentEmail}</p>
                            </div>
                          </div>
                          
                          <Badge variant="outline">{record.level}</Badge>
                          <Badge className={getStatusColor(record.status)}>
                            {record.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Course:</span>
                            <p className="font-medium">{record.course}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Topic:</span>
                            <p className="font-medium">{record.topic}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Scheduled:</span>
                            <p className="font-medium">{format(new Date(record.scheduledAt), 'MMM d, HH:mm')}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Duration:</span>
                            <p className="font-medium">{record.duration}m</p>
                          </div>
                        </div>
                        
                        {record.joinedAt && (
                          <div className="mt-2 text-sm text-gray-600">
                            Joined: {format(new Date(record.joinedAt), 'HH:mm')}
                            {record.leftAt && ` • Left: ${format(new Date(record.leftAt), 'HH:mm')}`}
                          </div>
                        )}
                        
                        {isAdmin && (
                          <div className="mt-2 text-sm text-gray-600">
                            Teacher: {record.teacherName}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}