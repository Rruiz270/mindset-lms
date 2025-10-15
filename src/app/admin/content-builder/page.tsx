'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BookOpen,
  CheckCircle,
  AlertCircle,
  Loader2,
  Database,
  FileText,
  Users,
  BarChart
} from 'lucide-react'
import axios from 'axios'

interface ContentStats {
  level: string
  topics: number
  content_items: number
  exercises: number
}

export default function ContentBuilderPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<ContentStats[]>([])
  const [selectedLevel, setSelectedLevel] = useState('STARTER')
  const [result, setResult] = useState<any>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/seed-complete-content')
      setStats(response.data.currentStats || [])
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const seedContent = async (level: string) => {
    setLoading(true)
    setResult(null)
    setProgress(0)
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 1000)

      const response = await axios.post('/api/admin/seed-complete-content', { level })
      
      clearInterval(progressInterval)
      setProgress(100)
      
      setResult(response.data)
      await fetchStats()
      
      setTimeout(() => setProgress(0), 2000)
    } catch (error: any) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    router.push('/admin')
    return null
  }

  const levels = [
    { value: 'STARTER', label: 'Starter', color: 'bg-blue-500' },
    { value: 'SURVIVOR', label: 'Survivor', color: 'bg-green-500' },
    { value: 'EXPLORER', label: 'Explorer', color: 'bg-purple-500' },
    { value: 'EXPERT', label: 'Expert', color: 'bg-red-500' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Database className="h-8 w-8 text-blue-600" />
            Content Builder
          </h1>
          <p className="text-gray-600">
            Build comprehensive content and exercises for all levels
          </p>
        </div>

        {/* Current Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {levels.map((level) => {
            const levelStats = stats.find(s => s.level === level.value.toLowerCase()) || 
                               { topics: 0, content_items: 0, exercises: 0 }
            return (
              <Card key={level.value}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    {level.label}
                    <div className={`w-3 h-3 rounded-full ${level.color}`} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Topics:</span>
                      <span className="font-semibold">{levelStats.topics}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Content:</span>
                      <span className="font-semibold">{levelStats.content_items}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Exercises:</span>
                      <span className="font-semibold">{levelStats.exercises}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Content Seeding */}
        <Card>
          <CardHeader>
            <CardTitle>Seed Content by Level</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedLevel} onValueChange={setSelectedLevel}>
              <TabsList className="grid w-full grid-cols-4">
                {levels.map((level) => (
                  <TabsTrigger key={level.value} value={level.value}>
                    {level.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {levels.map((level) => (
                <TabsContent key={level.value} value={level.value} className="space-y-4">
                  <div className="p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">{level.label} Level</h3>
                    <p className="text-gray-600 mb-4">
                      This will create comprehensive content for all topics in the {level.label} level,
                      including:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
                      <li>Pre-class content (videos, readings, audio)</li>
                      <li>Live class activities (discussions, exercises)</li>
                      <li>Post-class assignments (writing, speaking practice)</li>
                      <li>All associated exercises (multiple choice, gap fill, etc.)</li>
                    </ul>
                    
                    <Button
                      onClick={() => seedContent(level.value)}
                      disabled={loading}
                      className="w-full"
                      size="lg"
                    >
                      {loading && selectedLevel === level.value ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Seeding Content...
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-5 w-5 mr-2" />
                          Seed {level.label} Content
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {progress > 0 && (
              <div className="mt-6">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-gray-600 mt-2 text-center">{progress}% Complete</p>
              </div>
            )}

            {result && (
              <div className="mt-6">
                {result.error ? (
                  <Alert className="border-red-500">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription>
                      <span className="font-semibold">Error:</span> {result.error}
                      {result.details && (
                        <div className="text-sm mt-1">{result.details}</div>
                      )}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-green-500">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      <div className="font-semibold mb-2">
                        Successfully seeded {result.level} content!
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Topics:</span>
                          <span className="font-semibold ml-1">
                            {result.stats?.topicsProcessed}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Content:</span>
                          <span className="font-semibold ml-1">
                            {result.stats?.contentCreated}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Exercises:</span>
                          <span className="font-semibold ml-1">
                            {result.stats?.exercisesCreated}
                          </span>
                        </div>
                      </div>
                      {result.errors && result.errors.length > 0 && (
                        <div className="mt-2 text-sm text-red-600">
                          {result.errors.length} errors occurred
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Test */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Exercise Testing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                onClick={async () => {
                  try {
                    const response = await axios.post('/api/admin/seed-exercises-simple')
                    setResult(response.data)
                  } catch (error: any) {
                    setResult({ error: error.message })
                  }
                }}
                variant="secondary"
                className="w-full"
              >
                Test Simple Exercise Creation
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const response = await axios.get('/api/admin/debug-exercise-creation')
                    setResult(response.data)
                  } catch (error: any) {
                    setResult({ error: error.message })
                  }
                }}
                variant="outline"
                className="w-full"
              >
                Debug Exercise Creation
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const response = await axios.post('/api/admin/test-exercise-types')
                    setResult(response.data)
                  } catch (error: any) {
                    setResult({ error: error.message })
                  }
                }}
                variant="outline"
                className="w-full"
              >
                Test All Exercise Types
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const response = await axios.post('/api/admin/test-seed-with-logging')
                    setResult(response.data)
                  } catch (error: any) {
                    setResult({ error: error.message })
                  }
                }}
                variant="secondary"
                className="w-full"
              >
                Test Seed With Logging
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const response = await axios.get('/api/admin/debug-seed-errors')
                    setResult(response.data)
                  } catch (error: any) {
                    setResult({ error: error.message })
                  }
                }}
                variant="outline"
                className="w-full"
              >
                Debug Seed Errors
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const response = await axios.post('/api/admin/test-seed-debug', { level: 'STARTER' })
                    setResult(response.data)
                  } catch (error: any) {
                    setResult({ error: error.message })
                  }
                }}
                variant="outline"
                className="w-full"
              >
                Test Database Operations
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const response = await axios.post('/api/admin/seed-minimal', { level: selectedLevel })
                    setResult(response.data)
                    await fetchStats()
                  } catch (error: any) {
                    setResult({ error: error.message })
                  }
                }}
                variant="default"
                className="w-full"
              >
                Seed Minimal Content (Safe)
              </Button>
              <Button
                onClick={async () => {
                  try {
                    // First update content resources
                    await axios.post('/api/admin/update-content-resources')
                    
                    // Then create demo bookings
                    const usersResponse = await axios.get('/api/admin/users')
                    const students = usersResponse.data.users.filter((u: any) => u.role === 'STUDENT')
                    const teachers = usersResponse.data.users.filter((u: any) => u.role === 'TEACHER')
                    
                    if (students.length > 0 && teachers.length > 0) {
                      const response = await axios.post('/api/admin/create-demo-bookings', {
                        studentId: students[0].id,
                        teacherId: teachers[0].id
                      })
                      setResult(response.data)
                    } else {
                      setResult({ error: 'No students or teachers found' })
                    }
                  } catch (error: any) {
                    setResult({ error: error.message })
                  }
                }}
                variant="secondary"
                className="w-full"
              >
                Setup Demo Data (Resources + Bookings)
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const response = await axios.post('/api/admin/populate-getting-job')
                    setResult(response.data)
                    await fetchStats()
                  } catch (error: any) {
                    setResult({ error: error.message })
                  }
                }}
                variant="default"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Populate "Getting a Job" Topic
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="default"
            onClick={() => router.push('/admin/content-review')}
            className="w-full"
          >
            <FileText className="h-4 w-4 mr-2" />
            Review Content Structure
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/admin/content')}
            className="w-full"
          >
            <FileText className="h-4 w-4 mr-2" />
            Manage Content
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/admin/exercises')}
            className="w-full"
          >
            <BarChart className="h-4 w-4 mr-2" />
            View Exercises
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/admin')}
            className="w-full"
          >
            <Users className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
        </div>
      </div>
    </div>
  )
}