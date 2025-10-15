'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, BookOpen } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import axios from 'axios';

interface TimeSlot {
  teacherId: string;
  teacherName: string;
  dateTime: string;
  available: boolean;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface Topic {
  id: string;
  name: string;
  level: string;
}

interface BookingCalendarProps {
  studentLevel: string;
  onBookingComplete?: () => void;
}

export default function BookingCalendar({ studentLevel, onBookingComplete }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchTeachers();
    fetchTopics();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate, selectedTeacher]);

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('/api/teachers');
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await axios.get(`/api/topics?level=${studentLevel}`);
      setTopics(response.data);
      if (response.data.length > 0) {
        setSelectedTopic(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
      
      const params = new URLSearchParams({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
      
      if (selectedTeacher) {
        params.append('teacherId', selectedTeacher);
      }

      const response = await axios.get(`/api/bookings/available-slots?${params}`);
      setTimeSlots(response.data);
    } catch (error) {
      console.error('Error fetching available slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (slot: TimeSlot) => {
    if (!selectedTopic) {
      alert('Please select a topic');
      return;
    }

    setBooking(true);
    try {
      await axios.post('/api/bookings', {
        teacherId: slot.teacherId,
        topicId: selectedTopic,
        scheduledAt: slot.dateTime,
      });
      
      alert('Class booked successfully!');
      fetchAvailableSlots();
      
      if (onBookingComplete) {
        onBookingComplete();
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to book class');
    } finally {
      setBooking(false);
    }
  };

  const getDaySlots = (dayDate: Date) => {
    const dayStart = new Date(dayDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayDate);
    dayEnd.setHours(23, 59, 59, 999);

    return timeSlots.filter(slot => {
      const slotDate = new Date(slot.dateTime);
      return slotDate >= dayStart && slotDate <= dayEnd;
    });
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), i);
    return {
      date,
      dayName: format(date, 'EEE'),
      dayNumber: format(date, 'd'),
      isToday: format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'),
    };
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Book a Class</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Topic</label>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Teacher</label>
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger>
                  <SelectValue placeholder="All teachers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All teachers</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(addDays(selectedDate, -7))}
            >
              Previous Week
            </Button>
            <span className="text-sm font-medium">
              {format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d')} - {format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(addDays(selectedDate, 7))}
            >
              Next Week
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">Loading available slots...</div>
          ) : (
            <div className="grid grid-cols-7 divide-x">
              {weekDays.map((day) => (
                <div key={day.date.toISOString()} className="min-h-[400px]">
                  <div className={`p-3 text-center border-b ${
                    day.isToday ? 'bg-blue-50' : ''
                  }`}>
                    <div className="text-sm font-medium">{day.dayName}</div>
                    <div className={`text-lg ${
                      day.isToday ? 'font-bold text-blue-600' : ''
                    }`}>
                      {day.dayNumber}
                    </div>
                  </div>
                  <div className="p-2 space-y-2">
                    {getDaySlots(day.date).map((slot) => (
                      <div
                        key={`${slot.teacherId}-${slot.dateTime}`}
                        className={`p-2 rounded text-xs ${
                          slot.available
                            ? 'bg-green-50 hover:bg-green-100 cursor-pointer'
                            : 'bg-gray-50 opacity-50'
                        }`}
                      >
                        <div className="font-medium">
                          {format(new Date(slot.dateTime), 'HH:mm')}
                        </div>
                        <div className="text-gray-600 truncate">
                          {slot.teacherName}
                        </div>
                        {slot.available ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full mt-1 h-6 text-xs"
                            onClick={() => handleBooking(slot)}
                            disabled={booking}
                          >
                            Book
                          </Button>
                        ) : (
                          <div className="text-red-600 mt-1">Full</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}