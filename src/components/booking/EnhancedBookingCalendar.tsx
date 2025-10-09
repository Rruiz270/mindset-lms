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
  teacherName: string;
  studentsBooked: number;
  maxStudents: number;
  level: string;
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

  // Generate next 30 days of mock class sessions
  useEffect(() => {
    generateMockSessions();
  }, []);

  const generateMockSessions = () => {
    const sessions: ClassSession[] = [];
    const startDate = new Date();
    
    // Sample topics for different days
    const topics = [
      'Shopping: How Much Is It?',
      'Food: What\'s for Lunch?', 
      'Health: How Are You Feeling?',
      'Work: What Do You Do?',
      'Travel: Getting Around',
      'People: Meet My Family',
      'Entertainment: TV Shows',
      'School: In the Classroom',
      'Time: My Daily Routine',
      'Hobbies: Free Time Activities'
    ];

    for (let i = 0; i < 30; i++) {
      const date = addDays(startDate, i);
      
      // Skip weekends for now
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // Morning class
      sessions.push({
        id: `morning-${i}`,
        date: format(date, 'yyyy-MM-dd'),
        time: '09:00',
        topic: topics[i % topics.length],
        teacherName: i % 3 === 0 ? 'Sarah Johnson' : i % 3 === 1 ? 'Mike Wilson' : 'Anna Garcia',
        studentsBooked: Math.floor(Math.random() * 8) + 1,
        maxStudents: 10,
        level: studentLevel
      });

      // Evening class
      sessions.push({
        id: `evening-${i}`,
        date: format(date, 'yyyy-MM-dd'),
        time: '19:00',
        topic: topics[(i + 5) % topics.length],
        teacherName: i % 2 === 0 ? 'David Brown' : 'Lisa Chen',
        studentsBooked: Math.floor(Math.random() * 6) + 2,
        maxStudents: 10,
        level: studentLevel
      });
    }
    
    setClassSessions(sessions);
  };

  const handleBookClass = async (session: ClassSession) => {
    setLoading(true);
    try {
      // Simulate booking API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the session to show increased student count
      setClassSessions(prev => prev.map(s => 
        s.id === session.id 
          ? { ...s, studentsBooked: s.studentsBooked + 1 }
          : s
      ));
      
      alert(`Successfully booked: ${session.topic} on ${format(new Date(session.date), 'MMM d')} at ${session.time}`);
      onBookingComplete?.();
    } catch (error) {
      alert('Failed to book class. Please try again.');
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
                            {session.studentsBooked}/{session.maxStudents}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {session.topic}
                        </h4>
                        <p className="text-xs text-gray-600">
                          Teacher: {session.teacherName}
                        </p>
                      </div>
                      
                      <Button 
                        size="sm" 
                        className="w-full text-xs"
                        disabled={isPast || session.studentsBooked >= session.maxStudents || loading}
                        onClick={() => handleBookClass(session)}
                      >
                        {session.studentsBooked >= session.maxStudents ? 'Full' : 'Book Class'}
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