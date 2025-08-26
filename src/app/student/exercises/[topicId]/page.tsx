'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/navbar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, CheckCircle, Clock } from 'lucide-react'

interface Exercise {
  id: string
  title: string
  instructions: string
  content: any
  correctAnswer: any
  category: string
  type: string
  phase: string
  points: number
  orderIndex: number
}

export default function ExercisePlayer({ params }: { params: { topicId: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const category = searchParams.get('category') || 'READING'
  
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<{[key: string]: any}>({})
  const [submissions, setSubmissions] = useState<{[key: string]: any}>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (session?.user?.role !== 'STUDENT') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/exercises/${params.topicId}?phase=PRE_CLASS&category=${category}`)
        if (response.ok) {
          const exerciseData = await response.json()
          setExercises(exerciseData)
        }
      } catch (error) {
        console.error('Error fetching exercises:', error)
        setExercises([])
      } finally {
        setLoading(false)
      }
    }

    if (params.topicId && category && typeof window !== 'undefined') {
      fetchExercises()
    }
  }, [params.topicId, category])

  const handleAnswerChange = (exerciseId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [exerciseId]: answer
    }))
  }

  const handleSubmitExercise = async (exercise: Exercise) => {
    const answer = answers[exercise.id]
    if (!answer) return

    try {
      const response = await fetch('/api/exercises/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          exerciseId: exercise.id,
          answer
        })
      })

      if (response.ok) {
        const result = await response.json()
        setSubmissions(prev => ({
          ...prev,
          [exercise.id]: result
        }))
      }
    } catch (error) {
      console.error('Error submitting exercise:', error)
    }
  }

  const renderExercise = (exercise: Exercise) => {
    const answer = answers[exercise.id]
    const submission = submissions[exercise.id]

    switch (exercise.type) {
      case 'MULTIPLE_CHOICE':
        return (
          <div className="space-y-4">
            {exercise.content.text && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm leading-relaxed">{exercise.content.text}</p>
              </div>
            )}
            
            {/* Handle single question format (our seeded data) */}
            {exercise.content.question && exercise.content.options && (
              <div className="space-y-3">
                <p className="font-medium text-lg">{exercise.content.question}</p>
                <div className="space-y-2">
                  {exercise.content.options.map((option: string, optIndex: number) => (
                    <label key={optIndex} className="flex items-center space-x-3 cursor-pointer p-3 hover:bg-gray-50 rounded-lg border border-gray-200">
                      <input
                        type="radio"
                        name={`question-${exercise.id}`}
                        value={optIndex}
                        checked={answer === optIndex}
                        onChange={(e) => handleAnswerChange(exercise.id, parseInt(e.target.value))}
                        disabled={!!submission}
                        className="text-blue-600 w-4 h-4"
                      />
                      <span className={`flex-1 ${submission && exercise.correctAnswer === optIndex ? 'text-green-600 font-medium' : ''}`}>
                        {option}
                      </span>
                      {submission && exercise.correctAnswer === optIndex && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Handle multiple questions format (legacy) */}
            {exercise.content.questions?.map((question: any, qIndex: number) => (
              <div key={qIndex} className="space-y-3">
                <p className="font-medium">{question.question}</p>
                <div className="space-y-2">
                  {question.options?.map((option: string, optIndex: number) => (
                    <label key={optIndex} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`question-${exercise.id}-${qIndex}`}
                        value={optIndex}
                        checked={answer === optIndex}
                        onChange={(e) => handleAnswerChange(exercise.id, parseInt(e.target.value))}
                        disabled={!!submission}
                        className="text-blue-600"
                      />
                      <span className={submission && question.correct === optIndex ? 'text-green-600 font-medium' : ''}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )

      case 'TRUE_FALSE':
        return (
          <div className="space-y-4">
            {/* Handle single statement format (our seeded data) */}
            {exercise.content.statement && (
              <div className="space-y-3">
                <p className="font-medium text-lg">{exercise.content.statement}</p>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer p-3 hover:bg-gray-50 rounded-lg border border-gray-200">
                    <input
                      type="radio"
                      name={`question-${exercise.id}`}
                      value="true"
                      checked={answer === true}
                      onChange={() => handleAnswerChange(exercise.id, true)}
                      disabled={!!submission}
                      className="text-blue-600 w-4 h-4"
                    />
                    <span className={`flex-1 ${submission && exercise.correctAnswer === true ? 'text-green-600 font-medium' : ''}`}>
                      True
                    </span>
                    {submission && exercise.correctAnswer === true && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer p-3 hover:bg-gray-50 rounded-lg border border-gray-200">
                    <input
                      type="radio"
                      name={`question-${exercise.id}`}
                      value="false"
                      checked={answer === false}
                      onChange={() => handleAnswerChange(exercise.id, false)}
                      disabled={!!submission}
                      className="text-blue-600 w-4 h-4"
                    />
                    <span className={`flex-1 ${submission && exercise.correctAnswer === false ? 'text-green-600 font-medium' : ''}`}>
                      False
                    </span>
                    {submission && exercise.correctAnswer === false && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </label>
                </div>
              </div>
            )}

            {/* Handle multiple questions format (legacy) */}
            {exercise.content.questions?.map((question: any, qIndex: number) => (
              <div key={qIndex} className="space-y-3">
                <p className="font-medium">{question.statement}</p>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${exercise.id}-${qIndex}`}
                      value="true"
                      checked={answer && answer[qIndex] === true}
                      onChange={(e) => {
                        const newAnswers = [...(answer || [])]
                        newAnswers[qIndex] = true
                        handleAnswerChange(exercise.id, newAnswers)
                      }}
                      disabled={!!submission}
                      className="text-blue-600"
                    />
                    <span>True</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${exercise.id}-${qIndex}`}
                      value="false"
                      checked={answer && answer[qIndex] === false}
                      onChange={(e) => {
                        const newAnswers = [...(answer || [])]
                        newAnswers[qIndex] = false
                        handleAnswerChange(exercise.id, newAnswers)
                      }}
                      disabled={!!submission}
                      className="text-blue-600"
                    />
                    <span>False</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )

      case 'GAP_FILL':
        return (
          <div className="space-y-4">
            {/* Handle single sentence format (our seeded data) */}
            {exercise.content.sentence && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-medium text-lg mb-2">Fill in the blank:</p>
                  <p className="text-gray-800 text-lg">{exercise.content.sentence}</p>
                  {exercise.content.hint && (
                    <p className="text-sm text-gray-600 mt-2 italic">Hint: {exercise.content.hint}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="Type your answer here..."
                    value={answer || ''}
                    onChange={(e) => handleAnswerChange(exercise.id, e.target.value)}
                    disabled={!!submission}
                    className={`text-lg p-4 ${submission ? (submission.score > 0 ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : ''}`}
                  />
                  {submission && (
                    <div className="text-sm">
                      <p className={submission.score > 0 ? 'text-green-600' : 'text-red-600'}>
                        Correct answer: <span className="font-medium">{exercise.correctAnswer}</span>
                      </p>
                    </div>
                  )}
                </div>
                {exercise.content.options && (
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-sm font-medium mb-2 text-yellow-800">Multiple choice options:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {exercise.content.options.map((option: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => handleAnswerChange(exercise.id, option)}
                          disabled={!!submission}
                          className="text-sm px-3 py-2 bg-white border border-yellow-300 rounded hover:bg-yellow-50 disabled:opacity-50"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Handle multiple sentences format (legacy) */}
            {exercise.content.sentences?.map((sentence: string, sIndex: number) => (
              <div key={sIndex} className="space-y-2">
                <p className="font-medium">Fill in the blank:</p>
                <p className="text-gray-700">{sentence}</p>
                <Input
                  placeholder="Your answer..."
                  value={answer && answer[sIndex] || ''}
                  onChange={(e) => {
                    const newAnswers = [...(answer || [])]
                    newAnswers[sIndex] = e.target.value
                    handleAnswerChange(exercise.id, newAnswers)
                  }}
                  disabled={!!submission}
                  className={submission ? (submission.score > 0 ? 'border-green-500' : 'border-red-500') : ''}
                />
              </div>
            ))}
            {exercise.content.wordBank && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium mb-2">Word Bank:</p>
                <p className="text-sm text-gray-600">{exercise.content.wordBank.join(', ')}</p>
              </div>
            )}
          </div>
        )

      case 'ESSAY':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm leading-relaxed">{exercise.content.prompt}</p>
              {exercise.content.wordLimit && (
                <p className="text-xs text-gray-500 mt-2">Word limit: {exercise.content.wordLimit} words</p>
              )}
            </div>
            <Textarea
              placeholder="Write your response here..."
              value={answer || ''}
              onChange={(e) => handleAnswerChange(exercise.id, e.target.value)}
              disabled={!!submission}
              className="min-h-32"
            />
            {answer && (
              <p className="text-xs text-gray-500">
                Word count: {answer.split(/\s+/).filter((word: string) => word.length > 0).length}
              </p>
            )}
          </div>
        )

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Exercise type not yet supported: {exercise.type}</p>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading exercises...</div>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session?.user || session.user.role !== 'STUDENT') {
    return null
  }

  if (exercises.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/student/exercises')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Exercises
          </Button>
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">No exercises available for this topic and category yet.</p>
              <Button onClick={() => router.push('/student/exercises')}>
                Choose Another Topic
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentExercise = exercises[currentIndex]
  const progress = ((currentIndex + 1) / exercises.length) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/student/exercises')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Exercises
          </Button>
          
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()} Exercises
            </h1>
            <div className="text-sm text-gray-500">
              {currentIndex + 1} of {exercises.length}
            </div>
          </div>
          
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{currentExercise.title}</span>
              <span className="text-sm font-normal text-gray-500">
                {currentExercise.points} points
              </span>
            </CardTitle>
            <p className="text-gray-600">{currentExercise.instructions}</p>
          </CardHeader>
          <CardContent>
            {renderExercise(currentExercise)}
            
            {/* Submission Result */}
            {submissions[currentExercise.id] && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Submitted!</span>
                </div>
                <p className="text-sm text-green-700">
                  Score: {submissions[currentExercise.id].score}/{submissions[currentExercise.id].maxPoints} points
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {submissions[currentExercise.id].feedback}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(currentIndex - 1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-2">
            {!submissions[currentExercise.id] && answers[currentExercise.id] !== undefined && (
              <Button 
                onClick={() => handleSubmitExercise(currentExercise)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Submit Answer
              </Button>
            )}

            {!answers[currentExercise.id] && !submissions[currentExercise.id] && (
              <Button 
                variant="outline" 
                disabled
                className="text-gray-400"
              >
                Answer Required
              </Button>
            )}
          </div>

          <Button
            disabled={currentIndex === exercises.length - 1}
            onClick={() => setCurrentIndex(currentIndex + 1)}
            variant={currentIndex === exercises.length - 1 ? "outline" : "default"}
          >
            {currentIndex === exercises.length - 1 ? 'Complete' : 'Next'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Progress Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Progress: {Object.keys(submissions).length}/{exercises.length} completed
            </span>
            <span className="text-gray-600">
              Total Points: {Object.values(submissions).reduce((sum: number, sub: any) => sum + (sub.score || 0), 0)} / {exercises.reduce((sum, ex) => sum + ex.points, 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}