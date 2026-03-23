'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ArrowLeft, BookOpen, CheckCircle, Clock, Headphones, Loader2, MessageSquare,
  Mic, Pencil, RotateCcw, Send, XCircle, AlertCircle
} from 'lucide-react'

interface Exercise {
  id: string; topicId: string; phase: string; category: string; type: string
  title: string; instructions: string; content: Record<string, any>
  correctAnswer: Record<string, any> | null; points: number; orderIndex: number; completed: boolean
}
interface TopicOption { id: string; name: string; orderIndex: number; description?: string }
interface Submission { correct: boolean; score: number; needsReview: boolean }

const CATEGORIES = [
  { key: 'READING', label: 'Reading', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'WRITING', label: 'Writing', icon: Pencil, color: 'text-green-600', bg: 'bg-green-50' },
  { key: 'LISTENING', label: 'Listening', icon: Headphones, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { key: 'SPEAKING', label: 'Speaking', icon: Mic, color: 'text-red-600', bg: 'bg-red-50' },
  { key: 'GRAMMAR', label: 'Grammar', icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
]

export default function StudentExercisesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [topics, setTopics] = useState<TopicOption[]>([])
  const [selectedTopicId, setSelectedTopicId] = useState('')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [activeTab, setActiveTab] = useState('READING')
  const [activePhase, setActivePhase] = useState('PRE_CLASS')
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({})
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [loadingExercises, setLoadingExercises] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
    else if (status === 'authenticated' && session?.user?.role !== 'STUDENT') router.push('/dashboard')
  }, [status, session, router])

  const fetchTopics = useCallback(async () => {
    try {
      const level = session?.user?.level || 'STARTER'
      const res = await fetch(`/api/student/topics?level=${level}`)
      if (res.ok) { const data = await res.json(); setTopics(data); if (data.length > 0) setSelectedTopicId(data[0].id) }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [session?.user?.level])

  useEffect(() => { if (session?.user?.level) fetchTopics() }, [session?.user?.level, fetchTopics])

  const fetchExercises = useCallback(async (topicId: string) => {
    setLoadingExercises(true)
    try {
      const res = await fetch(`/api/student/exercises?topicId=${topicId}`)
      if (res.ok) {
        const data = await res.json(); setExercises(data)
        const subs: Record<string, Submission> = {}
        data.forEach((ex: Exercise) => { if (ex.completed) subs[ex.id] = { correct: true, score: ex.points, needsReview: false } })
        setSubmissions(subs)
      }
    } catch (e) { console.error(e) } finally { setLoadingExercises(false) }
  }, [])

  useEffect(() => { if (selectedTopicId) fetchExercises(selectedTopicId) }, [selectedTopicId, fetchExercises])

  const getExercisesForCategory = (category: string) => exercises.filter(e => e.category === category && e.phase === activePhase)
  const handleAnswerChange = (exerciseId: string, value: any) => setAnswers(prev => ({ ...prev, [exerciseId]: value }))

  const handleSubmit = async (exercise: Exercise) => {
    const answer = answers[exercise.id]
    if (answer === undefined || answer === null || answer === '') return
    setSubmitting(prev => ({ ...prev, [exercise.id]: true }))
    try {
      const res = await fetch('/api/student/exercises/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ exerciseId: exercise.id, answer }) })
      if (res.ok) { const result = await res.json(); setSubmissions(prev => ({ ...prev, [exercise.id]: result })) }
    } catch (e) { console.error(e) } finally { setSubmitting(prev => ({ ...prev, [exercise.id]: false })) }
  }

  const handleRetry = (exerciseId: string) => {
    setSubmissions(prev => { const n = { ...prev }; delete n[exerciseId]; return n })
    setAnswers(prev => { const n = { ...prev }; delete n[exerciseId]; return n })
  }

  const renderExercise = (exercise: Exercise) => {
    const content = exercise.content || {}
    const submission = submissions[exercise.id]
    const isSubmitted = !!submission

    if (exercise.type === 'MULTIPLE_CHOICE') {
      const options = content.options || []
      return (<div className="space-y-4">
        {content.passage && <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400"><p className="text-gray-700 whitespace-pre-line">{content.passage}</p></div>}
        <p className="font-medium text-gray-800">{content.question || exercise.instructions}</p>
        <div className="space-y-2">{(options as string[]).map((opt: string, i: number) => (
          <label key={i} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${answers[exercise.id] === opt ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'} ${isSubmitted ? 'pointer-events-none' : ''}`}>
            <input type="radio" name={`mc-${exercise.id}`} value={opt} checked={answers[exercise.id] === opt} onChange={() => handleAnswerChange(exercise.id, opt)} disabled={isSubmitted} className="w-4 h-4" />
            <span className="text-gray-700">{opt}</span>
          </label>
        ))}</div>
      </div>)
    }
    if (exercise.type === 'TRUE_FALSE') {
      return (<div className="space-y-4">
        {content.passage && <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400"><p className="text-gray-700 whitespace-pre-line">{content.passage}</p></div>}
        <p className="font-medium text-gray-800">{content.question || content.statement || exercise.instructions}</p>
        <div className="flex gap-4">{['True', 'False'].map(val => (
          <label key={val} className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border cursor-pointer ${answers[exercise.id] === val ? (val === 'True' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : 'border-gray-200 hover:bg-gray-50'} ${isSubmitted ? 'pointer-events-none' : ''}`}>
            <input type="radio" name={`tf-${exercise.id}`} value={val} checked={answers[exercise.id] === val} onChange={() => handleAnswerChange(exercise.id, val)} disabled={isSubmitted} className="w-4 h-4" />
            <span className="font-medium">{val}</span>
          </label>
        ))}</div>
      </div>)
    }
    if (exercise.type === 'GAP_FILL') {
      return (<div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400"><p className="text-gray-800">{content.sentence || content.text || exercise.instructions}</p>{content.hint && <p className="text-sm text-gray-500 mt-2 italic">Hint: {content.hint}</p>}</div>
        <Input placeholder="Type your answer..." value={answers[exercise.id] || ''} onChange={e => handleAnswerChange(exercise.id, e.target.value)} disabled={isSubmitted} className={isSubmitted ? (submission?.correct ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : ''} />
        {content.options && <div className="flex flex-wrap gap-2">{(content.options as string[]).map((opt: string, i: number) => (
          <button key={i} onClick={() => handleAnswerChange(exercise.id, opt)} disabled={isSubmitted} className="text-sm px-3 py-1.5 bg-white border rounded-full hover:bg-yellow-100 disabled:opacity-50">{opt}</button>
        ))}</div>}
      </div>)
    }
    if (exercise.type === 'ESSAY') {
      const wordCount = (answers[exercise.id] || '').split(/\s+/).filter((w: string) => w.length > 0).length
      return (<div className="space-y-4">
        {content.prompt && <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400"><p className="text-gray-700">{content.prompt}</p></div>}
        <Textarea placeholder="Write your response..." value={answers[exercise.id] || ''} onChange={e => handleAnswerChange(exercise.id, e.target.value)} disabled={isSubmitted} className="min-h-[180px]" />
        <div className="flex justify-between text-xs text-gray-500"><span>Words: {wordCount}</span>{isSubmitted && submission?.needsReview && <Badge variant="outline" className="bg-yellow-50 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Awaiting review</Badge>}</div>
      </div>)
    }
    if (exercise.type === 'AUDIO_RECORDING' || exercise.type === 'PRONUNCIATION') {
      return (<div className="space-y-4">
        {(content.prompt || content.question) && <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400"><p className="text-gray-700">{content.prompt || content.question}</p></div>}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"><Mic className="h-6 w-6 text-green-600" /><div><p className="font-medium text-green-800">Audio Recording</p><p className="text-sm text-green-600">{isSubmitted ? 'Submitted!' : 'Click to record.'}</p></div></div>
        {!isSubmitted && <Button className="bg-green-600 hover:bg-green-700" onClick={() => { handleAnswerChange(exercise.id, 'audio_placeholder') }}><Mic className="h-4 w-4 mr-2" />Start Recording</Button>}
      </div>)
    }
    return (<div className="space-y-4"><p className="text-gray-700">{exercise.instructions}</p>
      {content && Object.keys(content).length > 0 && <div className="bg-gray-50 border rounded-lg p-4"><pre className="text-sm text-gray-600 whitespace-pre-wrap">{JSON.stringify(content, null, 2)}</pre></div>}
    </div>)
  }

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
  if (!session?.user || session.user.role !== 'STUDENT') return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push('/student')} className="mb-4"><ArrowLeft className="h-4 w-4 mr-2" />Back to Dashboard</Button>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div><h1 className="text-3xl font-bold text-gray-900 mb-1">Exercises</h1><p className="text-gray-600">Practice and improve your English skills</p></div>
          <div className="w-full sm:w-80">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Topic</label>
            {loading ? <div className="flex items-center gap-2 h-10 text-sm text-gray-400"><Loader2 className="h-4 w-4 animate-spin" />Loading...</div> : (
              <Select value={selectedTopicId} onValueChange={setSelectedTopicId}><SelectTrigger className="bg-white"><SelectValue placeholder="Select a topic" /></SelectTrigger>
                <SelectContent>{topics.map(t => <SelectItem key={t.id} value={t.id}>{t.orderIndex}. {t.name}</SelectItem>)}</SelectContent></Select>)}
          </div>
        </div>

        {selectedTopicId && <div className="mb-4 flex items-center gap-3"><span className="text-sm font-medium text-gray-600">Phase:</span>
          <div className="inline-flex rounded-lg border bg-white p-0.5">{['PRE_CLASS', 'AFTER_CLASS'].map(phase => (
            <button key={phase} onClick={() => setActivePhase(phase)} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activePhase === phase ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>{phase === 'PRE_CLASS' ? 'Pre-Class' : 'After-Class'}</button>
          ))}</div></div>}

        {!selectedTopicId ? (
          <Card><CardContent className="flex flex-col items-center py-16"><AlertCircle className="h-12 w-12 text-gray-300 mb-4" /><p className="text-gray-500 text-lg">Select a topic to see exercises.</p></CardContent></Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-4 bg-white/70">{CATEGORIES.map(cat => {
              const catExercises = getExercisesForCategory(cat.key); const completedCount = catExercises.filter(e => e.completed || submissions[e.id]).length; const Icon = cat.icon
              return (<TabsTrigger key={cat.key} value={cat.key} className="flex items-center gap-1.5 text-xs sm:text-sm relative">
                <Icon className="h-4 w-4" /><span className="hidden sm:inline">{cat.label}</span>
                {catExercises.length > 0 && <span className="text-xs text-gray-400">({completedCount}/{catExercises.length})</span>}
                {completedCount > 0 && completedCount === catExercises.length && catExercises.length > 0 && <CheckCircle className="h-3 w-3 text-green-500 absolute -top-1 -right-1" />}
              </TabsTrigger>)
            })}</TabsList>

            {CATEGORIES.map(cat => {
              const catExercises = getExercisesForCategory(cat.key); const Icon = cat.icon
              return (<TabsContent key={cat.key} value={cat.key}>
                {loadingExercises ? <Card><CardContent className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></CardContent></Card>
                : catExercises.length === 0 ? <Card><CardContent className="text-center py-16"><Icon className={`h-12 w-12 mx-auto mb-3 ${cat.color} opacity-40`} /><p className="text-gray-500 text-lg">No {cat.label.toLowerCase()} exercises for this topic/phase.</p></CardContent></Card>
                : <div className="space-y-6">{catExercises.map((exercise, idx) => {
                  const isCompleted = exercise.completed || !!submissions[exercise.id]; const submission = submissions[exercise.id]; const hasAnswer = answers[exercise.id] !== undefined && answers[exercise.id] !== null && answers[exercise.id] !== ''
                  return (<Card key={exercise.id} className={isCompleted ? 'border-green-200' : ''}>
                    <CardHeader className="pb-3"><div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2"><span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-sm font-semibold text-gray-600">{idx + 1}</span><Icon className={`h-5 w-5 ${cat.color}`} />{exercise.title}</CardTitle>
                      <div className="flex items-center gap-2"><Badge variant="outline" className={`${cat.bg} border-0`}>{exercise.points} pts</Badge><Badge variant="outline" className="text-xs capitalize">{exercise.type.replace(/_/g, ' ').toLowerCase()}</Badge>{isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}</div>
                    </div>{exercise.instructions && <p className="text-sm text-gray-600 mt-1 ml-9">{exercise.instructions}</p>}</CardHeader>
                    <CardContent className="ml-9">
                      {renderExercise(exercise)}
                      {submission && (<div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${submission.needsReview ? 'bg-yellow-50 border border-yellow-200' : submission.correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        {submission.needsReview ? <Clock className="h-5 w-5 text-yellow-600 mt-0.5" /> : submission.correct ? <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" /> : <XCircle className="h-5 w-5 text-red-500 mt-0.5" />}
                        <div className="flex-1"><p className={`font-medium ${submission.needsReview ? 'text-yellow-800' : submission.correct ? 'text-green-800' : 'text-red-800'}`}>{submission.needsReview ? 'Submitted for Review' : submission.correct ? `Correct! +${submission.score} pts` : 'Not quite right'}</p></div>
                        {!submission.correct && !submission.needsReview && <Button size="sm" variant="outline" className="border-red-300 text-red-700" onClick={() => handleRetry(exercise.id)}><RotateCcw className="h-3 w-3 mr-1" />Retry</Button>}
                      </div>)}
                      {!submission && <div className="mt-4 flex justify-end"><Button onClick={() => handleSubmit(exercise)} disabled={!hasAnswer || submitting[exercise.id]} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                        {submitting[exercise.id] ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : <><Send className="h-4 w-4 mr-2" />Submit</>}
                      </Button></div>}
                    </CardContent>
                  </Card>)
                })}</div>}
              </TabsContent>)
            })}
          </Tabs>
        )}
      </div>
    </div>
  )
}
