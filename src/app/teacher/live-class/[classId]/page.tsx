'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Monitor,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  Play,
  CheckCircle,
  MessageSquare,
  Target,
  Lightbulb,
  Timer,
  Maximize,
  Volume2,
  BookOpen
} from 'lucide-react'
import axios from 'axios'
import { format } from 'date-fns'

interface Activity {
  id: string
  title: string
  description: string
  type: string
  duration: number
  order: number
  resourceUrl?: string
}

interface ClassInfo {
  id: string
  date: string
  time: string
  studentName: string
  topicName: string
  topicOrderIndex: number
  activities: Activity[]
}

export default function LiveClassPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'TEACHER') {
      router.push('/auth/login')
      return
    }
    fetchClassInfo()
  }, [status, session, params.classId])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  const fetchClassInfo = async () => {
    try {
      const response = await axios.get(`/api/teacher/live-class/${params.classId}`)
      setClassInfo(response.data)
    } catch (error) {
      console.error('Error fetching class info:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentActivity = classInfo?.activities[currentActivityIndex]
  const totalDuration = classInfo?.activities.reduce((sum, act) => sum + act.duration, 0) || 60

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getActivityContent = (activity: Activity) => {
    // For "Getting a Job" topic activities
    const activityContents: Record<string, any> = {
      'Warm-up Discussion': {
        questions: [
          "What's your current job or what job would you like to have?",
          "What was your first job interview like?",
          "What skills do you think are most important for getting a job?"
        ],
        tips: "Encourage all students to share. Use follow-up questions to extend answers."
      },
      'Grammar Focus': {
        structures: [
          { 
            name: "Present Perfect for Experience",
            example: "I have worked in sales for 5 years.",
            practice: "How long have you...?"
          },
          {
            name: "Modal Verbs for Ability",
            example: "I can speak three languages.",
            practice: "What can you do well?"
          }
        ],
        exercises: [
          "Transform: I worked here since 2020 → I ___ here since 2020.",
          "Complete: I ___ use Excel and PowerPoint. (ability)"
        ]
      },
      'Vocabulary Building': {
        words: [
          { term: "Resume/CV", definition: "Document with your work history", example: "I updated my resume yesterday." },
          { term: "Interview", definition: "Meeting to discuss a job", example: "I have an interview tomorrow." },
          { term: "Qualifications", definition: "Skills and education needed", example: "What qualifications do you need?" },
          { term: "Experience", definition: "Previous work history", example: "I have 5 years of experience." },
          { term: "Skills", definition: "Things you can do well", example: "Computer skills are important." }
        ],
        activities: "Use each word in a sentence about your experience."
      },
      'Role-Play': {
        scenarios: [
          {
            title: "Job Interview",
            roleA: "Interviewer",
            roleB: "Job Applicant",
            prompts: [
              "Tell me about yourself",
              "Why do you want this job?",
              "What are your strengths?",
              "Where do you see yourself in 5 years?"
            ]
          }
        ],
        tips: "Switch roles halfway through. Focus on clear pronunciation and professional language."
      },
      'Wrap-up Quiz': {
        questions: [
          {
            q: "Which is correct?",
            options: ["I work here since 2020", "I have worked here since 2020"],
            answer: 1
          },
          {
            q: "What do you bring to an interview?",
            options: ["Your pet", "Your resume", "Your lunch", "Your friend"],
            answer: 1
          }
        ]
      }
    }

    const defaultKey = activity.title.includes('Discussion') ? 'Warm-up Discussion' :
                      activity.title.includes('Grammar') ? 'Grammar Focus' :
                      activity.title.includes('Vocabulary') ? 'Vocabulary Building' :
                      activity.title.includes('Role-Play') ? 'Role-Play' :
                      activity.title.includes('Quiz') ? 'Wrap-up Quiz' : null

    return activityContents[defaultKey || ''] || null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading class materials...</p>
        </div>
      </div>
    )
  }

  if (!classInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Class not found</p>
          <Button onClick={() => router.push('/teacher/classes')} className="mt-4">
            Back to Classes
          </Button>
        </div>
      </div>
    )
  }

  const activityContent = currentActivity ? getActivityContent(currentActivity) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/teacher/classes')}
              >
                <ChevronLeft className="h-4 w-4" />
                Exit Class
              </Button>
              <div className="border-l pl-4">
                <h1 className="text-xl font-bold">{classInfo.topicName}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {classInfo.studentName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatTime(elapsedTime)} / {totalDuration}:00
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={isTimerRunning ? "destructive" : "default"}
                onClick={() => setIsTimerRunning(!isTimerRunning)}
              >
                {isTimerRunning ? 'Pause Timer' : 'Start Timer'}
              </Button>
              <Button variant="outline">
                <Maximize className="h-4 w-4 mr-2" />
                Present Mode
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Activity Timeline */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Class Timeline</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {classInfo.activities.map((activity, index) => {
                    const isActive = index === currentActivityIndex
                    const isCompleted = index < currentActivityIndex
                    
                    return (
                      <button
                        key={activity.id}
                        onClick={() => setCurrentActivityIndex(index)}
                        className={`w-full p-3 text-left transition-colors ${
                          isActive ? 'bg-blue-50 border-l-4 border-blue-600' :
                          isCompleted ? 'bg-gray-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                              <span className={`font-medium text-sm ${isActive ? 'text-blue-700' : ''}`}>
                                {index + 1}. {activity.title}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {activity.duration} minutes
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {currentActivity && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-3">
                        {currentActivity.type === 'discussion' && <MessageSquare className="h-6 w-6 text-blue-600" />}
                        {currentActivity.type === 'exercise' && <Target className="h-6 w-6 text-green-600" />}
                        {currentActivity.type === 'quiz' && <CheckCircle className="h-6 w-6 text-purple-600" />}
                        {currentActivity.title}
                      </CardTitle>
                      <p className="text-gray-600 mt-2">{currentActivity.description}</p>
                    </div>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {currentActivity.duration} min
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Activity-specific content */}
                  {activityContent && (
                    <div className="space-y-6">
                      {/* Discussion Questions */}
                      {activityContent.questions && (
                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Discussion Questions
                          </h3>
                          <div className="space-y-3">
                            {activityContent.questions.map((question: string, index: number) => (
                              <div key={index} className="bg-blue-50 p-4 rounded-lg">
                                <p className="font-medium">{index + 1}. {question}</p>
                              </div>
                            ))}
                          </div>
                          {activityContent.tips && (
                            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                              <p className="text-sm">
                                <Lightbulb className="h-4 w-4 inline mr-1" />
                                <strong>Tip:</strong> {activityContent.tips}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Grammar Structures */}
                      {activityContent.structures && (
                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Grammar Structures
                          </h3>
                          {activityContent.structures.map((structure: any, index: number) => (
                            <div key={index} className="mb-4 p-4 border rounded-lg">
                              <h4 className="font-semibold text-blue-700">{structure.name}</h4>
                              <p className="text-gray-600 mt-1">Example: "{structure.example}"</p>
                              <p className="text-sm mt-2">Practice: {structure.practice}</p>
                            </div>
                          ))}
                          {activityContent.exercises && (
                            <div className="mt-4">
                              <h4 className="font-medium mb-2">Practice Exercises:</h4>
                              {activityContent.exercises.map((exercise: string, index: number) => (
                                <p key={index} className="mb-2 p-3 bg-gray-50 rounded">
                                  {index + 1}. {exercise}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Vocabulary */}
                      {activityContent.words && (
                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Key Vocabulary
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {activityContent.words.map((word: any, index: number) => (
                              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                <p className="font-semibold">{word.term}</p>
                                <p className="text-sm text-gray-600">{word.definition}</p>
                                <p className="text-sm text-blue-600 mt-1">"{word.example}"</p>
                              </div>
                            ))}
                          </div>
                          {activityContent.activities && (
                            <p className="mt-3 text-sm text-gray-600">
                              <strong>Activity:</strong> {activityContent.activities}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Role Play Scenarios */}
                      {activityContent.scenarios && (
                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Role-Play Scenario
                          </h3>
                          {activityContent.scenarios.map((scenario: any, index: number) => (
                            <div key={index} className="p-4 bg-purple-50 rounded-lg">
                              <h4 className="font-semibold mb-2">{scenario.title}</h4>
                              <div className="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                  <Badge className="mb-2">Role A: {scenario.roleA}</Badge>
                                </div>
                                <div>
                                  <Badge className="mb-2">Role B: {scenario.roleB}</Badge>
                                </div>
                              </div>
                              <div>
                                <p className="font-medium mb-2">Sample Questions/Prompts:</p>
                                {scenario.prompts.map((prompt: string, i: number) => (
                                  <p key={i} className="mb-1">• {prompt}</p>
                                ))}
                              </div>
                            </div>
                          ))}
                          {activityContent.tips && (
                            <p className="mt-3 text-sm text-gray-600">
                              <Lightbulb className="h-4 w-4 inline mr-1" />
                              {activityContent.tips}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Quiz Questions */}
                      {activityContent.questions && currentActivity.type === 'quiz' && (
                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            Quick Quiz
                          </h3>
                          {activityContent.questions.map((q: any, index: number) => (
                            <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                              <p className="font-medium mb-2">{index + 1}. {q.q}</p>
                              <div className="space-y-2">
                                {q.options.map((option: string, i: number) => (
                                  <p key={i} className={`p-2 rounded ${i === q.answer ? 'bg-green-100 font-medium' : ''}`}>
                                    {String.fromCharCode(65 + i)}. {option}
                                  </p>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between mt-8 pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentActivityIndex(currentActivityIndex - 1)}
                      disabled={currentActivityIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous Activity
                    </Button>
                    
                    {currentActivityIndex === classInfo.activities.length - 1 ? (
                      <Button
                        onClick={() => router.push('/teacher/classes')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        End Class
                        <CheckCircle className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setCurrentActivityIndex(currentActivityIndex + 1)}
                      >
                        Next Activity
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}