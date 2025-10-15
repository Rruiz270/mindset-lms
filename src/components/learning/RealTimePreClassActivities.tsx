'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BookOpen, 
  Clock, 
  Play, 
  CheckCircle, 
  Calendar,
  Users,
  Video,
  PenTool,
  Headphones,
  MessageSquare,
  AlertCircle,
  Plus,
  Info
} from 'lucide-react';
import { format, addDays, isToday, isBefore, startOfWeek, endOfWeek } from 'date-fns';
import { getTopicForDate, getUpcomingTopics } from '@/data/topics';
import { useRouter } from 'next/navigation';

interface ClassSchedule {
  id: string;
  date: string;
  topic: string;
  time: string;
  isToday: boolean;
  isPast: boolean;
  isBooked: boolean;
  teacher?: string;
  courseType: string;
}

interface PreClassExercise {
  id: string;
  title: string;
  type: 'vocabulary' | 'listening' | 'reading' | 'grammar' | 'pronunciation';
  duration: string;
  completed: boolean;
  icon: any;
}

interface RealTimePreClassActivitiesProps {
  studentLevel: 'STARTER' | 'SURVIVOR' | 'EXPLORER' | 'EXPERT';
  studentId: string;
}

export default function RealTimePreClassActivities({ studentLevel, studentId }: RealTimePreClassActivitiesProps) {
  const [selectedClass, setSelectedClass] = useState<ClassSchedule | null>(null);
  const [classSchedule, setClassSchedule] = useState<ClassSchedule[]>([]);
  const [preClassExercises, setPreClassExercises] = useState<PreClassExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const router = useRouter();

  // Fetch user's bookings and generate schedule
  useEffect(() => {
    fetchClassSchedule();
  }, [currentWeekStart, studentLevel]);

  // Generate exercises when a class is selected
  useEffect(() => {
    if (selectedClass) {
      generatePreClassExercises(selectedClass);
    }
  }, [selectedClass]);

  const fetchClassSchedule = async () => {
    setLoading(true);
    try {
      // TODO: Fetch actual bookings from API
      // For now, generate schedule based on topic system
      const schedule: ClassSchedule[] = [];
      const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
      const current = new Date(currentWeekStart);

      // Add current week and next week
      for (let i = 0; i < 14; i++) {
        const date = addDays(current, i);
        
        // Skip Sundays
        if (date.getDay() === 0) continue;
        
        const topic = getTopicForDate(date, studentLevel);
        if (topic) {
          schedule.push({
            id: `class-${date.toISOString()}`,
            date: date.toISOString(),
            topic: topic.name,
            time: '09:00', // Default morning time
            isToday: isToday(date),
            isPast: isBefore(date, new Date()) && !isToday(date),
            isBooked: Math.random() > 0.7, // Simulate some booked classes
            teacher: 'Teacher Demo',
            courseType: topic.courseType
          });
        }
      }

      setClassSchedule(schedule);

      // Auto-select today's class if available
      const todayClass = schedule.find(c => c.isToday && c.isBooked);
      if (todayClass) {
        setSelectedClass(todayClass);
      } else if (schedule.length > 0) {
        // Select first upcoming booked class
        const nextBooked = schedule.find(c => !c.isPast && c.isBooked);
        if (nextBooked) setSelectedClass(nextBooked);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePreClassExercises = (classItem: ClassSchedule) => {
    // Generate topic-specific exercises
    const exercises: PreClassExercise[] = [
      {
        id: 'vocab-1',
        title: 'Key Vocabulary',
        type: 'vocabulary',
        duration: '10 min',
        completed: classItem.isPast,
        icon: BookOpen
      },
      {
        id: 'listen-1',
        title: 'Listen and Understand',
        type: 'listening',
        duration: '15 min',
        completed: classItem.isPast && Math.random() > 0.3,
        icon: Headphones
      },
      {
        id: 'read-1',
        title: 'Reading Comprehension',
        type: 'reading',
        duration: '12 min',
        completed: false,
        icon: BookOpen
      },
      {
        id: 'grammar-1',
        title: 'Grammar Practice',
        type: 'grammar',
        duration: '10 min',
        completed: false,
        icon: PenTool
      },
      {
        id: 'speak-1',
        title: 'Pronunciation Practice',
        type: 'pronunciation',
        duration: '8 min',
        completed: false,
        icon: MessageSquare
      }
    ];

    setPreClassExercises(exercises);
  };

  const handleBookClass = (classItem: ClassSchedule) => {
    // Navigate to booking page with pre-selected date
    router.push(`/student/book?date=${classItem.date}&topic=${encodeURIComponent(classItem.topic)}`);
  };

  const handleJoinLiveClass = (classItem: ClassSchedule) => {
    // TODO: Integrate with Google Meet
    alert(`Join live class for: ${classItem.topic}\nTime: ${classItem.time}\nTeacher: ${classItem.teacher}\n\n(Google Meet integration coming soon!)`);
  };

  const handleStartExercise = (exercise: PreClassExercise) => {
    // Navigate to exercise page
    router.push(`/student/exercises/${selectedClass?.id}/${exercise.id}`);
  };

  const getClassStatusBadge = (classItem: ClassSchedule) => {
    if (classItem.isPast) {
      return <Badge variant="secondary">Completed</Badge>;
    }
    if (classItem.isToday) {
      return <Badge className="bg-green-600">Today's Class</Badge>;
    }
    if (!classItem.isBooked) {
      return <Badge variant="outline">Not Booked</Badge>;
    }
    return <Badge variant="default">Upcoming</Badge>;
  };

  const getExerciseTypeColor = (type: string) => {
    switch (type) {
      case 'vocabulary': return 'text-blue-600 bg-blue-50';
      case 'listening': return 'text-purple-600 bg-purple-50';
      case 'reading': return 'text-green-600 bg-green-50';
      case 'grammar': return 'text-orange-600 bg-orange-50';
      case 'pronunciation': return 'text-pink-600 bg-pink-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading class schedule...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Class Schedule */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Class Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
            {classSchedule.map((classItem) => (
              <Card 
                key={classItem.id}
                className={`cursor-pointer transition-all ${
                  selectedClass?.id === classItem.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:shadow-md'
                } ${classItem.isPast && !classItem.isBooked ? 'opacity-50' : ''}`}
                onClick={() => classItem.isBooked ? setSelectedClass(classItem) : null}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-1">{classItem.topic}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(classItem.date), 'MMM d')} at {classItem.time}</span>
                      </div>
                    </div>
                    {getClassStatusBadge(classItem)}
                  </div>

                  {classItem.isBooked ? (
                    <div className="flex items-center gap-1 text-xs mb-2">
                      {classItem.isPast ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <Calendar className="h-3 w-3 text-blue-600" />
                      )}
                      <span className="text-gray-700">Pre-class</span>
                      {classItem.isToday && (
                        <Badge variant="destructive" className="ml-2 text-xs">LIVE</Badge>
                      )}
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookClass(classItem);
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Book This Class
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
          >
            Previous Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/student/book')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Book More Classes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
          >
            Next Week
          </Button>
        </div>
      </div>

      {/* Right Column: Selected Class Details */}
      <div className="space-y-6">
        {selectedClass ? (
          <>
            {/* Class Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedClass.topic}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {format(new Date(selectedClass.date), 'EEEE, MMMM d')} at {selectedClass.time}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {/* Pre-Class */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-4 text-center">
                      <BookOpen className="h-6 w-6 mx-auto text-blue-600 mb-2" />
                      <h4 className="font-medium text-sm">Pre-Class</h4>
                      <p className="text-xs text-gray-600">Prepare for class</p>
                      {selectedClass.isPast && (
                        <CheckCircle className="h-4 w-4 mx-auto mt-2 text-green-600" />
                      )}
                    </CardContent>
                  </Card>

                  {/* Live Class */}
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-4 text-center">
                      <Video className="h-6 w-6 mx-auto text-green-600 mb-2" />
                      <h4 className="font-medium text-sm">Live Class</h4>
                      <p className="text-xs text-gray-600">Join the session</p>
                      {selectedClass.isToday && (
                        <Button
                          size="sm"
                          className="mt-2 h-8 text-xs"
                          onClick={() => handleJoinLiveClass(selectedClass)}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Join Live
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  {/* Post-Class */}
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="pt-4 text-center">
                      <PenTool className="h-6 w-6 mx-auto text-purple-600 mb-2" />
                      <h4 className="font-medium text-sm">Post-Class</h4>
                      <p className="text-xs text-gray-600">Homework & review</p>
                      {selectedClass.isPast && (
                        <span className="text-xs text-gray-500 mt-2 block">Available</span>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Pre-Class Exercises */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pre-Class Exercises</CardTitle>
                <p className="text-sm text-gray-600">
                  Complete these before joining the live class
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {preClassExercises.map((exercise) => {
                  const ExerciseIcon = exercise.icon;
                  return (
                    <Card 
                      key={exercise.id}
                      className={`${exercise.completed ? 'bg-gray-50' : 'hover:shadow-md cursor-pointer'}`}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${getExerciseTypeColor(exercise.type)}`}>
                              <ExerciseIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{exercise.title}</h4>
                              <p className="text-xs text-gray-600">{exercise.duration}</p>
                            </div>
                          </div>
                          {exercise.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Button 
                              size="sm"
                              onClick={() => handleStartExercise(exercise)}
                              disabled={selectedClass.isPast}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Start
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Info className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="font-medium text-lg mb-2">No Class Selected</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select a booked class from the schedule to view exercises and details
                </p>
                <Button onClick={() => router.push('/student/book')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Book Your First Class
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}