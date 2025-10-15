'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  Video,
  MessageSquare,
  FileText,
  ChevronRight,
  CheckCircle,
  Circle,
  Play,
  Monitor,
  Target,
  Lightbulb,
  Timer,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import axios from 'axios'
import { format } from 'date-fns'

interface Content {
  id: string
  title: string
  description: string
  type: string
  phase: string
  duration: number
  resourceUrl?: string
  order: number
}

interface Topic {
  id: string
  name: string
  level: string
  orderIndex: number
  contents?: Content[]
}

interface ClassSession {
  id: string
  date: string
  time: string
  status: string
  studentName: string
  studentId: string
  topic: Topic
}

export default function TeacherClassesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [classes, setClasses] = useState<ClassSession[]>([])
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'past'>('today')
  const [expandedContent, setExpandedContent] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'TEACHER') {
      router.push('/auth/login')
      return
    }
    fetchTeacherClasses()
  }, [status, session])

  const fetchTeacherClasses = async () => {
    setLoading(true)
    try {
      // Fetch teacher's classes
      const classesResponse = await axios.get('/api/teacher/classes')
      const classesData = classesResponse.data

      // Fetch content for each class topic
      const classesWithContent = await Promise.all(
        classesData.map(async (cls: any) => {
          if (!cls.topic) return cls

          const contentResponse = await axios.get(`/api/teacher/class-content?topicId=${cls.topic.id}`)
          return {
            ...cls,
            topic: {
              ...cls.topic,
              contents: contentResponse.data
            }
          }
        })
      )

      setClasses(classesWithContent)

      // Auto-select today's first class
      const today = new Date().toISOString().split('T')[0]
      const todayClass = classesWithContent.find(
        (cls: ClassSession) => cls.date === today && cls.status === 'confirmed'
      )
      if (todayClass) {
        setSelectedClass(todayClass)
      }
    } catch (error) {
      console.error('Error fetching teacher classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterClasses = (tab: string) => {
    const today = new Date().toISOString().split('T')[0]
    
    switch (tab) {
      case 'today':
        return classes.filter(cls => cls.date === today)
      case 'upcoming':
        return classes.filter(cls => cls.date > today)
      case 'past':
        return classes.filter(cls => cls.date < today)
      default:
        return []
    }
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'discussion': return <MessageSquare className="h-4 w-4" />
      case 'exercise': return <FileText className="h-4 w-4" />
      case 'quiz': return <Target className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'reading': return <BookOpen className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const startClass = (classSession: ClassSession) => {
    // Navigate to live class room
    router.push(`/teacher/live-class/${classSession.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your classes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Classes</h1>
          <p className="text-gray-600">Manage your live classes and course content</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Class List */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                  <TabsList className="w-full rounded-none">
                    <TabsTrigger value="today" className="flex-1">
                      Today ({filterClasses('today').length})
                    </TabsTrigger>
                    <TabsTrigger value="upcoming" className="flex-1">
                      Upcoming
                    </TabsTrigger>
                    <TabsTrigger value="past" className="flex-1">
                      Past
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab} className="m-0">
                    <div className="divide-y max-h-[600px] overflow-y-auto">
                      {filterClasses(activeTab).map((cls) => (
                        <button
                          key={cls.id}
                          onClick={() => setSelectedClass(cls)}
                          className={`w-full p-4 text-left transition-colors ${
                            selectedClass?.id === cls.id
                              ? 'bg-blue-50 border-l-4 border-blue-600'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="font-semibold text-sm">{cls.time}</span>
                                <Badge variant={cls.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                                  {cls.status}
                                </Badge>
                              </div>
                              <p className="font-medium text-sm">{cls.studentName}</p>
                              <p className="text-xs text-gray-600 mt-1">
                                Topic {cls.topic.orderIndex}: {cls.topic.name}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 mt-1" />
                          </div>
                        </button>
                      ))}
                      
                      {filterClasses(activeTab).length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                          No classes scheduled
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Class Details */}
          <div className="lg:col-span-2">
            {selectedClass ? (
              <>
                {/* Class Header */}
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold mb-1">
                          {selectedClass.topic.name}
                        </h2>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {selectedClass.studentName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(selectedClass.date), 'MMMM d, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {selectedClass.time}
                          </span>
                        </div>
                      </div>
                      {selectedClass.status === 'confirmed' && activeTab === 'today' && (
                        <Button 
                          onClick={() => startClass(selectedClass)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Monitor className="h-4 w-4 mr-2" />
                          Start Class
                        </Button>
                      )}
                    </div>

                    {/* Class Overview */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <Lightbulb className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Pre-Class</p>
                        <p className="font-semibold">
                          {selectedClass.topic.contents?.filter(c => c.phase === 'pre_class').length || 0} items
                        </p>
                      </div>
                      <div className="text-center">
                        <Monitor className="h-6 w-6 text-green-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Live Class</p>
                        <p className="font-semibold">
                          {selectedClass.topic.contents?.filter(c => c.phase === 'live_class').length || 0} activities
                        </p>
                      </div>
                      <div className="text-center">
                        <Target className="h-6 w-6 text-purple-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Post-Class</p>
                        <p className="font-semibold">
                          {selectedClass.topic.contents?.filter(c => c.phase === 'post_class').length || 0} exercises
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Live Class Content */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="h-5 w-5 text-green-600" />
                      Live Class Activities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedClass.topic.contents
                        ?.filter(c => c.phase === 'live_class')
                        .sort((a, b) => a.order - b.order)
                        .map((content, index) => (
                          <div
                            key={content.id}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  {getContentIcon(content.type)}
                                  <h4 className="font-semibold">{content.title}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {content.type}
                                  </Badge>
                                  <span className="text-xs text-gray-500 flex items-center gap-1 ml-auto">
                                    <Timer className="h-3 w-3" />
                                    {content.duration} min
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{content.description}</p>
                                
                                {/* Teaching Tips */}
                                <button
                                  onClick={() => {
                                    const newExpanded = new Set(expandedContent)
                                    if (newExpanded.has(content.id)) {
                                      newExpanded.delete(content.id)
                                    } else {
                                      newExpanded.add(content.id)
                                    }
                                    setExpandedContent(newExpanded)
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                  <Lightbulb className="h-3 w-3" />
                                  Teaching Tips
                                  {expandedContent.has(content.id) ? (
                                    <ChevronUp className="h-3 w-3" />
                                  ) : (
                                    <ChevronDown className="h-3 w-3" />
                                  )}
                                </button>
                                
                                {expandedContent.has(content.id) && (
                                  <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm">
                                    {content.type === 'discussion' && (
                                      <ul className="space-y-1">
                                        <li>• Encourage all students to participate</li>
                                        <li>• Use open-ended questions to stimulate conversation</li>
                                        <li>• Provide vocabulary support as needed</li>
                                      </ul>
                                    )}
                                    {content.type === 'exercise' && (
                                      <ul className="space-y-1">
                                        <li>• Model the exercise first</li>
                                        <li>• Provide clear instructions</li>
                                        <li>• Give immediate feedback</li>
                                      </ul>
                                    )}
                                    {content.type === 'quiz' && (
                                      <ul className="space-y-1">
                                        <li>• Keep it interactive and fun</li>
                                        <li>• Celebrate correct answers</li>
                                        <li>• Use mistakes as learning opportunities</li>
                                      </ul>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Class Timeline */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Suggested Class Timeline
                      </h4>
                      <div className="space-y-2 text-sm">
                        {selectedClass.topic.contents
                          ?.filter(c => c.phase === 'live_class')
                          .sort((a, b) => a.order - b.order)
                          .reduce((acc: any[], content, index) => {
                            const startTime = index === 0 ? 0 : acc[index - 1].endTime
                            const endTime = startTime + content.duration
                            acc.push({
                              ...content,
                              startTime,
                              endTime
                            })
                            return acc
                          }, [])
                          .map((content: any) => (
                            <div key={content.id} className="flex items-center gap-3">
                              <span className="text-gray-500 font-mono">
                                {String(content.startTime).padStart(2, '0')}:00 - {String(content.endTime).padStart(2, '0')}:00
                              </span>
                              <span className="font-medium">{content.title}</span>
                            </div>
                          ))}
                        <div className="pt-2 mt-2 border-t text-gray-600">
                          Total class time: 60 minutes
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Select a Class
                  </h3>
                  <p className="text-gray-500">
                    Choose a class from the list to view details and content
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