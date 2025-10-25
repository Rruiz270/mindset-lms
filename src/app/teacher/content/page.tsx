'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BookOpen,
  FileText,
  Video,
  Headphones,
  Target,
  Clock,
  GraduationCap,
  ChevronRight,
  Search,
  Filter,
  Users,
  MessageSquare,
  PlayCircle,
  Calendar,
  CheckCircle,
  Circle,
  UserCheck,
  Activity,
  BarChart3,
  Eye,
  CheckSquare
} from 'lucide-react'
import axios from 'axios'

interface Exercise {
  id: string
  type: string
  category: string
  title: string
  instructions: string
}

interface Content {
  id: string
  title: string
  description: string
  type: 'reading' | 'video' | 'audio' | 'exercise' | 'quiz' | 'discussion'
  phase: 'pre_class' | 'live_class' | 'post_class'
  duration: number
  resourceUrl?: string
  order: number
  level: string
  topicId: string
  topicName?: string
  topicOrderIndex?: number
  exercises?: Exercise[]
}

interface ScheduledClass {
  id: string
  date: string
  time: string
  topicId: string
  topicName: string
  level: string
  students: {
    id: string
    name: string
    email: string
  }[]
}

interface StudentProgress {
  studentId: string
  studentName: string
  contentId: string
  completed: boolean
  completedAt?: string
}

interface ContentWithProgress extends Content {
  studentProgress: StudentProgress[]
  isMarkedAsCovered?: boolean
}

export default function TeacherContentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [contents, setContents] = useState<ContentWithProgress[]>([])
  const [filteredContents, setFilteredContents] = useState<ContentWithProgress[]>([])
  const [scheduledClasses, setScheduledClasses] = useState<ScheduledClass[]>([])
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedPhase, setSelectedPhase] = useState<'all' | 'pre_class' | 'live_class' | 'post_class'>('all')
  const [selectedType, setSelectedType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'scheduled' | 'all'>('scheduled')

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'TEACHER') {
      router.push('/auth/login')
      return
    }
    fetchScheduledClasses()
    if (activeTab === 'all') {
      fetchAllContents()
    }
  }, [status, session, activeTab])

  useEffect(() => {
    if (selectedClass && activeTab === 'scheduled') {
      fetchClassContent()
    }
  }, [selectedClass])

  useEffect(() => {
    filterContents()
  }, [contents, selectedLevel, selectedPhase, selectedType, searchTerm])

  const fetchScheduledClasses = async () => {
    try {
      const response = await axios.get('/api/teacher/scheduled-classes')
      setScheduledClasses(response.data)
      if (response.data.length > 0) {
        setSelectedClass(response.data[0].id)
      }
    } catch (error) {
      console.error('Error fetching scheduled classes:', error)
      // Fallback to all content if no scheduled classes
      setActiveTab('all')
      fetchAllContents()
    }
  }

  const fetchClassContent = async () => {
    if (!selectedClass) return
    
    setLoading(true)
    try {
      const selectedClassData = scheduledClasses.find(c => c.id === selectedClass)
      if (!selectedClassData) return

      const response = await axios.get(`/api/teacher/class-content?topicId=${selectedClassData.topicId}`)
      const contentData = response.data

      // Fetch student progress for this content
      const progressResponse = await axios.get(`/api/teacher/student-progress?classId=${selectedClass}`)
      const progressData = progressResponse.data

      // Combine content with progress data
      const contentWithProgress = contentData.map((content: Content) => ({
        ...content,
        studentProgress: progressData.filter((p: StudentProgress) => p.contentId === content.id) || [],
        isMarkedAsCovered: false // This would come from teacher's marking
      }))

      setContents(contentWithProgress)
      setFilteredContents(contentWithProgress)
    } catch (error) {
      console.error('Error fetching class content:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllContents = async () => {
    try {
      const response = await axios.get('/api/teacher/content')
      const contentData = response.data.map((content: Content) => ({
        ...content,
        studentProgress: [],
        isMarkedAsCovered: false
      }))
      setContents(contentData)
      setFilteredContents(contentData)
    } catch (error) {
      console.error('Error fetching contents:', error)
    } finally {
      setLoading(false)
    }
  }

  const markContentAsCovered = async (contentId: string) => {
    try {
      await axios.post(`/api/teacher/mark-content-covered`, {
        contentId,
        classId: selectedClass
      })
      
      // Update local state
      setContents(prev => prev.map(c => 
        c.id === contentId ? { ...c, isMarkedAsCovered: true } : c
      ))
      setFilteredContents(prev => prev.map(c => 
        c.id === contentId ? { ...c, isMarkedAsCovered: true } : c
      ))
    } catch (error) {
      console.error('Error marking content as covered:', error)
    }
  }

  const filterContents = () => {
    let filtered = [...contents]

    // Filter by level (only for 'all' tab)
    if (selectedLevel !== 'all' && activeTab === 'all') {
      filtered = filtered.filter(c => c.level.toLowerCase() === selectedLevel.toLowerCase())
    }

    // Filter by phase
    if (selectedPhase !== 'all') {
      filtered = filtered.filter(c => c.phase === selectedPhase)
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(c => c.type === selectedType)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.topicName && c.topicName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredContents(filtered)
  }

  const getContentIcon = (type: Content['type']) => {
    switch (type) {
      case 'reading': return <FileText className="h-5 w-5" />
      case 'video': return <Video className="h-5 w-5" />
      case 'audio': return <Headphones className="h-5 w-5" />
      case 'exercise': return <Target className="h-5 w-5" />
      case 'quiz': return <BookOpen className="h-5 w-5" />
      case 'discussion': return <MessageSquare className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
    }
  }

  const getPhaseColor = (phase: Content['phase']) => {
    switch (phase) {
      case 'pre_class': return 'bg-blue-100 text-blue-800'
      case 'live_class': return 'bg-green-100 text-green-800'
      case 'post_class': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: Content['type']) => {
    switch (type) {
      case 'reading': return 'bg-indigo-100 text-indigo-800'
      case 'video': return 'bg-red-100 text-red-800'
      case 'audio': return 'bg-yellow-100 text-yellow-800'
      case 'exercise': return 'bg-green-100 text-green-800'
      case 'quiz': return 'bg-blue-100 text-blue-800'
      case 'discussion': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStudentProgressSummary = (content: ContentWithProgress) => {
    if (!content.studentProgress || content.studentProgress.length === 0) {
      return { completed: 0, total: 0, percentage: 0 }
    }
    
    const completed = content.studentProgress.filter(p => p.completed).length
    const total = content.studentProgress.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    
    return { completed, total, percentage }
  }

  const selectedClassData = scheduledClasses.find(c => c.id === selectedClass)

  // Group contents by topic for 'all' tab
  const contentsByTopic = activeTab === 'all' ? filteredContents.reduce((acc, content) => {
    const key = content.topicId
    if (!acc[key]) {
      acc[key] = {
        topicName: content.topicName || 'Unknown Topic',
        topicOrderIndex: content.topicOrderIndex || 0,
        contents: []
      }
    }
    acc[key].contents.push(content)
    return acc
  }, {} as Record<string, { topicName: string, topicOrderIndex: number, contents: ContentWithProgress[] }>) : {}

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content library...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            Teaching Content Management
          </h1>
          <p className="text-gray-600">
            View content for scheduled classes, track student progress, and manage teaching resources
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-6">
          <TabsList>
            <TabsTrigger value="scheduled" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Scheduled Classes
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              All Content Library
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scheduled" className="space-y-6">
            {/* Class Selection */}
            {scheduledClasses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Select Class
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Scheduled Class</label>
                      <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a scheduled class" />
                        </SelectTrigger>
                        <SelectContent>
                          {scheduledClasses.map((classItem) => (
                            <SelectItem key={classItem.id} value={classItem.id}>
                              {classItem.topicName} - {new Date(classItem.date).toLocaleDateString()} at {classItem.time} ({classItem.level})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedClassData && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">{selectedClassData.topicName}</h3>
                        <div className="space-y-1 text-sm text-blue-800">
                          <p>Date: {new Date(selectedClassData.date).toLocaleDateString()}</p>
                          <p>Time: {selectedClassData.time}</p>
                          <p>Level: {selectedClassData.level}</p>
                          <p className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {selectedClassData.students.length} students
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Content for Selected Class */}
            {selectedClass && (
              <>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading class content...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Content organized by phase */}
                    {['pre_class', 'live_class', 'post_class'].map((phase) => {
                      const phaseContents = filteredContents.filter(c => c.phase === phase)
                      if (phaseContents.length === 0) return null

                      return (
                        <Card key={phase}>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              {phase === 'pre_class' && <Clock className="h-5 w-5 text-blue-600" />}
                              {phase === 'live_class' && <PlayCircle className="h-5 w-5 text-green-600" />}
                              {phase === 'post_class' && <CheckCircle className="h-5 w-5 text-purple-600" />}
                              {phase.replace('_', '-').toUpperCase()} CONTENT
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {phaseContents
                                .sort((a, b) => a.order - b.order)
                                .map((content) => {
                                  const progress = getStudentProgressSummary(content)
                                  return (
                                    <div 
                                      key={content.id}
                                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4 flex-1">
                                          <div className="mt-1">
                                            {getContentIcon(content.type)}
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                              <h4 className="font-semibold text-gray-900">
                                                {content.title}
                                              </h4>
                                              {content.isMarkedAsCovered && (
                                                <Badge className="bg-green-100 text-green-800">
                                                  <CheckCircle className="h-3 w-3 mr-1" />
                                                  Covered
                                                </Badge>
                                              )}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3">
                                              {content.description}
                                            </p>
                                            <div className="flex items-center gap-4 flex-wrap mb-3">
                                              <Badge className={getPhaseColor(content.phase)}>
                                                {content.phase.replace('_', ' ')}
                                              </Badge>
                                              <Badge variant="outline" className={getTypeColor(content.type)}>
                                                {content.type}
                                              </Badge>
                                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {content.duration} min
                                              </span>
                                              {content.exercises && content.exercises.length > 0 && (
                                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                                  <Target className="h-3 w-3" />
                                                  {content.exercises.length} exercises
                                                </span>
                                              )}
                                            </div>
                                            
                                            {/* Student Progress Bar */}
                                            {selectedClassData && progress.total > 0 && (
                                              <div className="mb-3">
                                                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                                  <span className="flex items-center gap-1">
                                                    <UserCheck className="h-3 w-3" />
                                                    Student Progress
                                                  </span>
                                                  <span>{progress.completed}/{progress.total} ({progress.percentage}%)</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                  <div 
                                                    className="bg-green-600 h-2 rounded-full transition-all" 
                                                    style={{ width: `${progress.percentage}%` }}
                                                  ></div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        
                                        <div className="flex flex-col gap-2">
                                          <Button
                                            size="sm"
                                            onClick={() => router.push(`/teacher/content/${content.id}`)}
                                            className="flex items-center gap-1"
                                          >
                                            <Eye className="h-3 w-3" />
                                            View
                                          </Button>
                                          {content.phase === 'live_class' && !content.isMarkedAsCovered && (
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => markContentAsCovered(content.id)}
                                              className="flex items-center gap-1"
                                            >
                                              <CheckSquare className="h-3 w-3" />
                                              Mark Covered
                                            </Button>
                                          )}
                                          {content.resourceUrl && (
                                            <Button size="sm" variant="outline" asChild>
                                              <a href={content.resourceUrl} target="_blank" rel="noopener noreferrer">
                                                Resource
                                              </a>
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {scheduledClasses.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-2">No scheduled classes found</p>
                  <p className="text-sm text-gray-400">Switch to "All Content Library" to browse available content</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-6">

            {/* Filters for All Content */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Level</label>
                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="starter">Starter</SelectItem>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Phase</label>
                    <Select value={selectedPhase} onValueChange={(v) => setSelectedPhase(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Phases</SelectItem>
                        <SelectItem value="pre_class">Pre-Class</SelectItem>
                        <SelectItem value="live_class">Live Class</SelectItem>
                        <SelectItem value="post_class">Post-Class</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Type</label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="reading">Reading</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                        <SelectItem value="exercise">Exercise</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="discussion">Discussion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content by Topic */}
            {Object.entries(contentsByTopic)
              .sort((a, b) => a[1].topicOrderIndex - b[1].topicOrderIndex)
              .map(([topicId, topic]) => (
                <Card key={topicId} className="mb-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">
                        Topic {topic.topicOrderIndex}: {topic.topicName}
                      </CardTitle>
                      <Button
                        onClick={() => router.push(`/teacher/content/${topicId}`)}
                        className="flex items-center gap-2"
                      >
                        <BarChart3 className="h-4 w-4" />
                        View Topic Details
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topic.contents
                        .sort((a, b) => {
                          const phaseOrder = { pre_class: 1, live_class: 2, post_class: 3 }
                          if (a.phase !== b.phase) {
                            return phaseOrder[a.phase] - phaseOrder[b.phase]
                          }
                          return a.order - b.order
                        })
                        .map((content) => (
                          <div 
                            key={content.id}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => router.push(`/teacher/content/${content.id}`)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4 flex-1">
                                <div className="mt-1">
                                  {getContentIcon(content.type)}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 mb-1">
                                    {content.title}
                                  </h4>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {content.description}
                                  </p>
                                  <div className="flex items-center gap-4 flex-wrap">
                                    <Badge className={getPhaseColor(content.phase)}>
                                      {content.phase.replace('_', ' ')}
                                    </Badge>
                                    <Badge variant="outline" className={getTypeColor(content.type)}>
                                      {content.type}
                                    </Badge>
                                    <span className="text-sm text-gray-500 flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {content.duration} min
                                    </span>
                                    {content.exercises && content.exercises.length > 0 && (
                                      <span className="text-sm text-gray-500 flex items-center gap-1">
                                        <Target className="h-3 w-3" />
                                        {content.exercises.length} exercises
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-400 mt-1" />
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

            {filteredContents.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No content found matching your filters</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}