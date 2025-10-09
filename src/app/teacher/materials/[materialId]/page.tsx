'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  FileText,
  Image,
  Video,
  Headphones,
  Download,
  Eye,
  Play,
  Pause,
  Volume2,
  Maximize2
} from 'lucide-react';
import Navbar from '@/components/layout/navbar';

interface ClassMaterial {
  id: string;
  topicName: string;
  courseType: string;
  slides: {
    id: string;
    title: string;
    type: 'intro' | 'vocabulary' | 'grammar' | 'communication' | 'review';
    content: {
      text?: string;
      image?: string;
      audio?: string;
      video?: string;
    };
  }[];
  additionalResources: {
    id: string;
    name: string;
    type: 'pdf' | 'audio' | 'video' | 'image';
    url: string;
  }[];
  exercises: {
    id: string;
    title: string;
    type: string;
    instructions: string;
  }[];
}

export default function ClassMaterialsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const materialId = params.materialId as string;
  
  const [material, setMaterial] = useState<ClassMaterial | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (session?.user?.role !== 'TEACHER') {
      router.push('/dashboard');
    } else {
      fetchMaterial();
    }
  }, [status, session, router, materialId]);

  const fetchMaterial = async () => {
    try {
      // TODO: Replace with actual API call
      // Mock data based on materialId
      const mockMaterial: ClassMaterial = {
        id: materialId,
        topicName: materialId === 'topic-1' ? 'Shopping: How Much Is It?' : 
                   materialId === 'topic-5' ? 'Travel: Getting Around' :
                   'Business English: Presentations',
        courseType: materialId === 'topic-1' ? 'Smart Learning' :
                   materialId === 'topic-5' ? 'Smart Conversation' :
                   'Private Lessons',
        slides: [
          {
            id: 'slide-1',
            title: 'Welcome & Warm-up',
            type: 'intro',
            content: {
              text: 'Welcome to today\'s class! Let\'s start with a warm-up activity.',
              image: '/placeholder-intro.jpg',
              audio: '/audio/intro.mp3'
            }
          },
          {
            id: 'slide-2',
            title: 'Vocabulary Introduction',
            type: 'vocabulary',
            content: {
              text: 'Key vocabulary words for today\'s lesson',
              image: '/placeholder-vocab.jpg',
              audio: '/audio/vocabulary.mp3'
            }
          },
          {
            id: 'slide-3',
            title: 'Grammar Focus',
            type: 'grammar',
            content: {
              text: 'Grammar structure and examples',
              image: '/placeholder-grammar.jpg'
            }
          },
          {
            id: 'slide-4',
            title: 'Communication Practice',
            type: 'communication',
            content: {
              text: 'Practice speaking and listening',
              video: '/video/communication.mp4'
            }
          },
          {
            id: 'slide-5',
            title: 'Review & Summary',
            type: 'review',
            content: {
              text: 'Let\'s review what we learned today',
              image: '/placeholder-review.jpg'
            }
          }
        ],
        additionalResources: [
          {
            id: 'res-1',
            name: 'Vocabulary Flashcards',
            type: 'pdf',
            url: '/resources/flashcards.pdf'
          },
          {
            id: 'res-2',
            name: 'Pronunciation Guide',
            type: 'audio',
            url: '/resources/pronunciation.mp3'
          },
          {
            id: 'res-3',
            name: 'Grammar Exercises',
            type: 'pdf',
            url: '/resources/grammar.pdf'
          }
        ],
        exercises: [
          {
            id: 'ex-1',
            title: 'Vocabulary Matching',
            type: 'Interactive',
            instructions: 'Match the vocabulary words with their meanings'
          },
          {
            id: 'ex-2',
            title: 'Pronunciation Practice',
            type: 'Audio',
            instructions: 'Listen and repeat the pronunciation'
          },
          {
            id: 'ex-3',
            title: 'Role-play Activity',
            type: 'Speaking',
            instructions: 'Practice the dialogue with your partner'
          }
        ]
      };

      setMaterial(mockMaterial);
    } catch (error) {
      console.error('Error fetching material:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSlideTypeColor = (type: string) => {
    switch (type) {
      case 'intro': return 'bg-blue-600';
      case 'vocabulary': return 'bg-green-600';
      case 'grammar': return 'bg-purple-600';
      case 'communication': return 'bg-orange-600';
      case 'review': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf': return FileText;
      case 'audio': return Headphones;
      case 'video': return Video;
      case 'image': return Image;
      default: return FileText;
    }
  };

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session?.user || session.user.role !== 'TEACHER' || !material) {
    return <div className="min-h-screen flex items-center justify-center">Access denied or material not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/teacher')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Class Materials
              </h1>
              <p className="text-gray-600">
                {material.topicName} • {material.courseType}
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              {isFullscreen ? 'Exit' : 'Enter'} Presentation Mode
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Slide Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Slides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {material.slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-full p-3 text-left rounded-lg transition-colors ${
                      currentSlide === index
                        ? 'bg-blue-100 border-blue-300 border-2'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getSlideTypeColor(slide.type)} size="sm">
                        {index + 1}
                      </Badge>
                      <span className="text-xs uppercase text-gray-500">
                        {slide.type}
                      </span>
                    </div>
                    <h4 className="font-medium text-sm">{slide.title}</h4>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="slides" className="space-y-6">
              <TabsList>
                <TabsTrigger value="slides">Slides</TabsTrigger>
                <TabsTrigger value="exercises">Exercises</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>

              {/* Slides Tab */}
              <TabsContent value="slides">
                <Card className={isFullscreen ? 'fixed inset-0 z-50' : ''}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Badge className={getSlideTypeColor(material.slides[currentSlide].type)}>
                          Slide {currentSlide + 1}
                        </Badge>
                        {material.slides[currentSlide].title}
                      </CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                        disabled={currentSlide === 0}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentSlide(Math.min(material.slides.length - 1, currentSlide + 1))}
                        disabled={currentSlide === material.slides.length - 1}
                      >
                        Next
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className={isFullscreen ? 'p-12' : ''}>
                    <div className="bg-white rounded-lg border p-8 min-h-96">
                      {material.slides[currentSlide].content.text && (
                        <div className="mb-6">
                          <p className="text-lg text-gray-800">
                            {material.slides[currentSlide].content.text}
                          </p>
                        </div>
                      )}
                      
                      {material.slides[currentSlide].content.image && (
                        <div className="mb-6">
                          <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Image className="h-16 w-16 text-gray-400" />
                            <span className="ml-2 text-gray-500">
                              {material.slides[currentSlide].content.image}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {material.slides[currentSlide].content.audio && (
                        <div className="mb-6">
                          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                            <Button size="sm" variant="outline">
                              <Play className="h-4 w-4" />
                            </Button>
                            <Headphones className="h-5 w-5 text-blue-600" />
                            <span className="text-sm text-blue-700">
                              Audio: {material.slides[currentSlide].content.audio}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {material.slides[currentSlide].content.video && (
                        <div className="mb-6">
                          <div className="w-full h-64 bg-gray-900 rounded-lg flex items-center justify-center">
                            <Play className="h-16 w-16 text-white" />
                            <span className="ml-2 text-white">
                              {material.slides[currentSlide].content.video}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Exercises Tab */}
              <TabsContent value="exercises">
                <Card>
                  <CardHeader>
                    <CardTitle>Class Exercises</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {material.exercises.map((exercise) => (
                        <Card key={exercise.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium mb-1">{exercise.title}</h4>
                              <Badge variant="outline" className="mb-2">
                                {exercise.type}
                              </Badge>
                              <p className="text-sm text-gray-600">
                                {exercise.instructions}
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value="resources">
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {material.additionalResources.map((resource) => {
                        const IconComponent = getResourceIcon(resource.type);
                        return (
                          <Card key={resource.id} className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <IconComponent className="h-5 w-5 text-gray-500" />
                                <div>
                                  <h4 className="font-medium">{resource.name}</h4>
                                  <p className="text-sm text-gray-600 capitalize">
                                    {resource.type} file
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}