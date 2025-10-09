'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize2,
  Volume2,
  BookOpen,
  Users,
  Target,
  CheckCircle
} from 'lucide-react';

interface Slide {
  id: string;
  slideNumber: number;
  title: string;
  content: any;
  notes?: string;
}

interface Topic {
  id: string;
  name: string;
  level: string;
}

interface LiveClassSlidesProps {
  topic: Topic;
  slides: Slide[];
  isTeacher?: boolean;
  onComplete?: () => void;
}

export default function LiveClassSlides({ 
  topic, 
  slides, 
  isTeacher = false,
  onComplete 
}: LiveClassSlidesProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [classStarted, setClassStarted] = useState(false);
  const [classTimer, setClassTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentSlide = slides[currentSlideIndex];
  const progress = ((currentSlideIndex + 1) / slides.length) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (classStarted && !isFullscreen) {
      interval = setInterval(() => {
        setClassTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [classStarted, isFullscreen]);

  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    } else if (onComplete) {
      onComplete();
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlideIndex(index);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startClass = () => {
    setClassStarted(true);
    setClassTimer(0);
  };

  const renderSlideContent = (slide: Slide) => {
    const { content } = slide;

    switch (content.type) {
      case 'intro':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{topic.name}</h1>
              <div className="flex justify-center items-center gap-4 mb-6">
                <span className={`level-badge level-${topic.level.toLowerCase()}`}>
                  {topic.level} Level
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-600">60 minutes</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-blue-900 mb-2">Objective</h3>
                <p className="text-sm text-blue-800">{content.objective}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-900 mb-2">Vocabulary</h3>
                <p className="text-sm text-green-800">{content.vocabulary}</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-purple-900 mb-2">Grammar</h3>
                <p className="text-sm text-purple-800">{content.grammar}</p>
              </div>
            </div>

            {content.warmup && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">Warm-up Activity</h3>
                <p className="text-yellow-800">{content.warmup}</p>
              </div>
            )}
          </div>
        );

      case 'vocabulary':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Vocabulary</h2>
              <p className="text-gray-600">{content.practice}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {content.words?.map((word: string, index: number) => (
                <div key={index} className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center hover:border-blue-300 transition-colors">
                  <div className="text-lg font-semibold text-gray-900 mb-2">{word}</div>
                  {content.images && (
                    <div className="w-16 h-16 bg-gray-100 rounded mx-auto mb-2 flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  {content.audio && (
                    <Button size="sm" variant="outline" className="w-full">
                      <Volume2 className="h-3 w-3 mr-1" />
                      Listen
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'grammar':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Grammar Focus</h2>
              <h3 className="text-xl text-blue-600 mb-4">{content.structure}</h3>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-4">Examples:</h4>
              <div className="space-y-2">
                {content.examples?.map((example: string, index: number) => (
                  <div key={index} className="bg-white p-3 rounded border-l-4 border-blue-400">
                    <span className="text-gray-800">{example}</span>
                  </div>
                ))}
              </div>
            </div>

            {content.practice && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Practice Activity</h4>
                <p className="text-green-800">{content.practice}</p>
              </div>
            )}
          </div>
        );

      case 'communication':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Communication Practice</h2>
              <p className="text-gray-600">{content.activity}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-orange-50 p-6 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-4">Scenarios</h4>
                <div className="space-y-3">
                  {content.scenarios?.map((scenario: string, index: number) => (
                    <div key={index} className="bg-white p-3 rounded border-l-4 border-orange-400">
                      <span className="text-gray-800">{scenario}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-4">Interaction</h4>
                <p className="text-purple-800 mb-4">{content.interaction}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-purple-700">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Pair work: 10 minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-700">
                    <Volume2 className="h-4 w-4" />
                    <span className="text-sm">Speaking practice</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Review & Wrap-up</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Key Points Summary
                </h4>
                <p className="text-green-800">{content.summary}</p>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-4">Homework Assignment</h4>
                <p className="text-blue-800 mb-3">{content.homework}</p>
                <div className="text-sm text-blue-700">
                  <p>📝 Complete post-class exercises</p>
                  <p>🔄 Review vocabulary and grammar</p>
                  <p>🎯 Prepare for next lesson</p>
                </div>
              </div>
            </div>

            {content.nextLesson && (
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <h4 className="font-semibold text-yellow-900 mb-2">Next Lesson Preview</h4>
                <p className="text-yellow-800">{content.nextLesson}</p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Slide content not available</p>
          </div>
        );
    }
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* Header */}
      <div className="border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">{topic.name}</h1>
            {classStarted && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>Live • {formatTime(classTimer)}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {isTeacher && !classStarted && (
              <Button onClick={startClass} className="btn-mindset">
                <Play className="h-4 w-4 mr-2" />
                Start Class
              </Button>
            )}
            
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Slide {currentSlideIndex + 1} of {slides.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Slide Navigation */}
      <div className="bg-gray-50 px-4 py-2 border-b">
        <div className="flex gap-2 overflow-x-auto">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
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

      {/* Main Slide Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">
          <div className="min-h-[500px]">
            {currentSlide ? renderSlideContent(currentSlide) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No slides available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="border-t bg-white p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Button
            variant="outline"
            onClick={prevSlide}
            disabled={currentSlideIndex === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="text-sm text-gray-600">
            {currentSlide?.title}
          </div>

          <Button
            onClick={nextSlide}
            className="flex items-center gap-2 btn-mindset"
          >
            {currentSlideIndex === slides.length - 1 ? 'Finish Class' : 'Next'}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Teacher Notes (only for teachers) */}
      {isTeacher && currentSlide?.notes && (
        <div className="border-t bg-yellow-50 p-4">
          <div className="max-w-6xl mx-auto">
            <h4 className="font-semibold text-yellow-900 mb-2">Teacher Notes:</h4>
            <p className="text-sm text-yellow-800">{currentSlide.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}