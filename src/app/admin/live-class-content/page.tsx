'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  Upload,
  Image,
  Video,
  FileText,
  Headphones,
  BookOpen,
  PenTool
} from 'lucide-react';

interface Exercise {
  id: string;
  type: 'match' | 'pronunciation' | 'fill-blank' | 'choose' | 'role-play' | 'dialogue' | 'quiz' | 'homework';
  content: string;
  options?: string[];
  correctAnswer?: string;
}

interface SlideContent {
  text?: string;
  image?: string;
  audio?: string;
  video?: string;
  exercises?: Exercise[];
}

interface LiveClassSlide {
  id: string;
  title: string;
  type: 'intro' | 'vocabulary' | 'grammar' | 'communication' | 'review';
  content: SlideContent;
  notes: string;
}

interface Topic {
  id: string;
  name: string;
  level: string;
  slides: LiveClassSlide[];
  lessonPlan: string;
  objectives: string[];
  materials: string[];
}

export default function LiveClassContentAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const response = await fetch('/api/admin/live-class-content');
      if (response.ok) {
        const topicsData = await response.json();
        setTopics(topicsData);
        if (topicsData.length > 0) {
          setSelectedTopic(topicsData[0]);
        }
      }
    } catch (error) {
      console.error('Error loading topics:', error);
      // Fallback to empty state
      setTopics([]);
    }
  };

  const addNewExercise = () => {
    if (!selectedTopic) return;
    
    const newExercise: Exercise = {
      id: `ex-${Date.now()}`,
      type: 'match',
      content: ''
    };

    const updatedSlides = [...selectedTopic.slides];
    const currentSlide = updatedSlides[currentSlideIndex];
    
    if (!currentSlide.content.exercises) {
      currentSlide.content.exercises = [];
    }
    
    currentSlide.content.exercises.push(newExercise);
    
    setSelectedTopic({
      ...selectedTopic,
      slides: updatedSlides
    });
  };

  const updateExercise = (exerciseId: string, field: string, value: any) => {
    if (!selectedTopic) return;

    const updatedSlides = [...selectedTopic.slides];
    const currentSlide = updatedSlides[currentSlideIndex];
    
    if (currentSlide.content.exercises) {
      const exerciseIndex = currentSlide.content.exercises.findIndex(ex => ex.id === exerciseId);
      if (exerciseIndex >= 0) {
        currentSlide.content.exercises[exerciseIndex] = {
          ...currentSlide.content.exercises[exerciseIndex],
          [field]: value
        };
      }
    }

    setSelectedTopic({
      ...selectedTopic,
      slides: updatedSlides
    });
  };

  const removeExercise = (exerciseId: string) => {
    if (!selectedTopic) return;

    const updatedSlides = [...selectedTopic.slides];
    const currentSlide = updatedSlides[currentSlideIndex];
    
    if (currentSlide.content.exercises) {
      currentSlide.content.exercises = currentSlide.content.exercises.filter(ex => ex.id !== exerciseId);
    }

    setSelectedTopic({
      ...selectedTopic,
      slides: updatedSlides
    });
  };

  const updateSlideContent = (field: string, value: any) => {
    if (!selectedTopic) return;

    const updatedSlides = [...selectedTopic.slides];
    updatedSlides[currentSlideIndex] = {
      ...updatedSlides[currentSlideIndex],
      content: {
        ...updatedSlides[currentSlideIndex].content,
        [field]: value
      }
    };

    setSelectedTopic({
      ...selectedTopic,
      slides: updatedSlides
    });
  };

  const updateSlideNotes = (notes: string) => {
    if (!selectedTopic) return;

    const updatedSlides = [...selectedTopic.slides];
    updatedSlides[currentSlideIndex] = {
      ...updatedSlides[currentSlideIndex],
      notes
    };

    setSelectedTopic({
      ...selectedTopic,
      slides: updatedSlides
    });
  };

  const saveContent = async () => {
    if (!selectedTopic) return;
    
    try {
      const response = await fetch('/api/admin/live-class-content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicId: selectedTopic.id,
          slides: selectedTopic.slides,
          lessonPlan: selectedTopic.lessonPlan,
          objectives: selectedTopic.objectives,
          materials: selectedTopic.materials
        }),
      });

      if (response.ok) {
        console.log('Content saved successfully');
        setIsEditing(false);
      } else {
        console.error('Failed to save content');
      }
    } catch (error) {
      console.error('Error saving content:', error);
    }
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
    return <div className="min-h-screen flex items-center justify-center">Access denied</div>;
  }

  const currentSlide = selectedTopic?.slides[currentSlideIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/admin')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Live Class Content Management
          </h1>
          <p className="text-gray-600">
            Manage slides, exercises, and materials for live classes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Topic Selection */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Topics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedTopic?.id === topic.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedTopic(topic);
                    setCurrentSlideIndex(0);
                  }}
                >
                  <h4 className="font-medium text-sm">{topic.name}</h4>
                  <Badge className="mt-1 text-xs">{topic.level}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {selectedTopic && (
              <>
                {/* Topic Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedTopic.name}</CardTitle>
                        <Badge className="mt-2">{selectedTopic.level}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={isEditing ? "secondary" : "default"}
                          onClick={() => setIsEditing(!isEditing)}
                        >
                          {isEditing ? 'View Mode' : 'Edit Mode'}
                        </Button>
                        {isEditing && (
                          <Button onClick={saveContent} className="bg-green-600">
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Slide Navigation */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex gap-2 overflow-x-auto">
                      {selectedTopic.slides.map((slide, index) => (
                        <button
                          key={slide.id}
                          onClick={() => setCurrentSlideIndex(index)}
                          className={`px-4 py-2 rounded text-sm whitespace-nowrap transition-colors ${
                            index === currentSlideIndex
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {index + 1}. {slide.title}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Current Slide Editor */}
                {currentSlide && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        Slide {currentSlideIndex + 1}: {currentSlide.title}
                        <Badge variant="secondary">{currentSlide.type}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="content" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="content">Content</TabsTrigger>
                          <TabsTrigger value="exercises">Exercises</TabsTrigger>
                          <TabsTrigger value="media">Media</TabsTrigger>
                          <TabsTrigger value="notes">Notes</TabsTrigger>
                        </TabsList>

                        <TabsContent value="content" className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Slide Text</label>
                            <Textarea
                              value={currentSlide.content.text || ''}
                              onChange={(e) => updateSlideContent('text', e.target.value)}
                              disabled={!isEditing}
                              rows={4}
                              placeholder="Enter the main text content for this slide"
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value="exercises" className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Exercises</h4>
                            {isEditing && (
                              <Button onClick={addNewExercise} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Exercise
                              </Button>
                            )}
                          </div>
                          
                          {currentSlide.content.exercises?.map((exercise, index) => (
                            <Card key={exercise.id} className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <Select
                                    value={exercise.type}
                                    onValueChange={(value) => updateExercise(exercise.id, 'type', value)}
                                    disabled={!isEditing}
                                  >
                                    <SelectTrigger className="w-40">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="match">Match</SelectItem>
                                      <SelectItem value="pronunciation">Pronunciation</SelectItem>
                                      <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
                                      <SelectItem value="choose">Multiple Choice</SelectItem>
                                      <SelectItem value="role-play">Role Play</SelectItem>
                                      <SelectItem value="dialogue">Dialogue</SelectItem>
                                      <SelectItem value="quiz">Quiz</SelectItem>
                                      <SelectItem value="homework">Homework</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  
                                  {isEditing && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeExercise(exercise.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                                
                                <Textarea
                                  value={exercise.content}
                                  onChange={(e) => updateExercise(exercise.id, 'content', e.target.value)}
                                  disabled={!isEditing}
                                  placeholder="Enter exercise content or instructions"
                                  rows={2}
                                />
                              </div>
                            </Card>
                          ))}
                        </TabsContent>

                        <TabsContent value="media" className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Image URL</label>
                              <div className="flex gap-2">
                                <Input
                                  value={currentSlide.content.image || ''}
                                  onChange={(e) => updateSlideContent('image', e.target.value)}
                                  disabled={!isEditing}
                                  placeholder="https://example.com/image.jpg"
                                />
                                {isEditing && (
                                  <Button variant="outline" size="sm">
                                    <Upload className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-2">Audio URL</label>
                              <div className="flex gap-2">
                                <Input
                                  value={currentSlide.content.audio || ''}
                                  onChange={(e) => updateSlideContent('audio', e.target.value)}
                                  disabled={!isEditing}
                                  placeholder="https://example.com/audio.mp3"
                                />
                                {isEditing && (
                                  <Button variant="outline" size="sm">
                                    <Upload className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-2">Video URL</label>
                              <div className="flex gap-2">
                                <Input
                                  value={currentSlide.content.video || ''}
                                  onChange={(e) => updateSlideContent('video', e.target.value)}
                                  disabled={!isEditing}
                                  placeholder="https://youtube.com/watch?v=..."
                                />
                                {isEditing && (
                                  <Button variant="outline" size="sm">
                                    <Upload className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="notes" className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Teacher Notes</label>
                            <Textarea
                              value={currentSlide.notes}
                              onChange={(e) => updateSlideNotes(e.target.value)}
                              disabled={!isEditing}
                              rows={6}
                              placeholder="Add teaching notes and instructions for this slide"
                            />
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}