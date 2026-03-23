'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Loader2, Presentation } from 'lucide-react'

interface Slide {
  id: string; slideNumber: number; title: string; type: string
  content: Record<string, any>; notes: string | null
}
interface TopicOption { id: string; name: string; orderIndex: number }

const SLIDE_TYPES: Record<string, { label: string; color: string; bg: string }> = {
  intro: { label: 'Introduction', color: 'text-blue-600', bg: 'bg-blue-50' },
  vocabulary: { label: 'Vocabulary', color: 'text-green-600', bg: 'bg-green-50' },
  grammar: { label: 'Grammar', color: 'text-red-600', bg: 'bg-red-50' },
  communication: { label: 'Communication', color: 'text-amber-600', bg: 'bg-amber-50' },
  review: { label: 'Review', color: 'text-purple-600', bg: 'bg-purple-50' },
}

function SlideViewerContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const topicIdParam = searchParams.get('topicId')

  const [slides, setSlides] = useState<Slide[]>([])
  const [topicName, setTopicName] = useState('')
  const [topicLevel, setTopicLevel] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)
  const [slidesLoading, setSlidesLoading] = useState(false)
  const [topics, setTopics] = useState<TopicOption[]>([])
  const [selectedTopicId, setSelectedTopicId] = useState(topicIdParam || '')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
    else if (status === 'authenticated' && session?.user?.role !== 'STUDENT') router.push('/dashboard')
  }, [status, session, router])

  const fetchTopics = useCallback(async () => {
    try {
      const level = session?.user?.level || 'STARTER'
      const res = await fetch(`/api/student/topics?level=${level}`)
      if (res.ok) { const data = await res.json(); setTopics(data) }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [session?.user?.level])

  useEffect(() => { if (session?.user?.level) fetchTopics() }, [session?.user?.level, fetchTopics])

  const fetchSlides = useCallback(async (id: string) => {
    setSlidesLoading(true)
    try {
      const res = await fetch(`/api/student/slides?topicId=${id}`)
      if (res.ok) {
        const data = await res.json()
        setSlides(data.slides || []); setTopicName(data.topic?.name || ''); setTopicLevel(data.topic?.level || ''); setCurrentSlide(0)
      }
    } catch (e) { console.error(e) } finally { setSlidesLoading(false) }
  }, [])

  useEffect(() => { if (selectedTopicId) fetchSlides(selectedTopicId) }, [selectedTopicId, fetchSlides])
  useEffect(() => { if (topicIdParam && topicIdParam !== selectedTopicId) setSelectedTopicId(topicIdParam) }, [topicIdParam])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (slides.length === 0) return
      if (e.key === 'ArrowRight' && currentSlide < slides.length - 1) setCurrentSlide(prev => prev + 1)
      else if (e.key === 'ArrowLeft' && currentSlide > 0) setCurrentSlide(prev => prev - 1)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [slides.length, currentSlide])

  const handleTopicChange = (value: string) => { setSelectedTopicId(value); router.push(`/student/content?topicId=${value}`, { scroll: false }) }

  const renderSlideContent = (slide: Slide) => {
    const c = slide.content || {}
    return (
      <div className="space-y-6">
        {c.title && c.title !== slide.title && <h3 className="text-lg font-semibold text-gray-900">{c.title}</h3>}
        {c.text && <div className="bg-gray-50 rounded-lg p-5"><p className="text-gray-700 leading-relaxed whitespace-pre-line">{typeof c.text === 'string' ? c.text : JSON.stringify(c.text)}</p></div>}
        {c.objective && <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5"><p className="text-sm font-medium text-yellow-800 mb-1">Lesson Objective</p><p className="text-gray-700">{c.objective}</p></div>}
        {c.warmUpActivity && <div className="bg-white border rounded-lg p-5"><p className="text-sm font-medium text-gray-600 mb-2">Warm-up Activity</p><p className="text-gray-800 text-lg">{c.warmUpActivity}</p></div>}
        {c.grammarPoint && <div className="bg-red-50 border border-red-200 rounded-lg p-5"><p className="text-sm font-medium text-red-800 mb-1">Grammar Point</p><p className="text-gray-800 text-lg font-medium">{c.grammarPoint}</p></div>}
        {c.explanation && <div className="bg-white border rounded-lg p-5"><p className="text-gray-700 leading-relaxed">{c.explanation}</p></div>}
        {c.words && Array.isArray(c.words) && <div className="space-y-3">{c.words.map((w: any, i: number) => (
          <div key={i} className="bg-white border rounded-lg p-4 flex flex-col sm:flex-row gap-3">
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">{w.word}</span>
            <div><p className="text-gray-700">{w.definition}</p>{w.example && <p className="text-sm text-gray-500 italic mt-1">&ldquo;{w.example}&rdquo;</p>}</div>
          </div>
        ))}</div>}
        {(c.vocabulary) && Array.isArray(c.vocabulary) && <div className="space-y-2"><p className="text-sm font-semibold text-blue-800 uppercase">Vocabulary</p><div className="flex flex-wrap gap-2">
          {c.vocabulary.map((v: any, i: number) => <Badge key={i} variant="outline" className="bg-blue-50 text-blue-800 px-3 py-1.5">{typeof v === 'string' ? v : v.word || v.term || ''}</Badge>)}
        </div></div>}
        {(c.grammar_points || c.grammarPoints) && Array.isArray(c.grammar_points || c.grammarPoints) && <div className="bg-red-50 rounded-lg p-4"><p className="text-sm font-semibold text-red-800 mb-2">Grammar Points</p><ul className="space-y-1">
          {(c.grammar_points || c.grammarPoints).map((p: any, i: number) => <li key={i} className="text-gray-700 flex gap-2"><span className="text-red-400">&#10145;</span>{typeof p === 'string' ? p : p.point || ''}</li>)}
        </ul></div>}
        {c.examples && Array.isArray(c.examples) && <div className="bg-gray-50 rounded-lg p-5"><p className="text-sm font-medium text-gray-600 mb-3">Examples</p><ul className="space-y-2">
          {c.examples.map((ex: string, i: number) => <li key={i} className="flex gap-2 text-gray-700"><span className="text-red-400">&#10145;</span>{ex}</li>)}
        </ul></div>}
        {(c.discussion_questions || c.discussionQuestions) && Array.isArray(c.discussion_questions || c.discussionQuestions) && <div className="bg-amber-50 border border-amber-200 rounded-lg p-5"><p className="text-sm font-semibold text-amber-800 mb-3">Discussion Questions</p><ul className="space-y-3">
          {(c.discussion_questions || c.discussionQuestions).map((q: any, i: number) => <li key={i} className="flex gap-3"><span className="flex-shrink-0 w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span><span className="text-gray-700">{typeof q === 'string' ? q : q.question || ''}</span></li>)}
        </ul></div>}
        {c.activities && Array.isArray(c.activities) && <div className="space-y-3"><p className="text-sm font-semibold text-green-800 uppercase">Activities</p>
          {c.activities.map((a: any, i: number) => <div key={i} className="bg-green-50 border border-green-200 rounded-lg p-4"><p className="text-gray-700">{typeof a === 'string' ? a : a.description || a.activity || ''}</p></div>)}
        </div>}
        {(c.key_phrases || c.keyPhrases) && Array.isArray(c.key_phrases || c.keyPhrases) && <div className="flex flex-wrap gap-2">
          {(c.key_phrases || c.keyPhrases).map((p: any, i: number) => <Badge key={i} variant="outline" className="bg-indigo-50 text-indigo-800 px-3 py-1.5">{typeof p === 'string' ? p : p.phrase || ''}</Badge>)}
        </div>}
        {c.activity && typeof c.activity === 'string' && <div className="bg-green-50 border border-green-200 rounded-lg p-5"><p className="text-gray-800">{c.activity}</p></div>}
        {c.reviewActivity && <div className="bg-purple-50 border border-purple-200 rounded-lg p-5"><p className="text-sm font-medium text-purple-800 mb-1">Review Activity</p><p className="text-gray-700">{c.reviewActivity}</p></div>}
        {c.keyTakeaways && Array.isArray(c.keyTakeaways) && <div className="space-y-2">{c.keyTakeaways.map((t: string, i: number) => <div key={i} className="flex gap-2 items-start"><span className="text-purple-500">&#10003;</span><span className="text-gray-700">{t}</span></div>)}</div>}
        {c.practiceActivity && <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-sm font-medium text-red-800 mb-1">Practice</p><p className="text-gray-700">{c.practiceActivity}</p></div>}
      </div>
    )
  }

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
  if (!session?.user || session.user.role !== 'STUDENT') return null

  if (!selectedTopicId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => router.push('/student')} className="mb-4"><ArrowLeft className="h-4 w-4 mr-2" />Back to Dashboard</Button>
          <div className="flex items-center gap-3 mb-2"><Presentation className="h-8 w-8 text-blue-600" /><h1 className="text-3xl font-bold text-gray-900">Live Class Slides</h1></div>
          <p className="text-gray-600 mb-8">Select a topic to view its live class presentation slides</p>
          {loading ? <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div> : topics.length === 0 ? (
            <Card><CardContent className="text-center py-12"><Presentation className="h-12 w-12 mx-auto mb-3 text-gray-300" /><p className="text-gray-500">No topics available for your level yet.</p></CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{topics.map(t => (
              <Card key={t.id} className="cursor-pointer hover:shadow-md transition-all hover:border-blue-300 group" onClick={() => handleTopicChange(t.id)}>
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold text-sm group-hover:bg-blue-200">{t.orderIndex}</div>
                    <div><p className="font-medium text-gray-900">{t.name}</p><p className="text-sm text-gray-500">Topic {t.orderIndex}</p></div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                </CardContent>
              </Card>
            ))}</div>
          )}
        </div>
      </div>
    )
  }

  const slide = slides[currentSlide]
  const slideConfig = slide ? (SLIDE_TYPES[slide.type] || SLIDE_TYPES.intro) : SLIDE_TYPES.intro

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => { setSelectedTopicId(''); setSlides([]); router.push('/student/content') }} className="mb-4"><ArrowLeft className="h-4 w-4 mr-2" />Back to Topics</Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3"><Presentation className="h-6 w-6 text-blue-600" /><div><h1 className="text-2xl font-bold text-gray-900">{topicName}</h1><p className="text-sm text-gray-500">{topicLevel} Level &middot; Live Class Slides</p></div></div>
          <div className="w-full sm:w-72">
            <Select value={selectedTopicId} onValueChange={handleTopicChange}><SelectTrigger className="bg-white"><SelectValue placeholder="Switch topic..." /></SelectTrigger>
              <SelectContent>{topics.map(t => <SelectItem key={t.id} value={t.id}>{t.orderIndex}. {t.name}</SelectItem>)}</SelectContent></Select>
          </div>
        </div>

        {slidesLoading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div> : slides.length === 0 ? (
          <Card><CardContent className="text-center py-12"><Presentation className="h-12 w-12 mx-auto mb-3 text-gray-300" /><p className="text-gray-500 mb-4">No slides available for this topic yet.</p><Button onClick={() => { setSelectedTopicId(''); router.push('/student/content') }}>Choose Another Topic</Button></CardContent></Card>
        ) : (<>
          <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">{slides.map((s, i) => {
            const cfg = SLIDE_TYPES[s.type] || SLIDE_TYPES.intro
            return (<button key={s.id} onClick={() => setCurrentSlide(i)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${i === currentSlide ? `${cfg.bg} border ${cfg.color} shadow-sm` : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              <span>{i + 1}</span><span className="hidden sm:inline">{cfg.label}</span></button>)
          })}</div>

          {slide && <Card className="mb-6 shadow-lg">
            <CardHeader className={`border-b ${slideConfig.bg}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3"><BookOpen className={`h-6 w-6 ${slideConfig.color}`} /><div><CardTitle className="text-xl">{slide.title}</CardTitle><Badge variant="outline" className={`text-xs ${slideConfig.color} ${slideConfig.bg} mt-1`}>{slide.type.charAt(0).toUpperCase() + slide.type.slice(1)}</Badge></div></div>
                <Badge variant="outline" className="text-sm hidden sm:flex">{currentSlide + 1} / {slides.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {renderSlideContent(slide)}
              {slide.notes && <div className="mt-6 pt-4 border-t border-dashed"><p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Notes</p><p className="text-sm text-gray-500 italic">{slide.notes}</p></div>}
            </CardContent>
          </Card>}

          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" disabled={currentSlide === 0} onClick={() => setCurrentSlide(currentSlide - 1)} className="gap-2"><ChevronLeft className="h-4 w-4" />Previous</Button>
            <p className="text-sm text-gray-500 font-medium">{currentSlide + 1} / {slides.length}</p>
            <Button disabled={currentSlide === slides.length - 1} onClick={() => setCurrentSlide(currentSlide + 1)} className="gap-2">Next<ChevronRight className="h-4 w-4" /></Button>
          </div>

          <div className="flex items-center justify-center gap-2">{slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className={`rounded-full transition-all duration-200 ${i === currentSlide ? 'w-8 h-3 bg-blue-600' : i < currentSlide ? 'w-3 h-3 bg-blue-300 hover:bg-blue-400' : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'}`} />
          ))}</div>
        </>)}
      </div>
    </div>
  )
}

export default function SlideViewerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}>
      <SlideViewerContent />
    </Suspense>
  )
}
