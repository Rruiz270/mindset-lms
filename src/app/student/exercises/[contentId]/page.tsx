'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  FileText,
  Mic,
  StopCircle,
  Volume2,
  Award,
  Send
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
  completed?: boolean
}

interface Content {
  id: string
  title: string
  topicName?: string
  exercises: Exercise[]
}

export default function StudentExercisesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [content, setContent] = useState<Content | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [recording, setRecording] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'STUDENT') {
      router.push('/auth/login')
      return
    }
    fetchExercises()
  }, [status, session, params.contentId])

  const fetchExercises = async () => {
    try {
      // Get content and exercises
      const response = await axios.get(`/api/student/exercises/content/${params.contentId}`)
      setContent(response.data.content)
      setExercises(response.data.exercises)
      
      // Initialize answers
      const initialAnswers: Record<string, any> = {}
      response.data.exercises.forEach((ex: Exercise) => {
        if (ex.type === 'MULTIPLE_CHOICE' || ex.type === 'TRUE_FALSE') {
          initialAnswers[ex.id] = ''
        } else if (ex.type === 'GAP_FILL') {
          initialAnswers[ex.id] = ex.content.gaps ? new Array(ex.content.gaps.length).fill('') : []
        } else {
          initialAnswers[ex.id] = ''
        }
      })
      setAnswers(initialAnswers)
    } catch (error) {
      console.error('Error fetching exercises:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitExercise = async (exerciseId: string) => {
    try {
      const exercise = exercises.find(e => e.id === exerciseId)
      if (!exercise) return

      const response = await axios.post('/api/student/exercises/submit', {
        exerciseId,
        answer: answers[exerciseId],
        contentId: params.contentId
      })

      setSubmitted({ ...submitted, [exerciseId]: true })
      
      // Auto advance after 2 seconds for correct answers
      if (response.data.correct && currentIndex < exercises.length - 1) {
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1)
        }, 2000)
      }
    } catch (error) {
      console.error('Error submitting exercise:', error)
    }
  }

  const renderExercise = (exercise: Exercise) => {
    const isSubmitted = submitted[exercise.id]
    const userAnswer = answers[exercise.id]

    switch (exercise.type) {
      case 'MULTIPLE_CHOICE':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-medium text-lg">{exercise.content.question}</p>
            </div>
            
            <RadioGroup
              value={userAnswer}
              onValueChange={(value) => setAnswers({ ...answers, [exercise.id]: value })}
              disabled={isSubmitted}
            >
              {exercise.content.options?.map((option: string, index: number) => {
                const optionLetter = String.fromCharCode(65 + index)
                const isCorrect = isSubmitted && exercise.correctAnswer?.answer === optionLetter
                const isWrong = isSubmitted && userAnswer === optionLetter && !isCorrect
                
                return (
                  <div
                    key={index}
                    className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                      isCorrect ? 'bg-green-100 border-green-500 border' :
                      isWrong ? 'bg-red-100 border-red-500 border' :
                      'hover:bg-gray-50'
                    }`}
                  >
                    <RadioGroupItem value={optionLetter} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      <span className="font-medium mr-2">{optionLetter}.</span>
                      {option}
                    </Label>
                    {isCorrect && <CheckCircle className="h-5 w-5 text-green-600" />}
                  </div>
                )
              })}
            </RadioGroup>
          </div>
        )

      case 'TRUE_FALSE':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-medium text-lg">{exercise.content.statement}</p>
            </div>
            
            <RadioGroup
              value={userAnswer}
              onValueChange={(value) => setAnswers({ ...answers, [exercise.id]: value })}
              disabled={isSubmitted}
            >
              {['true', 'false'].map((value) => {
                const isCorrect = isSubmitted && String(exercise.correctAnswer?.answer) === value
                const isWrong = isSubmitted && userAnswer === value && !isCorrect
                
                return (
                  <div
                    key={value}
                    className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                      isCorrect ? 'bg-green-100 border-green-500 border' :
                      isWrong ? 'bg-red-100 border-red-500 border' :
                      'hover:bg-gray-50'
                    }`}
                  >
                    <RadioGroupItem value={value} id={value} />
                    <Label htmlFor={value} className="flex-1 cursor-pointer capitalize">
                      {value}
                    </Label>
                    {isCorrect && <CheckCircle className="h-5 w-5 text-green-600" />}
                  </div>
                )
              })}
            </RadioGroup>
          </div>
        )

      case 'GAP_FILL':
        const gaps = exercise.content.gaps || []
        const textParts = exercise.content.text?.split('___') || []
        
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-medium">Fill in the blanks:</p>
            </div>
            
            <div className="text-lg leading-relaxed">
              {textParts.map((part: string, index: number) => (
                <span key={index}>
                  {part}
                  {index < textParts.length - 1 && (
                    <Input
                      type="text"
                      value={userAnswer[index] || ''}
                      onChange={(e) => {
                        const newAnswers = [...userAnswer]
                        newAnswers[index] = e.target.value
                        setAnswers({ ...answers, [exercise.id]: newAnswers })
                      }}
                      disabled={isSubmitted}
                      className={`inline-block w-32 mx-1 ${
                        isSubmitted && exercise.correctAnswer?.answers?.[index] === userAnswer[index]
                          ? 'border-green-500 bg-green-50'
                          : isSubmitted
                          ? 'border-red-500 bg-red-50'
                          : ''
                      }`}
                    />
                  )}
                </span>
              ))}
            </div>
            
            {isSubmitted && exercise.correctAnswer?.answers && (
              <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm font-medium">Correct answers:</p>
                <p className="text-sm">{exercise.correctAnswer.answers.join(', ')}</p>
              </div>
            )}
          </div>
        )

      case 'ESSAY':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-medium text-lg">{exercise.content.prompt}</p>
              {exercise.content.minWords && (
                <p className="text-sm text-gray-600 mt-2">
                  Minimum words: {exercise.content.minWords}
                </p>
              )}
            </div>
            
            <Textarea
              value={userAnswer}
              onChange={(e) => setAnswers({ ...answers, [exercise.id]: e.target.value })}
              disabled={isSubmitted}
              rows={8}
              placeholder="Write your answer here..."
              className="w-full"
            />
            
            <div className="flex justify-between text-sm text-gray-600">
              <span>Words: {userAnswer.split(/\s+/).filter((word: string) => word.length > 0).length}</span>
              {exercise.content.minWords && (
                <span>
                  {userAnswer.split(/\s+/).filter((word: string) => word.length > 0).length >= exercise.content.minWords
                    ? '✓ Minimum words reached'
                    : `${exercise.content.minWords - userAnswer.split(/\s+/).filter((word: string) => word.length > 0).length} more words needed`
                  }
                </span>
              )}
            </div>
          </div>
        )

      case 'AUDIO_RECORDING':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-medium text-lg">{exercise.content.prompt}</p>
              {exercise.content.minDuration && (
                <p className="text-sm text-gray-600 mt-2">
                  Minimum duration: {exercise.content.minDuration} seconds
                </p>
              )}
            </div>
            
            <div className="flex justify-center">
              <Button
                size="lg"
                variant={recording ? "destructive" : "default"}
                onClick={() => setRecording(!recording)}
                disabled={isSubmitted}
              >
                {recording ? (
                  <>
                    <StopCircle className="h-5 w-5 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
            </div>
            
            {isSubmitted && (
              <div className="text-center text-green-600">
                <CheckCircle className="h-6 w-6 mx-auto mb-2" />
                Recording submitted successfully!
              </div>
            )}
          </div>
        )

      case 'MATCHING':
        // For now, simplified matching display
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-medium">Match the terms with their definitions</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Terms</h4>
                {exercise.content.pairs?.map((pair: any, index: number) => (
                  <div key={index} className="p-2 bg-gray-100 rounded mb-2">
                    {pair.term}
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-medium mb-2">Definitions</h4>
                {exercise.content.pairs?.map((pair: any, index: number) => (
                  <div key={index} className="p-2 bg-gray-100 rounded mb-2">
                    {pair.definition}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return <div>Exercise type not supported: {exercise.type}</div>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exercises...</p>
        </div>
      </div>
    )
  }

  const currentExercise = exercises[currentIndex]
  const progress = ((currentIndex + 1) / exercises.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
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
          
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Practice Exercises</h1>
              <p className="text-gray-600">
                {content?.title} • {content?.topicName}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">
                  {exercises.reduce((sum, ex) => sum + (submitted[ex.id] ? ex.points : 0), 0)} / 
                  {exercises.reduce((sum, ex) => sum + ex.points, 0)} points
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Exercise {currentIndex + 1} of {exercises.length}
              </p>
            </div>
          </div>

          <Progress value={progress} className="h-2" />
        </div>

        {/* Exercise Card */}
        {currentExercise && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{currentExercise.title}</CardTitle>
                  <p className="text-gray-600 mt-1">{currentExercise.instructions}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-2">
                    {currentExercise.type.replace('_', ' ')}
                  </Badge>
                  <p className="text-sm font-medium">{currentExercise.points} points</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderExercise(currentExercise)}
              
              {/* Submit button */}
              {!submitted[currentExercise.id] && (
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={() => handleSubmitExercise(currentExercise.id)}
                    disabled={
                      !answers[currentExercise.id] || 
                      (currentExercise.type === 'ESSAY' && 
                        currentExercise.content.minWords &&
                        answers[currentExercise.id].split(/\s+/).filter((w: string) => w.length > 0).length < currentExercise.content.minWords
                      )
                    }
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit Answer
                  </Button>
                </div>
              )}
              
              {/* Feedback */}
              {submitted[currentExercise.id] && (
                <div className={`mt-4 p-4 rounded-lg ${
                  currentExercise.type === 'ESSAY' || currentExercise.type === 'AUDIO_RECORDING'
                    ? 'bg-blue-50 text-blue-700'
                    : answers[currentExercise.id] === currentExercise.correctAnswer?.answer ||
                      JSON.stringify(answers[currentExercise.id]) === JSON.stringify(currentExercise.correctAnswer?.answers)
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}>
                  {currentExercise.type === 'ESSAY' || currentExercise.type === 'AUDIO_RECORDING' ? (
                    <p>Your answer has been submitted for review by your teacher.</p>
                  ) : (
                    <p>
                      {answers[currentExercise.id] === currentExercise.correctAnswer?.answer ||
                       JSON.stringify(answers[currentExercise.id]) === JSON.stringify(currentExercise.correctAnswer?.answers)
                        ? '✓ Correct! Well done!'
                        : '✗ Not quite right. Review the correct answer above.'}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex(currentIndex - 1)}
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {currentIndex === exercises.length - 1 ? (
            <Button
              onClick={() => router.push('/student/learning')}
              className="bg-green-600 hover:bg-green-700"
            >
              Complete & Return
              <CheckCircle className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              disabled={!submitted[currentExercise?.id || '']}
            >
              Next Exercise
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}