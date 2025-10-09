'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Users, 
  Mic, 
  MicOff,
  Video,
  VideoOff,
  Share,
  HelpCircle,
  Clock,
  BookOpen,
  Image,
  FileText,
  Headphones,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Settings
} from 'lucide-react';

interface LiveClassSlide {
  id: string;
  title: string;
  type: 'intro' | 'vocabulary' | 'grammar' | 'communication' | 'review';
  content: {
    text?: string;
    image?: string;
    audio?: string;
    video?: string;
    exercises?: any[];
  };
  notes: string;
}

interface LiveClassTopic {
  id: string;
  name: string;
  level: string;
  slides: LiveClassSlide[];
  lessonPlan: string;
  objectives: string[];
  materials: string[];
}

export default function LiveClassPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const topicId = params.topicId as string;

  const [topic, setTopic] = useState<LiveClassTopic | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [classStarted, setClassStarted] = useState(false);
  const [classTimer, setClassTimer] = useState(0);
  const [attendees, setAttendees] = useState(5); // Mock attendee count
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [showLessonPlan, setShowLessonPlan] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Generate mock topic data
    const mockTopic: LiveClassTopic = {
      id: topicId,
      name: 'Shopping: How Much Is It?',
      level: 'STARTER',
      lessonPlan: `
LESSON PLAN - Shopping: How Much Is It? (60 minutes)

🎯 OBJECTIVES:
- Students will learn numbers 1-100
- Students will practice asking about prices
- Students will use "How much is/are...?" structure
- Students will practice shopping vocabulary

📝 MATERIALS NEEDED:
- Price tags with different amounts
- Shopping items (real or pictures)
- Audio recordings of prices
- Interactive exercises

⏰ TIMING:
00-10 min: Warm-up and review
10-20 min: Vocabulary introduction
20-35 min: Grammar practice
35-50 min: Communication activity
50-60 min: Review and homework

💡 TEACHING TIPS:
- Use real prices from local stores
- Encourage students to practice numbers
- Role-play shopping scenarios
- Correct pronunciation gently
      `,
      objectives: [
        'Learn numbers 1-100',
        'Practice shopping vocabulary',
        'Use "How much?" questions',
        'Role-play shopping scenarios'
      ],
      materials: [
        'Price tags and shopping items',
        'Audio recordings',
        'Interactive whiteboard',
        'Student worksheets'
      ],
      slides: [
        {
          id: 'slide-1',
          title: 'Welcome & Warm-up',
          type: 'intro',
          content: {
            text: 'Welcome to today\'s class about shopping and prices!',
            image: '/shopping-intro.jpg'
          },
          notes: 'Start with a warm greeting. Ask students about their last shopping experience.'
        },
        {
          id: 'slide-2', 
          title: 'Shopping Vocabulary',
          type: 'vocabulary',
          content: {
            text: 'Key shopping words: store, price, money, buy, sell, expensive, cheap',
            exercises: [
              { type: 'match', content: 'Match the word to the picture' },
              { type: 'pronunciation', content: 'Listen and repeat' }
            ]
          },
          notes: 'Focus on pronunciation. Use visual aids and real examples.'
        },
        {
          id: 'slide-3',
          title: 'How Much Grammar',
          type: 'grammar', 
          content: {
            text: 'How much is this? / How much are these?',
            exercises: [
              { type: 'fill-blank', content: '__ much __ this shirt?' },
              { type: 'choose', content: 'Select the correct question' }
            ]
          },
          notes: 'Explain singular vs plural. Practice with different items.'
        },
        {
          id: 'slide-4',
          title: 'Shopping Role-Play',
          type: 'communication',
          content: {
            text: 'Practice shopping conversations',
            exercises: [
              { type: 'role-play', content: 'Student A: Customer, Student B: Shopkeeper' },
              { type: 'dialogue', content: 'Complete the shopping conversation' }
            ]
          },
          notes: 'Pair students up. Circulate and help with pronunciation.'
        },
        {
          id: 'slide-5',
          title: 'Review & Homework',
          type: 'review',
          content: {
            text: 'What did we learn today?',
            exercises: [
              { type: 'quiz', content: 'Quick review quiz' },
              { type: 'homework', content: 'Visit a store and note 5 prices' }
            ]
          },
          notes: 'Summarize key points. Assign homework and remind about next class.'
        }
      ]
    };
    
    setTopic(mockTopic);
  }, [topicId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (classStarted) {
      interval = setInterval(() => {
        setClassTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [classStarted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const nextSlide = () => {
    if (topic && currentSlideIndex < topic.slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session?.user || !topic) {
    return <div className="min-h-screen flex items-center justify-center">Access denied or topic not found</div>;
  }

  const currentSlide = topic.slides[currentSlideIndex];

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'min-h-screen bg-gradient-to-br from-blue-50 to-green-50'}`}>
      {/* Header */}
      <div className="border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">{topic.name}</h1>
            <Badge className="bg-green-600">{topic.level}</Badge>
            {classStarted && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>LIVE • {formatTime(classTimer)}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              <span>{attendees} students</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={micOn ? "default" : "secondary"}
                size="sm"
                onClick={() => setMicOn(!micOn)}
              >
                {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              
              <Button
                variant={videoOn ? "default" : "secondary"}
                size="sm"
                onClick={() => setVideoOn(!videoOn)}
              >
                {videoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>
              
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowLessonPlan(!showLessonPlan)}
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Slide Navigation */}
          <div className="bg-gray-50 px-4 py-2 border-b">
            <div className="flex gap-2 overflow-x-auto">
              {topic.slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlideIndex(index)}
                  className={`px-3 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                    index === currentSlideIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {index + 1}. {slide.title}
                </button>
              ))}
            </div>
          </div>

          {/* Current Slide */}
          <div className="flex-1 p-8 overflow-auto">
            <div className="max-w-4xl mx-auto">
              <Card className="min-h-[400px]">
                <CardHeader>
                  <CardTitle className="text-2xl">{currentSlide.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {currentSlide.content.text && (
                    <div className="text-lg text-gray-700">
                      {currentSlide.content.text}
                    </div>
                  )}
                  
                  {currentSlide.content.exercises && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Activities:</h3>
                      {currentSlide.content.exercises.map((exercise, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{exercise.type}</Badge>
                          </div>
                          <p>{exercise.content}</p>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Controls */}
          <div className="border-t bg-white p-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <Button
                variant="outline"
                onClick={prevSlide}
                disabled={currentSlideIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-4">
                {!classStarted ? (
                  <Button onClick={() => setClassStarted(true)} className="bg-green-600">
                    <Play className="h-4 w-4 mr-2" />
                    Start Class
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => setClassStarted(false)}>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Class
                  </Button>
                )}
                
                <span className="text-sm text-gray-600">
                  Slide {currentSlideIndex + 1} of {topic.slides.length}
                </span>
              </div>

              <Button
                onClick={nextSlide}
                disabled={currentSlideIndex === topic.slides.length - 1}
              >
                {currentSlideIndex === topic.slides.length - 1 ? 'End Class' : 'Next'}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Lesson Plan Sidebar */}
        {showLessonPlan && (
          <div className="w-80 border-l bg-white overflow-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Lesson Plan</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowLessonPlan(false)}
                >
                  ✕
                </Button>
              </div>
              
              <Tabs defaultValue="plan" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="plan">Plan</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="materials">Materials</TabsTrigger>
                </TabsList>
                
                <TabsContent value="plan" className="mt-4">
                  <div className="text-sm whitespace-pre-line text-gray-700">
                    {topic.lessonPlan}
                  </div>
                </TabsContent>
                
                <TabsContent value="notes" className="mt-4">
                  <Card>
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-2">Current Slide Notes:</h4>
                      <p className="text-sm text-gray-600">{currentSlide.notes}</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="materials" className="mt-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Materials Needed:</h4>
                    {topic.materials.map((material, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        {material}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}