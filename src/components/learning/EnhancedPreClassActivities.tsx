'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  MessageSquare
} from 'lucide-react';
import { format, addDays, isToday, isBefore } from 'date-fns';

interface TopicSchedule {
  id: string;
  name: string;
  date: string;
  time: string;
  isToday: boolean;
  isPast: boolean;
  preClassCompleted: boolean;
  liveClassStatus: 'upcoming' | 'live' | 'completed';
  postClassAvailable: boolean;
  postClassCompleted: boolean;
}

interface PreClassExercise {
  id: string;
  title: string;
  type: 'reading' | 'writing' | 'listening' | 'speaking' | 'grammar' | 'vocabulary';
  duration: string;
  completed: boolean;
}

interface EnhancedPreClassActivitiesProps {
  studentLevel: string;
}

export default function EnhancedPreClassActivities({ studentLevel }: EnhancedPreClassActivitiesProps) {
  const [selectedTopic, setSelectedTopic] = useState<TopicSchedule | null>(null);
  const [topicSchedule, setTopicSchedule] = useState<TopicSchedule[]>([]);
  const [preClassExercises, setPreClassExercises] = useState<PreClassExercise[]>([]);

  useEffect(() => {
    generateTopicSchedule();
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      generatePreClassExercises(selectedTopic);
    }
  }, [selectedTopic]);

  const generateTopicSchedule = () => {
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

    const schedule: TopicSchedule[] = [];
    const startDate = new Date();

    for (let i = 0; i < 14; i++) {
      const date = addDays(startDate, i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const topicDate = format(date, 'yyyy-MM-dd');
      const isTopicToday = isToday(date);
      const isTopicPast = isBefore(date, new Date()) && !isTopicToday;
      
      schedule.push({
        id: `topic-${i}`,
        name: topics[i % topics.length],
        date: topicDate,
        time: '09:00',
        isToday: isTopicToday,
        isPast: isTopicPast,
        preClassCompleted: isTopicPast || (isTopicToday && Math.random() > 0.5),
        liveClassStatus: isTopicPast ? 'completed' : isTopicToday ? 'live' : 'upcoming',
        postClassAvailable: isTopicPast,
        postClassCompleted: isTopicPast && Math.random() > 0.3
      });
    }

    setTopicSchedule(schedule);
    
    // Auto-select today's topic or the next upcoming one
    const todayTopic = schedule.find(t => t.isToday);
    const nextTopic = schedule.find(t => !t.isPast && !t.isToday);
    setSelectedTopic(todayTopic || nextTopic || schedule[0]);
  };

  const generatePreClassExercises = (topic: TopicSchedule) => {
    const exercises: PreClassExercise[] = [
      {
        id: 'vocab-1',
        title: 'Key Vocabulary',
        type: 'vocabulary',
        duration: '10 min',
        completed: Math.random() > 0.5
      },
      {
        id: 'listening-1', 
        title: 'Listen and Understand',
        type: 'listening',
        duration: '15 min',
        completed: Math.random() > 0.5
      },
      {
        id: 'reading-1',
        title: 'Reading Comprehension',
        type: 'reading', 
        duration: '12 min',
        completed: Math.random() > 0.5
      },
      {
        id: 'grammar-1',
        title: 'Grammar Practice',
        type: 'grammar',
        duration: '8 min',
        completed: Math.random() > 0.5
      }
    ];

    setPreClassExercises(exercises);
  };

  const getExerciseIcon = (type: string) => {
    switch (type) {
      case 'reading': return BookOpen;
      case 'writing': return PenTool;
      case 'listening': return Headphones;
      case 'speaking': return MessageSquare;
      case 'grammar': return BookOpen;
      case 'vocabulary': return BookOpen;
      default: return BookOpen;
    }
  };

  const getExerciseColor = (type: string) => {
    switch (type) {
      case 'reading': return 'text-blue-600 bg-blue-50';
      case 'writing': return 'text-green-600 bg-green-50';
      case 'listening': return 'text-purple-600 bg-purple-50';
      case 'speaking': return 'text-orange-600 bg-orange-50';
      case 'grammar': return 'text-red-600 bg-red-50';
      case 'vocabulary': return 'text-cyan-600 bg-cyan-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Topic Schedule */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Class Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topicSchedule.map((topic) => (
              <div
                key={topic.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedTopic?.id === topic.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                } ${topic.isToday ? 'ring-2 ring-blue-200' : ''}`}
                onClick={() => setSelectedTopic(topic)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium line-clamp-2">{topic.name}</h4>
                  {topic.isToday && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                      Today
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                  <Clock className="h-3 w-3" />
                  <span>{format(new Date(topic.date), 'MMM d')} at {topic.time}</span>
                </div>

                <div className="flex items-center gap-2">
                  {topic.preClassCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                  )}
                  <span className="text-xs">Pre-class</span>
                  
                  {topic.liveClassStatus === 'live' && (
                    <Badge variant="destructive" className="text-xs ml-auto">
                      LIVE
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Selected Topic Details */}
      <div className="lg:col-span-2 space-y-6">
        {selectedTopic && (
          <>
            {/* Topic Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedTopic.name}</CardTitle>
                    <p className="text-gray-600 mt-1">
                      {format(new Date(selectedTopic.date), 'EEEE, MMM d')} at {selectedTopic.time}
                    </p>
                  </div>
                  {selectedTopic.isToday && (
                    <Badge className="bg-blue-600">Today's Class</Badge>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Pre-Class Activities */}
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">Pre-Class</h3>
                      <p className="text-sm text-blue-700">Prepare for class</p>
                    </div>
                  </div>
                  {selectedTopic.preClassCompleted ? (
                    <Badge variant="secondary" className="w-full justify-center">
                      ✓ Completed
                    </Badge>
                  ) : (
                    <p className="text-xs text-blue-600 mb-3">4 exercises • ~30 min</p>
                  )}
                </CardContent>
              </Card>

              {/* Live Class */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Video className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900">Live Class</h3>
                      <p className="text-sm text-green-700">Join the session</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full"
                    disabled={selectedTopic.liveClassStatus !== 'live'}
                    onClick={() => selectedTopic.liveClassStatus === 'live' && window.open(`/live-class/${selectedTopic.id}`, '_blank')}
                  >
                    {selectedTopic.liveClassStatus === 'live' ? (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Join Live Class
                      </>
                    ) : selectedTopic.liveClassStatus === 'completed' ? (
                      'Class Completed'
                    ) : (
                      `Starts at ${selectedTopic.time}`
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Post-Class */}
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <PenTool className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-900">Post-Class</h3>
                      <p className="text-sm text-purple-700">Homework & review</p>
                    </div>
                  </div>
                  {!selectedTopic.postClassAvailable ? (
                    <p className="text-xs text-purple-600">Available after class</p>
                  ) : selectedTopic.postClassCompleted ? (
                    <Badge variant="secondary" className="w-full justify-center">
                      ✓ Completed
                    </Badge>
                  ) : (
                    <Button variant="outline" size="sm" className="w-full">
                      Start Homework
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Pre-Class Exercises Detail */}
            <Card>
              <CardHeader>
                <CardTitle>Pre-Class Exercises</CardTitle>
                <p className="text-sm text-gray-600">
                  Complete these before joining the live class
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {preClassExercises.map((exercise) => {
                  const Icon = getExerciseIcon(exercise.type);
                  const colorClass = getExerciseColor(exercise.type);
                  
                  return (
                    <div 
                      key={exercise.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${colorClass}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">{exercise.title}</h4>
                          <p className="text-sm text-gray-600">{exercise.duration}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {exercise.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Button size="sm">
                            <Play className="h-4 w-4 mr-2" />
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}