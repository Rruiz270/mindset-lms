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
  Video,
  Headphones,
  FileText,
  MessageSquare,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import axios from 'axios'

interface Content {
  id: string
  title: string
  description: string
  type: string
  phase: string
  duration: number
  resourceUrl?: string
  order: number
  level: string
  topicId: string
  exercises?: any[]
}

interface Topic {
  id: string
  name: string
  level: string
  orderIndex: number
  contents: Content[]
}

export default function ContentReviewPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState('STARTER')
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/admin')
      return
    }
    fetchTopicsWithContent()
  }, [status, session, selectedLevel])

  const fetchTopicsWithContent = async () => {
    setLoading(true)
    try {
      // Fetch topics
      const topicsResponse = await axios.get(`/api/admin/topics?level=${selectedLevel}`)
      const topicsData = topicsResponse.data

      // Fetch content for each topic
      const topicsWithContent = await Promise.all(
        topicsData.map(async (topic: any) => {
          const contentResponse = await axios.get(`/api/admin/content?topicId=${topic.id}`)
          
          // Fetch exercises for this topic
          const exercisesResponse = await axios.get(`/api/admin/exercises?topicId=${topic.id}`)
          const exercises = exercisesResponse.data
          
          // Group exercises by content phase
          const contentWithExercises = contentResponse.data.map((content: Content) => ({
            ...content,
            exercises: exercises.filter((ex: any) => 
              (content.phase === 'pre_class' && ex.phase === 'PRE_CLASS') ||
              (content.phase === 'live_class' && ex.phase === 'PRE_CLASS') ||
              (content.phase === 'post_class' && ex.phase === 'AFTER_CLASS')
            )
          }))
          
          return {
            ...topic,
            contents: contentWithExercises.sort((a: Content, b: Content) => a.order - b.order)
          }
        })
      )

      setTopics(topicsWithContent)
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />
      case 'audio': return <Headphones className="h-4 w-4" />
      case 'reading': return <BookOpen className="h-4 w-4" />
      case 'exercise': return <FileText className="h-4 w-4" />
      case 'discussion': return <MessageSquare className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
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

  const toggleTopic = (topicId: string) => {
    const newExpanded = new Set(expandedTopics)
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId)
    } else {
      newExpanded.add(topicId)
    }
    setExpandedTopics(newExpanded)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Review</h1>
          <p className="text-gray-600">Review all generated content and exercises by topic</p>
        </div>

        {/* Level Selector */}
        <div className="mb-6">
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STARTER">Starter</SelectItem>
              <SelectItem value="SURVIVOR">Survivor</SelectItem>
              <SelectItem value="EXPLORER">Explorer</SelectItem>
              <SelectItem value="EXPERT">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Topics with Content */}
        <div className="space-y-4">
          {topics.map((topic) => (
            <Card key={topic.id}>
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleTopic(topic.id)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    {topic.orderIndex}. {topic.name}
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {topic.contents.length} content items
                    </span>
                    {expandedTopics.has(topic.id) ? 
                      <ChevronUp className="h-5 w-5" /> : 
                      <ChevronDown className="h-5 w-5" />
                    }
                  </div>
                </div>
              </CardHeader>
              
              {expandedTopics.has(topic.id) && (
                <CardContent>
                  <div className="space-y-4">
                    {['pre_class', 'live_class', 'post_class'].map(phase => {
                      const phaseContent = topic.contents.filter(c => c.phase === phase)
                      if (phaseContent.length === 0) return null
                      
                      return (
                        <div key={phase} className="border rounded-lg p-4">
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Badge className={getPhaseColor(phase)}>
                              {phase.replace('_', ' ').charAt(0).toUpperCase() + phase.replace('_', ' ').slice(1)}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              ({phaseContent.reduce((acc, c) => acc + c.duration, 0)} minutes)
                            </span>
                          </h3>
                          
                          <div className="space-y-3">
                            {phaseContent.map((content) => (
                              <div key={content.id} className="bg-gray-50 p-3 rounded">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      {getContentIcon(content.type)}
                                      <span className="font-medium">{content.title}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {content.type}
                                      </Badge>
                                      <Badge variant="secondary" className="text-xs">
                                        {content.duration} min
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{content.description}</p>
                                    
                                    {content.exercises && content.exercises.length > 0 && (
                                      <div className="mt-2 pl-6">
                                        <span className="text-xs font-semibold text-gray-700">Exercises:</span>
                                        {content.exercises.map((ex: any, idx: number) => (
                                          <div key={idx} className="text-xs text-gray-600 ml-2">
                                            • {ex.title} ({ex.type}, {ex.points} pts)
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Summary Stats */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{topics.length}</div>
                <div className="text-sm text-gray-600">Topics</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {topics.reduce((acc, t) => acc + t.contents.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Content Items</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {topics.reduce((acc, t) => acc + t.contents.reduce((ca, c) => ca + (c.exercises?.length || 0), 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Exercises</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="mt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/content-builder')}
          >
            Back to Content Builder
          </Button>
        </div>
      </div>
    </div>
  )
}