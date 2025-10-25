'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Video,
  Headphones,
  Target,
  Clock,
  Users,
  MessageSquare,
  Download,
  ExternalLink,
  Presentation,
  CheckCircle,
  Circle,
  PenTool,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  AlertCircle
} from 'lucide-react'
import axios from 'axios'

interface Exercise {
  id: string
  phase: string
  category: string
  type: string
  title: string
  instructions: string
  content: any
  points: number
}

interface Slide {
  id: string
  slideNumber: number
  title: string
  type: string
  content: any
  notes?: string
}

interface Content {
  id: string
  title: string
  description: string
  type: string
  phase: string
  duration: number
  resourceUrl?: string
  level: string
  topicId: string
  topicName: string
  topicDescription: string
  lessonPlan: any
  objectives: string[]
  materials: string[]
  exercises: Exercise[]
  slides: Slide[]
}

export default function TeacherContentDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'TEACHER') {
      router.push('/auth/login')
      return
    }
    fetchContent()
  }, [status, session, params.contentId])

  const fetchContent = async () => {
    try {
      const response = await axios.get(`/api/teacher/content/${params.contentId}`)
      setContent(response.data)
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleExercise = (exerciseId: string) => {
    const newExpanded = new Set(expandedExercises)
    if (newExpanded.has(exerciseId)) {
      newExpanded.delete(exerciseId)
    } else {
      newExpanded.add(exerciseId)
    }
    setExpandedExercises(newExpanded)
  }

  const getContentIcon = () => {
    switch (content?.type) {
      case 'video': return <Video className="h-6 w-6" />
      case 'audio': return <Headphones className="h-6 w-6" />
      case 'reading': return <BookOpen className="h-6 w-6" />
      case 'exercise': return <Target className="h-6 w-6" />
      case 'quiz': return <CheckCircle className="h-6 w-6" />
      case 'discussion': return <MessageSquare className="h-6 w-6" />
      default: return <FileText className="h-6 w-6" />
    }
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'pre_class': return 'bg-blue-100 text-blue-800'
      case 'live_class': return 'bg-green-100 text-green-800'
      case 'post_class': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getExerciseIcon = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE': return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'TRUE_FALSE': return <Circle className="h-4 w-4 text-green-500" />
      case 'ESSAY': return <PenTool className="h-4 w-4 text-purple-500" />
      case 'AUDIO_RECORDING': return <Headphones className="h-4 w-4 text-orange-500" />
      case 'GAP_FILL': return <FileText className="h-4 w-4 text-red-500" />
      case 'MATCHING': return <Users className="h-4 w-4 text-indigo-500" />
      default: return <Target className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Content not found</p>
          <Button onClick={() => router.push('/teacher/content')} className="mt-4">
            Back to Content Library
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/teacher/content')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Content Library
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {getContentIcon()}
                <h1 className="text-3xl font-bold">{content.title}</h1>
              </div>
              <p className="text-gray-600 mb-3">{content.description}</p>
              <div className="flex items-center gap-4 flex-wrap">
                <Badge className={getPhaseColor(content.phase)}>
                  {content.phase.replace('_', ' ')}
                </Badge>
                <Badge variant="outline">
                  {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                </Badge>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {content.duration} minutes
                </span>
                <span className="text-sm text-gray-500">
                  Level: {content.level}
                </span>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  <strong>Topic:</strong> {content.topicName}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              {content.resourceUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={content.resourceUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Resource
                  </a>
                </Button>
              )}
              {content.phase === 'live_class' && (
                <Button size="sm">
                  <Presentation className="h-4 w-4 mr-2" />
                  Start Live Class
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="exercises">
              Exercises {content.exercises.length > 0 && `(${content.exercises.length})`}
            </TabsTrigger>
            {content.slides.length > 0 && (
              <TabsTrigger value="slides">
                Slides ({content.slides.length})
              </TabsTrigger>
            )}
            <TabsTrigger value="teaching">Teaching Guide</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Learning Objectives */}
              {content.objectives && content.objectives.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Learning Objectives
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {content.objectives.map((objective: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Required Materials */}
              {content.materials && content.materials.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Required Materials
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {content.materials.map((material: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <Circle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{material}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Topic Overview */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Topic Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{content.topicDescription}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Exercises Tab */}
          <TabsContent value="exercises">
            {content.exercises.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No exercises for this content</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {content.exercises.map((exercise) => (
                  <Card key={exercise.id} className="overflow-hidden">
                    <CardHeader 
                      className="cursor-pointer"
                      onClick={() => toggleExercise(exercise.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getExerciseIcon(exercise.type)}
                          <div>
                            <h3 className="font-semibold">{exercise.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {exercise.type.replace(/_/g, ' ')}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {exercise.category}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {exercise.points} points
                              </span>
                            </div>
                          </div>
                        </div>
                        {expandedExercises.has(exercise.id) ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </CardHeader>
                    
                    {expandedExercises.has(exercise.id) && (
                      <CardContent className="border-t">
                        <div className="space-y-4 pt-4">
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" />
                              Instructions
                            </h4>
                            <p className="text-sm text-gray-700">{exercise.instructions}</p>
                          </div>
                          
                          {exercise.content && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="font-medium mb-2">Exercise Content</h4>
                              {exercise.content.question && (
                                <p className="mb-3">
                                  <strong>Question:</strong> {exercise.content.question}
                                </p>
                              )}
                              {exercise.content.prompt && (
                                <p className="mb-3">
                                  <strong>Prompt:</strong> {exercise.content.prompt}
                                </p>
                              )}
                              {exercise.content.options && (
                                <div>
                                  <strong>Options:</strong>
                                  <ol className="list-decimal list-inside ml-3 mt-1">
                                    {exercise.content.options.map((option: string, i: number) => (
                                      <li key={i} className="text-sm">{option}</li>
                                    ))}
                                  </ol>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Slides Tab */}
          {content.slides.length > 0 && (
            <TabsContent value="slides">
              <div className="space-y-4">
                {content.slides
                  .sort((a, b) => a.slideNumber - b.slideNumber)
                  .map((slide) => (
                    <Card key={slide.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            Slide {slide.slideNumber}: {slide.title}
                          </CardTitle>
                          <Badge>{slide.type}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {slide.content && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              {typeof slide.content === 'string' ? (
                                <p>{slide.content}</p>
                              ) : (
                                <pre className="whitespace-pre-wrap text-sm">
                                  {JSON.stringify(slide.content, null, 2)}
                                </pre>
                              )}
                            </div>
                          )}
                          
                          {slide.notes && (
                            <div className="border-l-4 border-yellow-400 pl-4">
                              <p className="text-sm font-medium mb-1 flex items-center gap-2">
                                <Lightbulb className="h-4 w-4" />
                                Teacher Notes
                              </p>
                              <p className="text-sm text-gray-600">{slide.notes}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          )}

          {/* Teaching Guide Tab */}
          <TabsContent value="teaching">
            <Card>
              <CardHeader>
                <CardTitle>Teaching Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Phase-specific tips */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Phase-Specific Tips
                    </h3>
                    <div className="space-y-3">
                      {content.phase === 'pre_class' && (
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-medium text-blue-900 mb-2">Pre-Class Content</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Assign this content at least 24 hours before the live class</li>
                            <li>• Check student completion before starting the live session</li>
                            <li>• Reference this material during the live class</li>
                            <li>• Be prepared to clarify any confusion from pre-class work</li>
                          </ul>
                        </div>
                      )}
                      {content.phase === 'live_class' && (
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="font-medium text-green-900 mb-2">Live Class Content</h4>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Use this as your primary teaching material</li>
                            <li>• Engage students with interactive activities</li>
                            <li>• Monitor student understanding throughout</li>
                            <li>• Adapt pace based on student responses</li>
                          </ul>
                        </div>
                      )}
                      {content.phase === 'post_class' && (
                        <div className="bg-purple-50 rounded-lg p-4">
                          <h4 className="font-medium text-purple-900 mb-2">Post-Class Content</h4>
                          <ul className="text-sm text-purple-800 space-y-1">
                            <li>• Assign immediately after the live class</li>
                            <li>• Set a clear deadline for completion</li>
                            <li>• Review submissions before next class</li>
                            <li>• Provide feedback on student work</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* General teaching tips */}
                  <div>
                    <h3 className="font-semibold mb-3">General Teaching Tips</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Encourage student participation throughout the content</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Adapt the material to your students' proficiency level</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Use real-world examples to make content relevant</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Monitor time to ensure all content is covered</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}