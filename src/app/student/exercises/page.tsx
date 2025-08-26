'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/navbar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookOpen, Clock, CheckCircle, ArrowLeft, Play } from 'lucide-react'

export default function StudentExercises() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [topics, setTopics] = useState<any[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const [exerciseCounts, setExerciseCounts] = useState<{[key: string]: number}>({})

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (session?.user?.role !== 'STUDENT') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    // Fetch topics for student's level
    const fetchTopics = async () => {
      if (!session?.user?.level) return
      
      try {
        const response = await fetch(`/api/topics?level=${session.user.level}`)
        if (response.ok) {
          const topicsData = await response.json()
          setTopics(topicsData)
          if (topicsData.length > 0) {
            setSelectedTopic(topicsData[0].id)
          }
        }
      } catch (error) {
        console.error('Error fetching topics:', error)
      }
    }

    if (session?.user?.level) {
      fetchTopics()
    }
  }, [session?.user?.level])

  useEffect(() => {
    // Fetch exercise counts for each category
    const fetchExerciseCounts = async () => {
      if (!selectedTopic) return

      try {
        const categories = ['READING', 'WRITING', 'LISTENING', 'SPEAKING', 'GRAMMAR', 'VOCABULARY']
        const counts: {[key: string]: number} = {}

        for (const category of categories) {
          const response = await fetch(`/api/exercises/${selectedTopic}?phase=PRE_CLASS&category=${category}`)
          if (response.ok) {
            const exercises = await response.json()
            counts[category] = exercises.length
          }
        }
        
        setExerciseCounts(counts)
      } catch (error) {
        console.error('Error fetching exercise counts:', error)
      }
    }

    fetchExerciseCounts()
  }, [selectedTopic])

  const handleStartExercises = (category: string) => {
    if (selectedTopic) {
      router.push(`/student/exercises/${selectedTopic}?category=${category}`)
    }
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

  const exerciseCategories = [
    { key: 'READING', name: 'Reading', icon: BookOpen, description: 'Improve your reading comprehension skills' },
    { key: 'WRITING', name: 'Writing', icon: BookOpen, description: 'Practice your writing skills' },
    { key: 'LISTENING', name: 'Listening', icon: BookOpen, description: 'Enhance your listening comprehension' },
    { key: 'SPEAKING', name: 'Speaking', icon: BookOpen, description: 'Practice pronunciation and speaking' },
    { key: 'GRAMMAR', name: 'Grammar', icon: BookOpen, description: 'Master grammar rules and structures' },
    { key: 'VOCABULARY', name: 'Vocabulary', icon: BookOpen, description: 'Expand your vocabulary knowledge' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
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
            Complete these exercises before your live class
          </p>
        </div>

        {/* Topic Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a topic to practice" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.name} (Level: {session.user.level})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Exercise Categories */}
        {selectedTopic && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {exerciseCategories.map((category) => {
              const Icon = category.icon
              const count = exerciseCounts[category.key] || 0
              const hasExercises = count > 0

              return (
                <Card key={category.key}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Icon className="h-5 w-5 mr-2" />
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">
                        {count} exercise{count !== 1 ? 's' : ''} available
                      </span>
                      {hasExercises ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <Button 
                      className="w-full" 
                      disabled={!hasExercises}
                      onClick={() => handleStartExercises(category.key)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start {category.name}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Progress Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Exercise Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedTopic ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Current Topic Progress</span>
                    <span className="text-sm text-gray-500">
                      {topics.find(t => t.id === selectedTopic)?.name}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
                    {exerciseCategories.map((category) => (
                      <div key={category.key} className="text-center">
                        <div className="font-medium">{category.name}</div>
                        <div className="text-gray-500">
                          {exerciseCounts[category.key] || 0} exercises
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Select a topic to see available exercises.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}