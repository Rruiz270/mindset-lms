'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  BookOpen,
  PenLine,
  Headphones,
  Mic,
  Languages,
  CheckCircle,
  ChevronRight,
  Loader2,
} from 'lucide-react'

interface Topic {
  id: string
  name: string
  level: string
  orderIndex: number
  description: string
}

interface Exercise {
  id: string
  title: string
  instructions: string
  content: Record<string, unknown>
  correctAnswer: Record<string, unknown> | null
  category: string
  type: string
  phase: string
  points: number
  orderIndex: number
  completed?: boolean
}

const CATEGORIES = [
  { key: 'READING', label: 'Reading', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'WRITING', label: 'Writing', icon: PenLine, color: 'text-purple-600', bg: 'bg-purple-50' },
  { key: 'LISTENING', label: 'Listening', icon: Headphones, color: 'text-orange-600', bg: 'bg-orange-50' },
  { key: 'SPEAKING', label: 'Speaking', icon: Mic, color: 'text-green-600', bg: 'bg-green-50' },
  { key: 'GRAMMAR', label: 'Grammar', icon: Languages, color: 'text-red-600', bg: 'bg-red-50' },
]

export default function StudentExercises() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loadingTopics, setLoadingTopics] = useState(true)
  const [loadingExercises, setLoadingExercises] = useState(false)
  const [activeTab, setActiveTab] = useState('READING')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (session?.user?.role !== 'STUDENT') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.level) {
      fetchTopics()
    }
  }, [session?.user?.level])

  useEffect(() => {
    if (selectedTopic) {
      fetchExercises(selectedTopic.id)
    }
  }, [selectedTopic])

  const fetchTopics = async () => {
    try {
      const level = session?.user?.level || 'STARTER'
      const res = await fetch(`/api/student/topics?level=${level}`)
      if (res.ok) {
        const data = await res.json()
        setTopics(data)
        if (data.length > 0) {
          setSelectedTopic(data[0])
        }
      }
    } catch (error) {
      console.error('Error fetching topics:', error)
    } finally {
      setLoadingTopics(false)
    }
  }

  const fetchExercises = async (topicId: string) => {
    setLoadingExercises(true)
    try {
      const res = await fetch(`/api/student/exercises?topicId=${topicId}`)
      if (res.ok) {
        const data = await res.json()
        setExercises(data)
      }
    } catch (error) {
      console.error('Error fetching exercises:', error)
    } finally {
      setLoadingExercises(false)
    }
  }

  const getExercisesForCategory = (category: string) => {
    return exercises.filter(
      (ex) => ex.category === category && ex.phase === 'PRE_CLASS'
    )
  }

  const renderExerciseContent = (exercise: Exercise) => {
    const content = exercise.content as Record<string, unknown>

    switch (exercise.category) {
      case 'READING':
        return (
          <div className="space-y-4">
            {!!content.passage && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <p className="text-sm font-medium text-blue-800 mb-2">Reading Passage</p>
                <p className="text-gray-700 leading-relaxed">{content.passage as string}</p>
              </div>
            )}
            {(content.questions as Array<{ question: string; options: string[] }>)?.map(
              (q, i) => (
                <div key={i} className="bg-white border rounded-lg p-4">
                  <p className="font-medium mb-3">
                    {i + 1}. {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options?.map((opt: string, j: number) => (
                      <label
                        key={j}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={`q-${exercise.id}-${i}`}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-gray-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )

      case 'WRITING':
        return (
          <div className="space-y-4">
            {!!content.prompt && (
              <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                <p className="text-gray-700">{content.prompt as string}</p>
              </div>
            )}
            {(content.guideQuestions as string[])?.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Guide questions:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {(content.guideQuestions as string[]).map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
            <textarea
              className="w-full min-h-[150px] border rounded-lg p-4 text-gray-700 focus:ring-2 focus:ring-purple-300 focus:border-purple-400 outline-none resize-y"
              placeholder="Write your response here..."
            />
            <p className="text-xs text-gray-500">
              Minimum {(content.minWords as number) || 50} words
            </p>
          </div>
        )

      case 'LISTENING':
        return (
          <div className="space-y-4">
            {!!content.dialogue && (
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                <p className="text-sm font-medium text-orange-800 mb-2">
                  Dialogue
                </p>
                <p className="text-gray-700 whitespace-pre-line">
                  {content.dialogue as string}
                </p>
              </div>
            )}
            {(content.statements as Array<{ statement: string; isTrue: boolean }>)?.map(
              (s, i) => (
                <div
                  key={i}
                  className="bg-white border rounded-lg p-4 flex items-center justify-between"
                >
                  <p className="text-gray-700 flex-1">
                    {i + 1}. {s.statement}
                  </p>
                  <div className="flex gap-3 ml-4">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name={`tf-${exercise.id}-${i}`}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="text-sm font-medium text-green-700">
                        True
                      </span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name={`tf-${exercise.id}-${i}`}
                        className="w-4 h-4 text-red-600"
                      />
                      <span className="text-sm font-medium text-red-700">
                        False
                      </span>
                    </label>
                  </div>
                </div>
              )
            )}
          </div>
        )

      case 'SPEAKING':
        return (
          <div className="space-y-4">
            {!!content.prompt && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                <p className="text-gray-700">{content.prompt as string}</p>
              </div>
            )}
            {(content.talkingPoints as string[])?.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Talking points:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {(content.talkingPoints as string[]).map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
            {(content.usefulPhrases as string[])?.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-700 mb-2">
                  Useful phrases:
                </p>
                <div className="flex flex-wrap gap-2">
                  {(content.usefulPhrases as string[]).map((p, i) => (
                    <Badge key={i} variant="outline" className="bg-white">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <Button className="bg-green-600 hover:bg-green-700">
              <Mic className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          </div>
        )

      case 'GRAMMAR':
        return (
          <div className="space-y-4">
            {!!content.grammarFocus && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <p className="text-sm font-medium text-red-800 mb-1">
                  Grammar Focus
                </p>
                <p className="text-gray-700">{content.grammarFocus as string}</p>
              </div>
            )}
            {(
              content.sentences as Array<{
                text: string
                gap: string
                hint: string
              }>
            )?.map((s, i) => (
              <div key={i} className="bg-white border rounded-lg p-4">
                <p className="text-gray-700 mb-2">
                  {i + 1}. {s.text}
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Your answer..."
                    className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none flex-1 max-w-xs"
                  />
                  {s.hint && (
                    <span className="text-xs text-gray-400">{s.hint}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )

      default:
        return (
          <p className="text-gray-500">
            Exercise content not available.
          </p>
        )
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/student')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pre-Class Exercises
          </h1>
          <p className="text-gray-600">
            Complete all 5 exercise types before your live class
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Topic sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500 uppercase">
                  {session.user.level || 'STARTER'} Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loadingTopics ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="max-h-[500px] overflow-y-auto">
                    {topics.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => setSelectedTopic(topic)}
                        className={`w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-blue-50 transition-colors ${
                          selectedTopic?.id === topic.id
                            ? 'bg-blue-50 border-l-4 border-l-blue-600'
                            : ''
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {topic.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Topic {topic.orderIndex}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Exercise content */}
          <div className="lg:col-span-3">
            {selectedTopic && (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedTopic.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedTopic.description}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(
                        `/student/exercises/${selectedTopic.id}?category=${activeTab}`
                      )
                    }
                  >
                    Open Full Player
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-5 mb-4">
                    {CATEGORIES.map((cat) => {
                      const catExercises = getExercisesForCategory(cat.key)
                      const Icon = cat.icon
                      return (
                        <TabsTrigger
                          key={cat.key}
                          value={cat.key}
                          className="flex items-center gap-1.5 text-xs sm:text-sm"
                        >
                          <Icon className="h-4 w-4" />
                          <span className="hidden sm:inline">
                            {cat.label}
                          </span>
                          {catExercises.length > 0 && (
                            <span className="text-xs text-gray-400">
                              ({catExercises.length})
                            </span>
                          )}
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>

                  {CATEGORIES.map((cat) => {
                    const catExercises = getExercisesForCategory(cat.key)
                    const Icon = cat.icon

                    return (
                      <TabsContent key={cat.key} value={cat.key}>
                        {loadingExercises ? (
                          <Card>
                            <CardContent className="flex justify-center py-12">
                              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            </CardContent>
                          </Card>
                        ) : catExercises.length === 0 ? (
                          <Card>
                            <CardContent className="text-center py-12">
                              <Icon
                                className={`h-12 w-12 mx-auto mb-3 ${cat.color} opacity-40`}
                              />
                              <p className="text-gray-500">
                                No {cat.label.toLowerCase()} exercises yet for
                                this topic.
                              </p>
                            </CardContent>
                          </Card>
                        ) : (
                          <div className="space-y-4">
                            {catExercises.map((exercise) => (
                              <Card key={exercise.id}>
                                <CardHeader className="pb-3">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <Icon
                                        className={`h-5 w-5 ${cat.color}`}
                                      />
                                      {exercise.title}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant="outline"
                                        className={cat.bg}
                                      >
                                        {exercise.points} pts
                                      </Badge>
                                      {exercise.completed && (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {exercise.instructions}
                                  </p>
                                </CardHeader>
                                <CardContent>
                                  {renderExerciseContent(exercise)}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                    )
                  })}
                </Tabs>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
