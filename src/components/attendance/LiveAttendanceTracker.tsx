'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  LogOut,
  LogIn,
  Timer
} from 'lucide-react';
import { format } from 'date-fns';

interface StudentAttendance {
  student: {
    id: string;
    name: string;
    email: string;
    level: string;
  };
  status: 'present' | 'absent' | 'left';
  joinedAt: string | null;
  leftAt: string | null;
  duration: number; // minutes
  events: {
    action: string;
    timestamp: string;
  }[];
}

interface AttendanceData {
  booking: {
    id: string;
    scheduledAt: string;
    topic: string;
    status: string;
  };
  attendance: StudentAttendance[];
  summary: {
    totalExpected: number;
    present: number;
    absent: number;
    left: number;
  };
}

interface LiveAttendanceTrackerProps {
  bookingId: string;
  isTeacher?: boolean;
  autoRefresh?: boolean;
}

export default function LiveAttendanceTracker({ 
  bookingId, 
  isTeacher = false, 
  autoRefresh = true 
}: LiveAttendanceTrackerProps) {
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchAttendance();

    if (autoRefresh) {
      const interval = setInterval(fetchAttendance, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [bookingId, autoRefresh]);

  const fetchAttendance = async () => {
    try {
      const response = await fetch(`/api/attendance/live?bookingId=${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setAttendanceData(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (studentId: string, action: 'marked_present' | 'marked_absent') => {
    try {
      const response = await fetch('/api/attendance/live', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          studentId,
          action,
          timestamp: new Date().toISOString(),
          source: 'manual'
        }),
      });

      if (response.ok) {
        fetchAttendance(); // Refresh data
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-600';
      case 'left': return 'bg-yellow-600';
      case 'absent': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return UserCheck;
      case 'left': return LogOut;
      case 'absent': return UserX;
      default: return Users;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-gray-500">Loading attendance...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!attendanceData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No attendance data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Class Info Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Live Attendance Tracking
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {attendanceData.booking.topic} • {format(new Date(attendanceData.booking.scheduledAt), 'PPp')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Last updated: {format(lastUpdated, 'HH:mm:ss')}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchAttendance}
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Attendance Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Expected</p>
                <p className="text-lg font-semibold">{attendanceData.summary.totalExpected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-lg font-semibold text-green-600">{attendanceData.summary.present}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <LogOut className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Left Early</p>
                <p className="text-lg font-semibold text-yellow-600">{attendanceData.summary.left}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserX className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-lg font-semibold text-red-600">{attendanceData.summary.absent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle>Student Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {attendanceData.attendance.map((attendance) => {
              const StatusIcon = getStatusIcon(attendance.status);
              
              return (
                <div key={attendance.student.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-5 w-5 ${
                        attendance.status === 'present' ? 'text-green-600' :
                        attendance.status === 'left' ? 'text-yellow-600' :
                        'text-red-600'
                      }`} />
                      <div>
                        <h4 className="font-medium">{attendance.student.name}</h4>
                        <p className="text-sm text-gray-600">{attendance.student.email}</p>
                      </div>
                    </div>
                    
                    <Badge 
                      className={getStatusColor(attendance.status)}
                      variant="secondary"
                    >
                      {attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1)}
                    </Badge>
                    
                    <Badge variant="outline">{attendance.student.level}</Badge>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Time Info */}
                    <div className="text-right text-sm">
                      {attendance.joinedAt && (
                        <div className="flex items-center gap-1 text-green-600">
                          <LogIn className="h-3 w-3" />
                          <span>Joined: {format(new Date(attendance.joinedAt), 'HH:mm')}</span>
                        </div>
                      )}
                      {attendance.leftAt && (
                        <div className="flex items-center gap-1 text-yellow-600">
                          <LogOut className="h-3 w-3" />
                          <span>Left: {format(new Date(attendance.leftAt), 'HH:mm')}</span>
                        </div>
                      )}
                      {attendance.duration > 0 && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <Timer className="h-3 w-3" />
                          <span>{attendance.duration}m</span>
                        </div>
                      )}
                    </div>

                    {/* Manual Attendance Buttons for Teachers */}
                    {isTeacher && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAttendance(attendance.student.id, 'marked_present')}
                          disabled={attendance.status === 'present'}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Present
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAttendance(attendance.student.id, 'marked_absent')}
                          disabled={attendance.status === 'absent'}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Absent
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Timeline (for detailed view) */}
      {isTeacher && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {attendanceData.attendance
                .filter(a => a.events.length > 0)
                .flatMap(a => 
                  a.events.map(event => ({
                    ...event,
                    studentName: a.student.name,
                    studentId: a.student.id
                  }))
                )
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 10) // Show last 10 events
                .map((event, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 text-sm">
                    <Badge variant="outline" className="text-xs">
                      {format(new Date(event.timestamp), 'HH:mm:ss')}
                    </Badge>
                    <span className="font-medium">{event.studentName}</span>
                    <Badge 
                      className={
                        event.action.includes('joined') ? 'bg-green-600' :
                        event.action.includes('left') ? 'bg-yellow-600' :
                        event.action.includes('absent') ? 'bg-red-600' :
                        'bg-blue-600'
                      }
                      variant="secondary"
                    >
                      {event.action}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}