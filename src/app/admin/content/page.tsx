'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  FileText, 
  Video, 
  Headphones, 
  Plus, 
  Edit,
  Trash2,
  Save,
  X,
  Clock,
  Users,
  GraduationCap,
  Lightbulb,
  Target,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Circle,
  PenTool,
  MessageSquare
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
  type: 'reading' | 'video' | 'audio' | 'exercise' | 'quiz' | 'discussion'
  phase: 'pre_class' | 'live_class' | 'post_class'
  duration: number // in minutes
  order: number
  resourceUrl?: string
  level: string
  topicId: string
  exercises?: Exercise[]
}

interface Topic {
  id: string
  name: string
  level: string
  description: string
  orderIndex: number
  contents?: Content[]
}

export default function ContentManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedLevel, setSelectedLevel] = useState('starter')
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const [editingContent, setEditingContent] = useState<Content | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedPhase, setSelectedPhase] = useState<'pre_class' | 'live_class' | 'post_class'>('pre_class')
  const [loading, setLoading] = useState(false)
  const [contents, setContents] = useState<Content[]>([])
  const [expandedContent, setExpandedContent] = useState<Set<string>>(new Set())

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'reading' as Content['type'],
    phase: 'pre_class' as Content['phase'],
    duration: 15,
    resourceUrl: '',
    order: 1
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/auth/login')
    } else {
      // Setup topics if needed
      setupTopicsIfNeeded()
    }
  }, [status, session, router])

  useEffect(() => {
    if (selectedLevel) {
      fetchTopics()
    }
  }, [selectedLevel])

  useEffect(() => {
    if (selectedTopic) {
      fetchContents()
    }
  }, [selectedTopic])

  const setupTopicsIfNeeded = async () => {
    try {
      await axios.post('/api/admin/setup-topics-if-needed')
    } catch (error) {
      console.error('Error setting up topics:', error)
    }
  }

  const fetchTopics = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/topics?level=${selectedLevel.toUpperCase()}`)
      setTopics(response.data)
      if (response.data.length > 0 && !selectedTopic) {
        setSelectedTopic(response.data[0].id)
      }
    } catch (error) {
      console.error('Error fetching topics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchContents = async () => {
    try {
      const response = await axios.get(`/api/admin/content?topicId=${selectedTopic}`)
      const contentData = response.data
      
      // Fetch exercises for this topic
      const exercisesResponse = await axios.get(`/api/admin/exercises?topicId=${selectedTopic}`)
      const exercises = exercisesResponse.data
      
      // Map exercises to content
      const contentWithExercises = contentData.map((content: Content) => ({
        ...content,
        exercises: exercises.filter((ex: any) => 
          (content.phase === 'pre_class' && ex.phase === 'PRE_CLASS') ||
          (content.phase === 'live_class' && ex.phase === 'PRE_CLASS') ||
          (content.phase === 'post_class' && ex.phase === 'AFTER_CLASS')
        )
      }))
      
      setContents(contentWithExercises)
    } catch (error) {
      console.error('Error fetching contents:', error)
    }
  }

  const handleSaveContent = async () => {
    if (!selectedTopic) return

    try {
      const contentData = {
        ...formData,
        topicId: selectedTopic,
        level: selectedLevel,
        id: editingContent?.id
      }

      if (editingContent) {
        // Update existing content
        await axios.put(`/api/admin/content/${editingContent.id}`, contentData)
      } else {
        // Create new content
        await axios.post('/api/admin/content', contentData)
      }

      // Refresh contents
      await fetchContents()
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'reading',
        phase: 'pre_class',
        duration: 15,
        resourceUrl: '',
        order: 1
      })
      setEditingContent(null)
      setShowAddForm(false)
    } catch (error) {
      console.error('Error saving content:', error)
    }
  }

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return

    try {
      await axios.delete(`/api/admin/content/${contentId}`)
      await fetchContents()
    } catch (error) {
      console.error('Error deleting content:', error)
    }
  }

  const getContentIcon = (type: Content['type']) => {
    switch (type) {
      case 'reading': return <FileText className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'audio': return <Headphones className="h-4 w-4" />
      case 'exercise': return <Target className="h-4 w-4" />
      case 'quiz': return <Lightbulb className="h-4 w-4" />
      case 'discussion': return <Users className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
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

  const currentTopic = topics.find(t => t.id === selectedTopic)
  const phaseContents = contents.filter(c => c.phase === selectedPhase) || []

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            Content Management
          </h1>
          <p className="text-gray-600">
            Manage pre-class, live class, and post-class content for all topics
          </p>
        </div>

        {/* Level and Topic Selection */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Select Level</Label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Select Topic</Label>
                <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id}>
                        {topic.orderIndex}. {topic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {currentTopic && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{currentTopic.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{currentTopic.description}</p>
                  </div>
                  {currentTopic.name === 'Travel: Things to Do' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        try {
                          const response = await axios.post('/api/admin/seed-starter-content')
                          if (response.data.success) {
                            alert('Sample content added successfully!')
                            await fetchTopics()
                          }
                        } catch (error: any) {
                          console.error('Error seeding content:', error)
                          const errorDetails = error.response?.data?.details || error.message || 'Unknown error'
                          alert(`Failed to add sample content: ${errorDetails}`)
                        }
                      }}
                    >
                      Add Sample Content
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Phases Tabs */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Content Sequence</CardTitle>
              <Button 
                onClick={() => {
                  setShowAddForm(true)
                  setFormData({ ...formData, phase: selectedPhase })
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Content
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedPhase} onValueChange={(v) => setSelectedPhase(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pre_class">Pre-Class</TabsTrigger>
                <TabsTrigger value="live_class">Live Class</TabsTrigger>
                <TabsTrigger value="post_class">Post-Class</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedPhase} className="mt-6">
                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : phaseContents.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No content added yet for this phase</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        setShowAddForm(true)
                        setFormData({ ...formData, phase: selectedPhase })
                      }}
                    >
                      Add First Content
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {phaseContents.sort((a, b) => a.order - b.order).map((content, index) => (
                      <div 
                        key={content.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-semibold">
                              {content.order}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {getContentIcon(content.type)}
                                <h4 className="font-semibold text-gray-900">{content.title}</h4>
                                <Badge variant="secondary" className={getPhaseColor(content.phase)}>
                                  {content.type}
                                </Badge>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  {content.duration} min
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{content.description}</p>
                              {content.resourceUrl && (
                                <p className="text-xs text-gray-500 mb-2">
                                  Resource: <a href={content.resourceUrl} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                                    {content.resourceUrl}
                                  </a>
                                </p>
                              )}
                              
                              {/* Show exercises for this content */}
                              {content.exercises && content.exercises.length > 0 && (
                                <div className="mt-3 pt-3 border-t">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Target className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-semibold text-gray-700">
                                      Exercises ({content.exercises.length})
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const newExpanded = new Set(expandedContent)
                                        if (newExpanded.has(content.id)) {
                                          newExpanded.delete(content.id)
                                        } else {
                                          newExpanded.add(content.id)
                                        }
                                        setExpandedContent(newExpanded)
                                      }}
                                    >
                                      {expandedContent.has(content.id) ? (
                                        <ChevronUp className="h-4 w-4" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                  
                                  {expandedContent.has(content.id) && (
                                    <div className="space-y-2 ml-6">
                                      {content.exercises.map((exercise, idx) => (
                                        <div key={exercise.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-1">
                                                {exercise.type === 'MULTIPLE_CHOICE' && <CheckCircle className="h-4 w-4 text-blue-500" />}
                                                {exercise.type === 'TRUE_FALSE' && <Circle className="h-4 w-4 text-green-500" />}
                                                {exercise.type === 'ESSAY' && <PenTool className="h-4 w-4 text-purple-500" />}
                                                {exercise.type === 'AUDIO_RECORDING' && <Headphones className="h-4 w-4 text-orange-500" />}
                                                {exercise.type === 'GAP_FILL' && <FileText className="h-4 w-4 text-red-500" />}
                                                {exercise.type === 'MATCHING' && <MessageSquare className="h-4 w-4 text-indigo-500" />}
                                                <span className="font-medium">{exercise.title}</span>
                                                <Badge variant="outline" className="text-xs">
                                                  {exercise.type.replace('_', ' ')}
                                                </Badge>
                                                <Badge variant="secondary" className="text-xs">
                                                  {exercise.category}
                                                </Badge>
                                              </div>
                                              <p className="text-gray-600 mb-1">{exercise.instructions}</p>
                                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span>Points: {exercise.points}</span>
                                                <span>Phase: {exercise.phase.replace('_', ' ')}</span>
                                              </div>
                                              
                                              {/* Show exercise content preview */}
                                              {exercise.content && (
                                                <div className="mt-2 p-2 bg-white rounded border text-xs">
                                                  {exercise.content.question && (
                                                    <p className="font-medium mb-1">Q: {exercise.content.question}</p>
                                                  )}
                                                  {exercise.content.prompt && (
                                                    <p className="font-medium mb-1">Prompt: {exercise.content.prompt}</p>
                                                  )}
                                                  {exercise.content.options && (
                                                    <div className="ml-3">
                                                      {exercise.content.options.map((opt: string, i: number) => (
                                                        <div key={i} className="flex items-center gap-1">
                                                          <span className="text-gray-500">{String.fromCharCode(65 + i)}.</span>
                                                          <span>{opt}</span>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  )}
                                                  {exercise.correctAnswer && exercise.correctAnswer.answer && (
                                                    <p className="text-green-600 mt-1">
                                                      Answer: {exercise.correctAnswer.answer}
                                                    </p>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setEditingContent(content)
                                setFormData({
                                  title: content.title,
                                  description: content.description,
                                  type: content.type,
                                  phase: content.phase,
                                  duration: content.duration,
                                  resourceUrl: content.resourceUrl || '',
                                  order: content.order
                                })
                                setShowAddForm(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteContent(content.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    {editingContent ? 'Edit Content' : 'Add New Content'}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingContent(null)
                      setFormData({
                        title: '',
                        description: '',
                        type: 'reading',
                        phase: 'pre_class',
                        duration: 15,
                        resourceUrl: '',
                        order: 1
                      })
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter content title"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this content covers"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Content Type</Label>
                    <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reading">Reading Material</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                        <SelectItem value="exercise">Exercise</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="discussion">Discussion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Phase</Label>
                    <Select value={formData.phase} onValueChange={(v) => setFormData({ ...formData, phase: v as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pre_class">Pre-Class</SelectItem>
                        <SelectItem value="live_class">Live Class</SelectItem>
                        <SelectItem value="post_class">Post-Class</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      min={1}
                    />
                  </div>

                  <div>
                    <Label>Order</Label>
                    <Input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      min={1}
                    />
                  </div>
                </div>

                <div>
                  <Label>Resource URL (optional)</Label>
                  <Input
                    value={formData.resourceUrl}
                    onChange={(e) => setFormData({ ...formData, resourceUrl: e.target.value })}
                    placeholder="https://example.com/resource"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingContent(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveContent}>
                    <Save className="h-4 w-4 mr-2" />
                    {editingContent ? 'Update' : 'Save'} Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}