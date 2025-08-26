'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Navbar from '@/components/layout/navbar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock, CheckCircle, ArrowLeft } from 'lucide-react'

export default function StudentExercises() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (session?.user?.role !== 'STUDENT') {
      router.push('/dashboard')
    }
  }, [status, session, router])

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

        {/* Exercise Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Reading
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Improve your reading comprehension skills
              </p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">3 exercises available</span>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <Button className="w-full" disabled>
                Start Reading
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Writing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Practice your writing skills
              </p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">3 exercises available</span>
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <Button className="w-full" disabled>
                Start Writing
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Listening
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Enhance your listening comprehension
              </p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">3 exercises available</span>
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <Button className="w-full" disabled>
                Start Listening
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Speaking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Practice pronunciation and speaking
              </p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">3 exercises available</span>
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <Button className="w-full" disabled>
                Start Speaking
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Grammar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Master grammar rules and structures
              </p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">3 exercises available</span>
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <Button className="w-full" disabled>
                Start Grammar
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Vocabulary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Expand your vocabulary knowledge
              </p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">3 exercises available</span>
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <Button className="w-full" disabled>
                Start Vocabulary
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Progress Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Exercise Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Overall Progress</span>
                <span className="text-sm text-gray-500">1/6 categories completed</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '16.7%' }}></div>
              </div>
              <p className="text-sm text-gray-600">
                Complete all exercise categories before your next live class to maximize your learning.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}