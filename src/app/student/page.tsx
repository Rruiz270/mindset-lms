'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/navbar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, BookOpen, Trophy, Clock } from 'lucide-react'

export default function StudentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [packageInfo, setPackageInfo] = useState<any>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (session?.user?.role !== 'STUDENT') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    // Fetch student package information
    const fetchPackageInfo = async () => {
      try {
        const response = await fetch('/api/student/package')
        if (response.ok) {
          const data = await response.json()
          setPackageInfo(data)
        }
      } catch (error) {
        console.error('Error fetching package info:', error)
        setPackageInfo(null)
      }
    }

    if (session?.user?.id && typeof window !== 'undefined') {
      fetchPackageInfo()
    }
  }, [session?.user?.id])

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
    <div 
      className="min-h-screen" 
      style={{ 
        background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #faf5ff 100%)',
        minHeight: '100vh'
      }}
    >
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '24px', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user.name}! 🚀
          </h1>
          <p className="text-gray-600">
            Continue your English learning journey
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-1 border-0" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <CardContent className="flex items-center p-6">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Remaining Lessons</p>
                <p className="text-2xl font-bold text-gray-900">
                  80
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-1 border-0" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <CardContent className="flex items-center p-6">
              <BookOpen className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Level</p>
                <p className="text-2xl font-bold text-gray-900">
                  STARTER
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-1 border-0" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <CardContent className="flex items-center p-6">
              <Trophy className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  0
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-1 border-0" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <CardContent className="flex items-center p-6">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Next Class</p>
                <p className="text-sm font-bold text-gray-900">
                  No upcoming classes
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-1 border-0" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Book a Class
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Schedule your next live class with one of our teachers
              </p>
              <Button 
                className="w-full text-white transition-colors duration-200" 
                style={{ backgroundColor: '#2563eb' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                onClick={() => router.push('/student/book')}
              >
                Book Now
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-1 border-0" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                Pre-Class Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Complete exercises before your live class
              </p>
              <Button variant="outline" className="w-full" onClick={() => router.push('/student/exercises')}>
                View Exercises
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-1 border-0" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                My Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Track your learning progress and achievements
              </p>
              <Button variant="outline" className="w-full" onClick={() => router.push('/student/progress')}>
                View Progress
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8 transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-1 border-0" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
          <CardHeader>
            <CardTitle className="text-gray-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No recent activity. Start by booking your first class!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}