'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft,
  Play,
  CheckCircle,
  Clock,
  FileText,
  Video,
  Headphones,
  BookOpen,
  ChevronRight
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
  topicName?: string
}

export default function ContentViewerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'STUDENT') {
      router.push('/auth/login')
      return
    }
    fetchContent()
  }, [status, session, params.contentId])

  useEffect(() => {
    // Track time spent
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const fetchContent = async () => {
    try {
      const response = await axios.get(`/api/student/content/${params.contentId}`)
      setContent(response.data)
      
      // Check if already completed
      const progressResponse = await axios.get(`/api/student/progress/${params.contentId}`)
      setCompleted(progressResponse.data.completed || false)
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsComplete = async () => {
    try {
      await axios.post('/api/student/progress/complete', {
        contentId: params.contentId,
        timeSpent
      })
      setCompleted(true)
      
      // Navigate to exercises if available
      if (content?.type === 'exercise' || content?.phase === 'post_class') {
        router.push(`/student/exercises/${params.contentId}`)
      } else {
        setTimeout(() => {
          router.push('/student/learning')
        }, 1500)
      }
    } catch (error) {
      console.error('Error marking as complete:', error)
    }
  }

  const getContentIcon = () => {
    switch (content?.type) {
      case 'video': return <Video className="h-6 w-6" />
      case 'audio': return <Headphones className="h-6 w-6" />
      case 'reading': return <BookOpen className="h-6 w-6" />
      default: return <FileText className="h-6 w-6" />
    }
  }

  const renderContent = () => {
    if (!content?.resourceUrl) {
      return (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Content resource not available yet</p>
        </div>
      )
    }

    switch (content.type) {
      case 'video':
        return (
          <div className="relative pb-[56.25%] h-0">
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              src={content.resourceUrl}
              title={content.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )
      
      case 'audio':
        return (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <Headphones className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-4">Audio Content</h3>
            <audio controls className="w-full max-w-md mx-auto">
              <source src={content.resourceUrl} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
            <p className="text-sm text-gray-600 mt-4">
              Listen carefully and take notes. You may need to listen multiple times.
            </p>
          </div>
        )
      
      case 'reading':
        return (
          <div className="bg-white border rounded-lg p-8">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold mb-4">{content.title}</h2>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Study Tip:</strong> Read through the material once for general understanding, 
                  then read again more carefully, noting down new vocabulary and key concepts.
                </p>
              </div>
              
              {/* Sample reading content */}
              <div className="space-y-4 text-gray-700">
                <p>
                  Welcome to today's reading material. This content has been carefully designed 
                  to help you improve your English comprehension and vocabulary.
                </p>
                <p>
                  As you read, pay attention to new words and phrases. Try to understand their 
                  meaning from context before looking them up in a dictionary.
                </p>
                <h3 className="text-xl font-semibold mt-6 mb-3">Key Vocabulary</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Comprehension</strong> - understanding of written or spoken information</li>
                  <li><strong>Context</strong> - the circumstances that form the setting</li>
                  <li><strong>Vocabulary</strong> - the body of words used in a particular language</li>
                </ul>
                <h3 className="text-xl font-semibold mt-6 mb-3">Practice Exercise</h3>
                <p>
                  After reading this material, try to summarize the main points in your own words. 
                  This will help reinforce your understanding and improve your ability to express 
                  ideas in English.
                </p>
              </div>
              
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <a 
                  href={content.resourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Open full document in new tab
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Content type not supported</p>
          </div>
        )
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
          <Button onClick={() => router.push('/student/learning')} className="mt-4">
            Back to Learning
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/student/learning')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Learning
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {getContentIcon()}
                <h1 className="text-3xl font-bold">{content.title}</h1>
                {completed && (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
              </div>
              <p className="text-gray-600">{content.description}</p>
              <div className="flex items-center gap-4 mt-3">
                <Badge variant="outline">
                  {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                </Badge>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {content.duration} minutes
                </span>
                {content.topicName && (
                  <span className="text-sm text-gray-500">
                    Topic: {content.topicName}
                  </span>
                )}
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Time spent</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.floor(timeSpent / 60)}:{String(timeSpent % 60).padStart(2, '0')}
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <Progress 
            value={Math.min((timeSpent / (content.duration * 60)) * 100, 100)} 
            className="h-2" 
          />
        </div>

        {/* Content Area */}
        <Card className="mb-6">
          <CardContent className="p-8">
            {renderContent()}
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {completed 
              ? "You've completed this content! Great job!" 
              : "Make sure to review all the material before marking as complete."}
          </p>
          
          {!completed && (
            <Button
              onClick={markAsComplete}
              size="lg"
              disabled={timeSpent < 30} // Require at least 30 seconds
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Mark as Complete
            </Button>
          )}
          
          {completed && content.phase === 'pre_class' && (
            <Button
              onClick={() => router.push('/student/learning')}
              size="lg"
            >
              Continue Learning
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}