'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  BookOpen,
  Video,
  Headphones,
  FileText,
  Clock,
  CheckCircle,
  Circle,
  Play,
  ChevronRight,
  Calendar,
  Target,
  Award,
  Lock,
  Unlock
} from 'lucide-react'
import axios from 'axios'

interface Exercise {
  id: string
  type: string
  category: string
  phase: string
  title: string
  instructions: string
  content: any
  points: number
  correctAnswer: any
}

interface Content {
  id: string
  title: string
  description: string
  type: string
  phase: string
  duration: number
  resourceUrl?: string
  order: number
  exercises?: Exercise[]
  completed?: boolean
}

interface Topic {
  id: string
  name: string
  level: string
  orderIndex: number
  lessonDate?: string
  contents?: Content[]
}

export default function StudentLearningPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(true)
  const [activePhase, setActivePhase] = useState<'pre_class' | 'post_class'>('pre_class')
  const [completedContent, setCompletedContent] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'STUDENT') {
      router.push('/auth/login')
      return
    }
    fetchStudentContent()
  }, [status, session])

  const fetchStudentContent = async () => {
    setLoading(true)
    try {
      // Get student's progress data
      const progressResponse = await axios.get('/api/student/progress')
      const studentProgress = progressResponse.data

      // Get topics for student's level
      const topicsResponse = await axios.get(`/api/student/topics?level=${studentProgress.level || 'STARTER'}`)
      const topicsData = topicsResponse.data

      // Get upcoming lessons to determine which content is available
      const lessonsResponse = await axios.get('/api/student/upcoming-lessons')
      const upcomingLessons = lessonsResponse.data

      // Map lessons to topics and fetch content
      const topicsWithContent = await Promise.all(
        topicsData.map(async (topic: Topic) => {
          // Check if this topic has an upcoming or past lesson
          const lesson = upcomingLessons.find((l: any) => l.topicId === topic.id)
          
          if (!lesson) return { ...topic, contents: [] }

          // Fetch content for this topic
          const contentResponse = await axios.get(`/api/student/content?topicId=${topic.id}`)
          const contents = contentResponse.data

          // Fetch exercises for this topic
          const exercisesResponse = await axios.get(`/api/student/exercises?topicId=${topic.id}`)
          const exercises = exercisesResponse.data

          // Map exercises to content
          const contentWithExercises = contents.map((content: Content) => ({
            ...content,
            exercises: exercises.filter((ex: any) => 
              (content.phase === 'pre_class' && ex.phase === 'PRE_CLASS') ||
              (content.phase === 'post_class' && ex.phase === 'AFTER_CLASS')
            ),
            completed: studentProgress.completedContent?.includes(content.id) || false
          }))

          return {
            ...topic,
            lessonDate: lesson.date,
            contents: contentWithExercises
          }
        })
      )

      // Sort topics by lesson date (upcoming first)
      const sortedTopics = topicsWithContent
        .filter(t => t.contents.length > 0)
        .sort((a, b) => {
          if (!a.lessonDate) return 1
          if (!b.lessonDate) return -1
          return new Date(a.lessonDate).getTime() - new Date(b.lessonDate).getTime()
        })

      setTopics(sortedTopics)
      
      // Auto-select the first topic with an upcoming lesson
      if (sortedTopics.length > 0) {
        setSelectedTopic(sortedTopics[0])
      }
    } catch (error) {
      console.error('Error fetching student content:', error)
    } finally {
      setLoading(false)
    }
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-5 w-5" />
      case 'audio': return <Headphones className="h-5 w-5" />
      case 'reading': return <BookOpen className="h-5 w-5" />
      case 'exercise': return <FileText className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
    }
  }

  const handleContentClick = (content: Content) => {
    if (content.type === 'video' || content.type === 'audio' || content.type === 'reading') {
      router.push(`/student/content/${content.id}`)
    } else if (content.exercises && content.exercises.length > 0) {
      router.push(`/student/exercises/${content.id}`)
    }
  }

  const isContentAccessible = (topic: Topic, phase: string) => {
    if (!topic.lessonDate) return false
    
    const lessonDate = new Date(topic.lessonDate)
    const now = new Date()
    
    if (phase === 'pre_class') {
      // Pre-class content available 3 days before lesson
      const availableDate = new Date(lessonDate)
      availableDate.setDate(availableDate.getDate() - 3)
      return now >= availableDate
    } else if (phase === 'post_class') {
      // Post-class content available after lesson
      return now >= lessonDate
    }
    
    return false
  }

  const getPhaseProgress = (contents: Content[], phase: string) => {
    const phaseContents = contents.filter(c => c.phase === phase)
    const completed = phaseContents.filter(c => c.completed).length
    return phaseContents.length > 0 ? (completed / phaseContents.length) * 100 : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your learning content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning Journey</h1>
          <p className="text-gray-600">Access your pre-class and post-class materials</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Topic List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Topics</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {topics.map((topic) => {
                    const isAccessible = isContentAccessible(topic, 'pre_class')
                    const progress = getPhaseProgress(topic.contents || [], activePhase)
                    
                    return (
                      <button
                        key={topic.id}
                        onClick={() => isAccessible && setSelectedTopic(topic)}
                        disabled={!isAccessible}
                        className={`w-full p-4 text-left transition-colors ${
                          selectedTopic?.id === topic.id
                            ? 'bg-blue-50 border-l-4 border-blue-600'
                            : isAccessible
                            ? 'hover:bg-gray-50'
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {isAccessible ? (
                                <Unlock className="h-4 w-4 text-green-600" />
                              ) : (
                                <Lock className="h-4 w-4 text-gray-400" />
                              )}
                              <h3 className="font-semibold text-sm">
                                {topic.orderIndex}. {topic.name}
                              </h3>
                            </div>
                            {topic.lessonDate && (
                              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(topic.lessonDate).toLocaleDateString()}
                              </p>
                            )}
                            {isAccessible && progress > 0 && (
                              <div className="mt-2">
                                <Progress value={progress} className="h-1" />
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {selectedTopic ? (
              <>
                {/* Topic Header */}
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">{selectedTopic.name}</h2>
                        {selectedTopic.lessonDate && (
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Class Date: {new Date(selectedTopic.lessonDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              {selectedTopic.contents?.length || 0} learning items
                            </span>
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        Level {selectedTopic.level}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Phase Tabs */}
                <Card>
                  <CardContent className="pt-6">
                    <Tabs value={activePhase} onValueChange={(v) => setActivePhase(v as any)}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger 
                          value="pre_class"
                          disabled={!isContentAccessible(selectedTopic, 'pre_class')}
                        >
                          Pre-Class Preparation
                        </TabsTrigger>
                        <TabsTrigger 
                          value="post_class"
                          disabled={!isContentAccessible(selectedTopic, 'post_class')}
                        >
                          Post-Class Practice
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value={activePhase} className="mt-6">
                        <div className="space-y-4">
                          {selectedTopic.contents
                            ?.filter(c => c.phase === activePhase)
                            .sort((a, b) => a.order - b.order)
                            .map((content) => (
                              <div
                                key={content.id}
                                className={`border rounded-lg p-4 transition-all ${
                                  content.completed
                                    ? 'bg-green-50 border-green-200'
                                    : 'hover:shadow-md cursor-pointer'
                                }`}
                                onClick={() => !content.completed && handleContentClick(content)}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-4">
                                    <div className="mt-1">
                                      {content.completed ? (
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                      ) : (
                                        <Circle className="h-6 w-6 text-gray-400" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        {getContentIcon(content.type)}
                                        <h3 className="font-semibold text-lg">{content.title}</h3>
                                        <Badge variant="outline">{content.type}</Badge>
                                        <span className="text-sm text-gray-500 flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {content.duration} min
                                        </span>
                                      </div>
                                      <p className="text-gray-600 mb-3">{content.description}</p>
                                      
                                      {/* Show exercises if any */}
                                      {content.exercises && content.exercises.length > 0 && (
                                        <div className="bg-gray-100 rounded-lg p-3 mt-3">
                                          <div className="flex items-center justify-between">
                                            <div>
                                              <p className="text-sm font-semibold text-gray-700">
                                                {content.exercises.length} Exercise{content.exercises.length > 1 ? 's' : ''}
                                              </p>
                                              <p className="text-xs text-gray-500 mt-1">
                                                Total: {content.exercises.reduce((sum, ex) => sum + ex.points, 0)} points
                                              </p>
                                            </div>
                                            <Award className="h-5 w-5 text-yellow-500" />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {!content.completed && (
                                    <Button size="sm" variant="ghost">
                                      <Play className="h-4 w-4 mr-1" />
                                      Start
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>

                        {/* Phase Summary */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-gray-700">
                                {activePhase === 'pre_class' ? 'Pre-Class' : 'Post-Class'} Progress
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Complete all activities before your next class
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-blue-600">
                                {Math.round(getPhaseProgress(selectedTopic.contents || [], activePhase))}%
                              </p>
                            </div>
                          </div>
                          <Progress 
                            value={getPhaseProgress(selectedTopic.contents || [], activePhase)} 
                            className="mt-3" 
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Content Available Yet
                  </h3>
                  <p className="text-gray-500">
                    Your learning content will appear here as your classes are scheduled.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}