'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore } from 'date-fns';

interface ClassSession {
  id: string;
  date: string;
  time: string;
  topic: string;
  teacher: {
    id: string;
    name: string;
  };
  capacity: number;
  enrolled: number;
  available: number;
  level: string;
  courseType: string;
}

interface EnhancedBookingCalendarProps {
  studentLevel: string;
  onBookingComplete?: () => void;
}

export default function EnhancedBookingCalendar({ studentLevel, onBookingComplete }: EnhancedBookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [classSessions, setClassSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch real class sessions from API
  useEffect(() => {
    fetchAvailableClasses();
  }, [currentDate]);

  const fetchAvailableClasses = async () => {
    setLoading(true);
    try {
      // Calculate date range (current month + next month)
      const startDate = startOfMonth(currentDate);
      const endDate = endOfMonth(addDays(currentDate, 60)); // Next 2 months

      // Format dates as YYYY-MM-DD to avoid timezone issues
      const formatDate = (date: Date) => {
        return date.getFullYear() + '-' + 
               String(date.getMonth() + 1).padStart(2, '0') + '-' + 
               String(date.getDate()).padStart(2, '0');
      };

      const response = await fetch(
        `/api/student/available-classes?startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setClassSessions(data.classes);
        } else {
          console.error('Failed to fetch classes:', data.error);
          // Fallback to empty array
          setClassSessions([]);
        }
      } else {
        console.error('API request failed:', response.status);
        setClassSessions([]);
      }
    } catch (error) {
      console.error('Error fetching available classes:', error);
      setClassSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClass = async (session: ClassSession) => {
    setLoading(true);
    try {
      // TODO: Implement actual booking API call when ready
      // For now, simulate the booking
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the session to show increased enrollment
      setClassSessions(prev => prev.map(s => 
        s.id === session.id 
          ? { 
              ...s, 
              enrolled: s.enrolled + 1,
              available: s.available - 1
            }
          : s
      ));
      
      alert(`✅ Successfully booked!\n\nTopic: ${session.topic}\nCourse: ${session.courseType}\nDate: ${format(new Date(session.date), 'MMM d, yyyy')}\nTime: ${session.time}\nTeacher: ${session.teacher.name}\n\nRemaining spots: ${session.available - 1}`);
      onBookingComplete?.();
    } catch (error) {
      alert('❌ Failed to book class. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => {
    setCurrentDate(prev => addDays(prev, 30));
  };

  const prevMonth = () => {
    setCurrentDate(prev => addDays(prev, -30));
  };

  const getDaysInView = () => {
    const start = currentDate;
    const end = addDays(start, 29); // 30 days
    return eachDayOfInterval({ start, end });
  };

  const getSessionsForDate = (date: Date) => {
    return classSessions.filter(session => 
      isSameDay(new Date(session.date), date)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Available Classes - {studentLevel} Level
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Select a class to book for the next 30 days
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[200px] text-center">
                {format(currentDate, 'MMM d')} - {format(addDays(currentDate, 29), 'MMM d, yyyy')}
              </span>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {getDaysInView().map((date) => {
          const sessions = getSessionsForDate(date);
          const isPast = isBefore(date, new Date()) && !isToday(date);
          
          return (
            <Card 
              key={date.toISOString()} 
              className={`${isToday(date) ? 'ring-2 ring-blue-500' : ''} ${isPast ? 'opacity-50' : ''}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {format(date, 'MMM d')}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {format(date, 'EEEE')}
                    </p>
                  </div>
                  {isToday(date) && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Today
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {sessions.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">
                    No classes scheduled
                  </p>
                ) : (
                  sessions.map((session) => (
                    <div 
                      key={session.id}
                      className="border rounded-lg p-3 space-y-2 bg-gradient-to-br from-blue-50 to-cyan-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-blue-600" />
                          <span className="text-sm font-medium">{session.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-700">
                            {session.enrolled}/{session.capacity}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {session.topic}
                        </h4>
                        <p className="text-xs text-gray-600">
                          Teacher: {session.teacher.name}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {session.courseType}
                        </Badge>
                      </div>
                      
                      <Button 
                        size="sm" 
                        className="w-full text-xs"
                        disabled={isPast || session.available <= 0 || loading}
                        onClick={() => handleBookClass(session)}
                      >
                        {session.available <= 0 ? 'Full' : `Book Class (${session.available} spots)`}
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 border border-blue-500 rounded"></div>
              <span>Available Classes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-100 border border-red-500 rounded"></div>
              <span>Fully Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-100 border border-gray-400 rounded"></div>
              <span>Past Classes</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3 text-green-600" />
              <span>Students Booked / Max Capacity</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}