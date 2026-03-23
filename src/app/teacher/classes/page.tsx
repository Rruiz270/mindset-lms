'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  User,
  Video,
  CheckCircle,
  BookOpen
} from 'lucide-react'

interface ClassItem {
  id: string
  scheduledAt: string
  status: string
  googleMeetLink: string | null
  duration: number
  attendedAt: string | null
  student: { id: string; name: string; email: string; level: string | null }
  topic: { id: string; name: string; level: string; orderIndex: number; description: string | null }
}

export default function TeacherClassesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'upcoming' | 'completed' | 'all'>('upcoming')
  const [completing, setCompleting] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'TEACHER') {
      router.push('/auth/login')
      return
    }
    fetchClasses()
  }, [status, session, router])

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/teacher/classes')
      if (res.ok) {
        const data = await res.json()
        setClasses(data)
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteClass = async (bookingId: string) => {
    setCompleting(bookingId)
    try {
      const res = await fetch('/api/teacher/classes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, action: 'complete' }),
      })
      if (res.ok) {
        await fetchClasses()
      }
    } catch (error) {
      console.error('Error completing class:', error)
    } finally {
      setCompleting(null)
    }
  }

  const now = new Date()
  const filteredClasses = classes.filter(c => {
    if (filter === 'upcoming') return c.status === 'SCHEDULED' && new Date(c.scheduledAt) >= now
    if (filter === 'completed') return c.status === 'COMPLETED'
    return true
  })

  const upcomingCount = classes.filter(c => c.status === 'SCHEDULED' && new Date(c.scheduledAt) >= now).length
  const completedCount = classes.filter(c => c.status === 'COMPLETED').length

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            My Classes
          </h1>
          <p className="text-gray-600">Manage your upcoming and completed classes</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="cursor-pointer hover:shadow-md" onClick={() => setFilter('upcoming')}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md" onClick={() => setFilter('completed')}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md" onClick={() => setFilter('all')}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{classes.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(['upcoming', 'completed', 'all'] as const).map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>

        {/* Classes List */}
        <div className="space-y-4">
          {filteredClasses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No {filter} classes found</p>
              </CardContent>
            </Card>
          ) : (
            filteredClasses.map(cls => {
              const scheduled = new Date(cls.scheduledAt)
              const isUpcoming = cls.status === 'SCHEDULED' && scheduled >= now
              const isPast = cls.status === 'SCHEDULED' && scheduled < now

              return (
                <Card key={cls.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{cls.topic.name}</h3>
                          <Badge className={
                            cls.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            isPast ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {cls.status === 'COMPLETED' ? 'Completed' : isPast ? 'Needs Completion' : 'Upcoming'}
                          </Badge>
                          <Badge variant="outline">{cls.topic.level}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{cls.student.name}</span>
                            {cls.student.level && (
                              <Badge variant="outline" className="text-xs">{cls.student.level}</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{scheduled.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{scheduled.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ({cls.duration} min)</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {cls.googleMeetLink && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={cls.googleMeetLink} target="_blank" rel="noopener noreferrer">
                              <Video className="h-4 w-4 mr-1" />
                              Meet
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/teacher/live-class/${cls.id}`)}
                        >
                          <BookOpen className="h-4 w-4 mr-1" />
                          Slides
                        </Button>
                        {cls.status !== 'COMPLETED' && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleCompleteClass(cls.id)}
                            disabled={completing === cls.id}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {completing === cls.id ? 'Saving...' : 'Complete'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
