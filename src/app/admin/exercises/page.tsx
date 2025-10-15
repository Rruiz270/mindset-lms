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
  FileText,
  Headphones,
  Edit3,
  MessageSquare,
  CheckSquare,
  Target,
  Loader2
} from 'lucide-react'
import axios from 'axios'

interface Exercise {
  id: string
  topicId: string
  phase: 'PRE_CLASS' | 'AFTER_CLASS'
  category: string
  type: string
  title: string
  instructions: string
  content: any
  correctAnswer: any
  points: number
  orderIndex: number
  topic?: {
    name: string
    level: string
  }
}

export default function ExercisesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState('STARTER')
  const [selectedPhase, setSelectedPhase] = useState<'ALL' | 'PRE_CLASS' | 'AFTER_CLASS'>('ALL')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/admin')
      return
    }
    fetchExercises()
  }, [status, session, selectedLevel])

  const fetchExercises = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/admin/exercises?level=${selectedLevel}`)
      setExercises(response.data)
    } catch (error) {
      console.error('Error fetching exercises:', error)
      setExercises([])
    } finally {
      setLoading(false)
    }
  }

  const getExerciseIcon = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE': return <CheckSquare className="h-4 w-4" />
      case 'TRUE_FALSE': return <Target className="h-4 w-4" />
      case 'GAP_FILL': return <Edit3 className="h-4 w-4" />
      case 'ESSAY': return <FileText className="h-4 w-4" />
      case 'AUDIO_RECORDING': return <Headphones className="h-4 w-4" />
      case 'MATCHING': return <MessageSquare className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'READING': return 'bg-blue-100 text-blue-800'
      case 'WRITING': return 'bg-green-100 text-green-800'
      case 'LISTENING': return 'bg-purple-100 text-purple-800'
      case 'SPEAKING': return 'bg-orange-100 text-orange-800'
      case 'GRAMMAR': return 'bg-red-100 text-red-800'
      case 'VOCABULARY': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredExercises = exercises.filter(exercise => {
    if (selectedPhase !== 'ALL' && exercise.phase !== selectedPhase) return false
    if (selectedCategory !== 'ALL' && exercise.category !== selectedCategory) return false
    return true
  })

  const categories = [...new Set(exercises.map(e => e.category))]

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Exercise Management</h1>
          <p className="text-gray-600">View and manage all exercises across levels and topics</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STARTER">Starter</SelectItem>
                  <SelectItem value="SURVIVOR">Survivor</SelectItem>
                  <SelectItem value="EXPLORER">Explorer</SelectItem>
                  <SelectItem value="EXPERT">Expert</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedPhase} onValueChange={(v) => setSelectedPhase(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Phases</SelectItem>
                  <SelectItem value="PRE_CLASS">Pre-Class</SelectItem>
                  <SelectItem value="AFTER_CLASS">After-Class</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center justify-end">
                <span className="text-sm text-gray-600">
                  {filteredExercises.length} exercises
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exercise List */}
        {filteredExercises.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-gray-500">No exercises found. Create content first to generate exercises.</p>
              <Button 
                className="mt-4"
                onClick={() => router.push('/admin/content-builder')}
              >
                Go to Content Builder
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredExercises.map((exercise) => (
              <Card key={exercise.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getExerciseIcon(exercise.type)}
                        <h3 className="font-semibold text-lg">{exercise.title}</h3>
                        <Badge className={getCategoryColor(exercise.category)}>
                          {exercise.category}
                        </Badge>
                        <Badge variant="outline">
                          {exercise.phase.replace('_', ' ')}
                        </Badge>
                        <Badge variant="secondary">
                          {exercise.points} points
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{exercise.instructions}</p>
                      {exercise.topic && (
                        <p className="text-sm text-gray-500">
                          Topic: {exercise.topic.name}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/admin')}
            className="w-full md:w-auto"
          >
            Back to Admin
          </Button>
        </div>
      </div>
    </div>
  )
}