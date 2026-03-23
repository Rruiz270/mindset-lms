'use client'

import { Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BookOpen,
  MessageCircle,
  Languages,
  Lightbulb,
  CheckCircle,
} from 'lucide-react'

interface Slide {
  id: string
  slideNumber: number
  title: string
  type: string
  content: Record<string, unknown>
  notes: string | null
}

interface Topic {
  name: string
  level: string
}

const SLIDE_TYPES: Record<string, { icon: typeof BookOpen; color: string; bg: string }> = {
  intro: { icon: Lightbulb, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  vocabulary: { icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  grammar: { icon: Languages, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  communication: { icon: MessageCircle, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  review: { icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
}

export default function SlideViewerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}>
      <SlideViewerContent />
    </Suspense>
  )
}

function SlideViewerContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const topicId = searchParams.get('topicId')

  const [slides, setSlides] = useState<Slide[]>([])
  const [topic, setTopic] = useState<Topic | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)
  const [topics, setTopics] = useState<Array<{ id: string; name: string; orderIndex: number }>>([])
  const [showTopicPicker, setShowTopicPicker] = useState(!topicId)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
    else if (session?.user?.role !== 'STUDENT') router.push('/dashboard')
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.level && !topicId) {
      fetchTopics()
    }
  }, [session?.user?.level, topicId])

  useEffect(() => {
    if (topicId) {
      fetchSlides(topicId)
      setShowTopicPicker(false)
    }
  }, [topicId])

  const fetchTopics = async () => {
    try {
      const level = session?.user?.level || 'STARTER'
      const res = await fetch(`/api/student/topics?level=${level}`)
      if (res.ok) {
        const data = await res.json()
        setTopics(data)
      }
    } catch (error) {
      console.error('Error fetching topics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSlides = async (id: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/student/slides?topicId=${id}`)
      if (res.ok) {
        const data = await res.json()
        setSlides(data.slides || [])
        setTopic(data.topic || null)
        setCurrentSlide(0)
      }
    } catch (error) {
      console.error('Error fetching slides:', error)
    } finally {
      setLoading(false)
    }
  }

  const slide = slides[currentSlide]
  const slideConfig = slide ? SLIDE_TYPES[slide.type] || SLIDE_TYPES.intro : SLIDE_TYPES.intro
  const SlideIcon = slideConfig.icon

  const renderSlideContent = (s: Slide) => {
    const c = s.content as Record<string, unknown>

    switch (s.type) {
      case 'intro':
        return (
          <div className="space-y-6">
            {c.objective && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
                <p className="text-sm font-medium text-yellow-800 mb-1">Lesson Objective</p>
                <p className="text-gray-700">{c.objective as string}</p>
              </div>
            )}
            {c.warmUpActivity && (
              <div className="bg-white border rounded-lg p-5">
                <p className="text-sm font-medium text-gray-600 mb-2">Warm-up Activity</p>
                <p className="text-gray-800 text-lg">{c.warmUpActivity as string}</p>
              </div>
            )}
            {(c.discussionQuestions as string[])?.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-5">
                <p className="text-sm font-medium text-gray-600 mb-3">Discussion Questions</p>
                <ul className="space-y-3">
                  {(c.discussionQuestions as string[]).map((q, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      <span className="text-gray-700">{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )

      case 'vocabulary':
        return (
          <div className="space-y-6">
            {(c.words as Array<{ word: string; definition: string; example: string; partOfSpeech: string }>)?.map((w, i) => (
              <div key={i} className="bg-white border rounded-lg p-4 flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex-shrink-0">
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">{w.word}</span>
                  <span className="text-xs text-gray-400 ml-2">{w.partOfSpeech}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700">{w.definition}</p>
                  <p className="text-sm text-gray-500 italic mt-1">&ldquo;{w.example}&rdquo;</p>
                </div>
              </div>
            ))}
            {c.activity && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800 mb-1">Practice Activity</p>
                <p className="text-gray-700">{c.activity as string}</p>
              </div>
            )}
          </div>
        )

      case 'grammar':
        return (
          <div className="space-y-6">
            {c.grammarPoint && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                <p className="text-sm font-medium text-red-800 mb-1">Grammar Point</p>
                <p className="text-gray-800 text-lg font-medium">{c.grammarPoint as string}</p>
              </div>
            )}
            {c.explanation && (
              <div className="bg-white border rounded-lg p-5">
                <p className="text-gray-700 leading-relaxed">{c.explanation as string}</p>
              </div>
            )}
            {(c.examples as string[])?.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-5">
                <p className="text-sm font-medium text-gray-600 mb-3">Examples</p>
                <ul className="space-y-2">
                  {(c.examples as string[]).map((ex, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <span className="text-red-400 mt-0.5">&#10145;</span>
                      <span className="text-gray-700">{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {c.practiceActivity && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800 mb-1">Practice</p>
                <p className="text-gray-700">{c.practiceActivity as string}</p>
              </div>
            )}
          </div>
        )

      case 'communication':
        return (
          <div className="space-y-6">
            {c.activity && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                <p className="text-gray-800">{c.activity as string}</p>
              </div>
            )}
            {(c.instructions as string[])?.length > 0 && (
              <div className="bg-white border rounded-lg p-5">
                <p className="text-sm font-medium text-gray-600 mb-3">Instructions</p>
                <ol className="space-y-2">
                  {(c.instructions as string[]).map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {(c.discussionQuestions as string[])?.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-5">
                <p className="text-sm font-medium text-gray-600 mb-3">Discussion Questions</p>
                <ul className="space-y-3">
                  {(c.discussionQuestions as string[]).map((q, i) => (
                    <li key={i} className="text-gray-700">&#8226; {q}</li>
                  ))}
                </ul>
              </div>
            )}
            {(c.usefulLanguage as string[])?.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm font-medium text-green-700 mb-2">Useful Language</p>
                <div className="flex flex-wrap gap-2">
                  {(c.usefulLanguage as string[]).map((phrase, i) => (
                    <Badge key={i} variant="outline" className="bg-white text-green-800 border-green-300">
                      {phrase}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'review':
        return (
          <div className="space-y-6">
            {c.reviewActivity && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
                <p className="text-sm font-medium text-purple-800 mb-1">Review Activity</p>
                <p className="text-gray-700">{c.reviewActivity as string}</p>
              </div>
            )}
            {(c.keyTakeaways as string[])?.length > 0 && (
              <div className="bg-white border rounded-lg p-5">
                <p className="text-sm font-medium text-gray-600 mb-3">Key Takeaways</p>
                <ul className="space-y-2">
                  {(c.keyTakeaways as string[]).map((t, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {c.homeworkPreview && (
              <div className="bg-gray-50 border rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600 mb-1">Homework Preview</p>
                <p className="text-gray-700">{c.homeworkPreview as string}</p>
              </div>
            )}
          </div>
        )

      default:
        return <p className="text-gray-500">Slide content not available.</p>
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!session?.user || session.user.role !== 'STUDENT') return null

  // Topic picker view
  if (showTopicPicker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => router.push('/student')} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Class Slides</h1>
            <p className="text-gray-600">Select a topic to view its live class presentation</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topics.map((t) => (
                <Card
                  key={t.id}
                  className="cursor-pointer hover:shadow-md transition-shadow hover:border-blue-300"
                  onClick={() => router.push(`/student/content?topicId=${t.id}`)}
                >
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{t.name}</p>
                      <p className="text-sm text-gray-500">Topic {t.orderIndex}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Slide viewer
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push('/student/content')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Topics
          </Button>

          {topic && (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{topic.name}</h1>
                <p className="text-sm text-gray-500">
                  {topic.level} Level &middot; Live Class Slides
                </p>
              </div>
              <Badge variant="outline" className="text-sm">
                Slide {currentSlide + 1} of {slides.length}
              </Badge>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : slides.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">No slides available for this topic yet.</p>
              <Button onClick={() => router.push('/student/content')}>Choose Another Topic</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Slide progress dots */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {slides.map((s, i) => {
                const cfg = SLIDE_TYPES[s.type] || SLIDE_TYPES.intro
                return (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSlide(i)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      i === currentSlide
                        ? `${cfg.bg} border ${cfg.color}`
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    <span>{i + 1}</span>
                    <span className="hidden sm:inline">
                      {s.type === 'intro' ? 'Warm-up' :
                       s.type === 'vocabulary' ? 'Vocab' :
                       s.type === 'grammar' ? 'Grammar' :
                       s.type === 'communication' ? 'Discuss' :
                       'Review'}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Main slide card */}
            {slide && (
              <Card className="mb-6 shadow-lg">
                <CardHeader className={`border-b ${slideConfig.bg}`}>
                  <div className="flex items-center gap-3">
                    <SlideIcon className={`h-6 w-6 ${slideConfig.color}`} />
                    <div>
                      <CardTitle className="text-xl">{slide.title}</CardTitle>
                      <p className="text-xs text-gray-500 mt-1">
                        {(slide.content as Record<string, unknown>).timeMinutes
                          ? `${(slide.content as Record<string, unknown>).timeMinutes} minutes`
                          : ''}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">{renderSlideContent(slide)}</CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                disabled={currentSlide === 0}
                onClick={() => setCurrentSlide(currentSlide - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <p className="text-sm text-gray-500">
                {currentSlide + 1} / {slides.length}
              </p>

              <Button
                disabled={currentSlide === slides.length - 1}
                onClick={() => setCurrentSlide(currentSlide + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
