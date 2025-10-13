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
    // Fetch complete student dashboard data
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/student/dashboard')
        if (response.ok) {
          const data = await response.json()
          setPackageInfo(data.package)
          // You can store other data like current topic, upcoming topics, etc.
          console.log('Dashboard data:', data)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setPackageInfo(null)
      }
    }

    if (session?.user?.id && typeof window !== 'undefined') {
      fetchDashboardData()
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user.name}!
          </h1>
          <p className="text-gray-600">
            Continue your English learning journey
          </p>
          
          {/* Course Information */}
          <div className="mt-4 p-4 bg-white/60 backdrop-blur-sm rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Course Start:</span>
                <p className="text-gray-900">
                  {packageInfo?.validFrom ? new Date(packageInfo.validFrom).toLocaleDateString() : 'Not available'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Current Course:</span>
                <p className="text-gray-900">
                  {session?.user?.level ? `English ${session.user.level}` : 'Not assigned'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Contract End:</span>
                <p className="text-gray-900">
                  {packageInfo?.validUntil ? new Date(packageInfo.validUntil).toLocaleDateString() : 'Not available'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="flex items-center p-6">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Remaining Lessons</p>
                <p className="text-2xl font-bold text-gray-900">
                  {packageInfo?.remainingLessons || 0}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="flex items-center p-6">
              <BookOpen className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Level</p>
                <p className="text-2xl font-bold text-gray-900">
                  {session?.user?.level || 'Not Set'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white hover:shadow-lg transition-all duration-300">
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
          
          <Card className="bg-white hover:shadow-lg transition-all duration-300">
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
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Book a Class
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 mb-4">
                Schedule your next live class with one of our teachers
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                onClick={() => router.push('/student/book')}
              >
                Book Now
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center text-green-900">
                <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                Pre-Class Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 mb-4">
                Complete exercises before your live class
              </p>
              <Button variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-50" onClick={() => router.push('/student/exercises')}>
                View Exercises
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-900">
                <Trophy className="h-5 w-5 mr-2 text-purple-600" />
                My Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-700 mb-4">
                Track your learning progress and achievements
              </p>
              <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50" onClick={() => router.push('/student/progress')}>
                View Progress
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8 bg-white hover:shadow-lg transition-all duration-300">
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