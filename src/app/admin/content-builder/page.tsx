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

        {/* Populate All Content */}
        <Card>
          <CardHeader>
            <CardTitle>Populate Content Repository</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              This will populate the entire content repository with exercises and materials for all levels.
            </p>
            <Button
              onClick={async () => {
                setLoading(true)
                setResult(null)
                try {
                  const response = await axios.post('/api/admin/seed-starter-complete')
                  setResult(response.data)
                  await fetchStats()
                } catch (error: any) {
                  setResult({ error: error.message })
                } finally {
                  setLoading(false)
                }
              }}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Populating Content...
                </>
              ) : (
                <>
                  <BookOpen className="h-5 w-5 mr-2" />
                  Populate All Content
                </>
              )}
            </Button>
            
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
                        Successfully populated content repository!
                      </div>
                      {result.stats && (
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Levels:</span>
                            <span className="font-semibold ml-1">{result.stats.levels}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Topics:</span>
                            <span className="font-semibold ml-1">{result.stats.topics}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Exercises:</span>
                            <span className="font-semibold ml-1">{result.stats.exercises}</span>
                          </div>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="default"
            onClick={() => router.push('/admin/content')}
            className="w-full"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Content & Exercise Management
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