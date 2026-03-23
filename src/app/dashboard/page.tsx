'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/navbar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BookOpen,
  Calendar,
  CreditCard,
  Dumbbell,
  ExternalLink,
  GraduationCap,
  Loader2,
  Presentation,
  TrendingUp,
  Video,
} from 'lucide-react'

interface DashboardData {
  success: boolean
  student: {
    id: string; name: string; email: string; level: string | null
    studentId: string | null; isActive: boolean
  }
  package: { totalLessons: number; usedLessons: number; remainingLessons: number } | null
  currentTopic: { name: string } | null
  upcomingBookings: Array<{
    id: string; scheduledAt: string
    teacher: { id: string; name: string; email: string }
    topic: { id: string; name: string; level: string } | null
    googleMeetLink: string | null; status: string
  }>
  stats: { totalClasses: number; attendedClasses: number; attendanceRate: number }
  recentProgress: Array<{
    id: string
    topic: { id: string; name: string; level: string }
    preClassComplete: boolean; liveClassAttended: boolean; afterClassComplete: boolean
  }>
}

const LEVEL_TOTALS: Record<string, number> = { STARTER: 32, SURVIVOR: 48, EXPLORER: 48, EXPERT: 48 }

const LEVEL_COLORS: Record<string, { bg: string; text: string; badge: string }> = {
  STARTER: { bg: 'bg-green-100', text: 'text-green-800', badge: 'bg-green-500 text-white' },
  SURVIVOR: { bg: 'bg-blue-100', text: 'text-blue-800', badge: 'bg-blue-500 text-white' },
  EXPLORER: { bg: 'bg-purple-100', text: 'text-purple-800', badge: 'bg-purple-500 text-white' },
  EXPERT: { bg: 'bg-orange-100', text: 'text-orange-800', badge: 'bg-orange-500 text-white' },
}

function getLevelColor(level: string | null | undefined) {
  if (!level) return LEVEL_COLORS.STARTER
  return LEVEL_COLORS[level] ?? LEVEL_COLORS.STARTER
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
    else if (status === 'authenticated' && session?.user) {
      if (session.user.role === 'ADMIN') { router.push('/admin'); return }
      if (session.user.role === 'TEACHER') { router.push('/teacher'); return }
    }
  }, [status, session, router])

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const res = await fetch('/api/student/dashboard')
      if (!res.ok) throw new Error('Failed to load dashboard')
      const json = await res.json()
      if (!json.success) throw new Error('Failed to load dashboard')
      setData(json)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'STUDENT') fetchDashboard()
  }, [status, session?.user?.role, fetchDashboard])

  if (status === 'loading' || (status === 'authenticated' && session?.user?.role !== 'STUDENT')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (status !== 'authenticated' || !session?.user) return null

  const student = data?.student
  const pkg = data?.package
  const stats = data?.stats
  const currentTopic = data?.currentTopic
  const upcomingBookings = data?.upcomingBookings ?? []
  const recentProgress = data?.recentProgress ?? []
  const level = student?.level ?? session.user.level ?? null
  const levelColor = getLevelColor(level)
  const levelTotal = level ? LEVEL_TOTALS[level] ?? 48 : 48
  const completedTopics = recentProgress.length
  const progressPercent = levelTotal > 0 ? Math.round((completedTopics / levelTotal) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-medium">Unable to load dashboard</p>
            <p className="text-sm mt-1">{error}</p>
            <Button variant="outline" size="sm" className="mt-3 border-red-300 text-red-700" onClick={fetchDashboard}>Retry</Button>
          </div>
        )}

        {loading ? (
          <div className="mb-8 animate-pulse">
            <div className="h-8 w-72 bg-gray-200 rounded mb-2" />
            <div className="h-5 w-48 bg-gray-200 rounded" />
          </div>
        ) : (
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {student?.name ?? session.user.name}!</h1>
              {level && <Badge className={`${levelColor.badge} text-sm px-3 py-1`}>{level}</Badge>}
            </div>
            <p className="text-gray-600">Continue your English learning journey</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card><CardContent className="flex items-center p-6">
            <div className={`rounded-full p-3 ${levelColor.bg}`}><GraduationCap className={`h-6 w-6 ${levelColor.text}`} /></div>
            <div className="ml-4 min-w-0">
              <p className="text-sm font-medium text-gray-500">Today&apos;s Topic</p>
              <p className="text-base font-bold text-gray-900 truncate">{loading ? '...' : currentTopic?.name ?? 'No topic today'}</p>
            </div>
          </CardContent></Card>

          <Card><CardContent className="p-6">
            <div className="flex items-center mb-3">
              <div className="rounded-full p-3 bg-indigo-100"><TrendingUp className="h-6 w-6 text-indigo-600" /></div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Progress</p>
                <p className="text-lg font-bold text-gray-900">{loading ? '...' : `${completedTopics} / ${levelTotal}`}</p>
              </div>
            </div>
            <Progress value={loading ? 0 : progressPercent} className="h-2" />
            <p className="text-xs text-gray-500 mt-1 text-right">{loading ? '' : `${progressPercent}%`}</p>
          </CardContent></Card>

          <Card><CardContent className="flex items-center p-6">
            <div className="rounded-full p-3 bg-amber-100"><CreditCard className="h-6 w-6 text-amber-600" /></div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Lesson Credits</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : pkg?.remainingLessons ?? 0}</p>
              {pkg && <p className="text-xs text-gray-400">of {pkg.totalLessons} total</p>}
            </div>
          </CardContent></Card>

          <Card><CardContent className="flex items-center p-6">
            <div className="rounded-full p-3 bg-teal-100"><Calendar className="h-6 w-6 text-teal-600" /></div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Classes Attended</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats?.attendedClasses ?? 0}</p>
              {stats && stats.totalClasses > 0 && <p className="text-xs text-gray-400">{stats.attendanceRate}% attendance</p>}
            </div>
          </CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader><CardTitle className="flex items-center text-gray-900"><Video className="h-5 w-5 mr-2 text-blue-600" />Upcoming Classes</CardTitle></CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">{[1, 2].map(i => (<div key={i} className="animate-pulse flex items-center gap-4"><div className="h-12 w-12 bg-gray-200 rounded-lg" /><div className="flex-1 space-y-2"><div className="h-4 w-3/4 bg-gray-200 rounded" /><div className="h-3 w-1/2 bg-gray-200 rounded" /></div></div>))}</div>
                ) : upcomingBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No upcoming classes scheduled</p>
                    <Link href="/student/book"><Button size="sm">Book a Class</Button></Link>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {upcomingBookings.map(booking => (
                      <li key={booking.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{booking.topic?.name ?? 'General Class'}</p>
                            <p className="text-sm text-gray-500 mt-0.5">{formatDateTime(booking.scheduledAt)}</p>
                            <p className="text-sm text-gray-500">Teacher: {booking.teacher.name}</p>
                          </div>
                          {booking.googleMeetLink && (
                            <a href={booking.googleMeetLink} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" className="flex items-center gap-1.5 whitespace-nowrap"><ExternalLink className="h-3.5 w-3.5" />Join Meet</Button>
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-gray-900">Quick Actions</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Link href="/student/exercises" className="block"><Button variant="outline" className="w-full justify-start gap-3 h-12 border-green-200 hover:bg-green-50"><Dumbbell className="h-5 w-5 text-green-600" /><span className="text-gray-700 font-medium">Start Exercises</span></Button></Link>
                <Link href="/student/content" className="block"><Button variant="outline" className="w-full justify-start gap-3 h-12 border-purple-200 hover:bg-purple-50"><Presentation className="h-5 w-5 text-purple-600" /><span className="text-gray-700 font-medium">View Slides</span></Button></Link>
                <Link href="/student/book" className="block"><Button variant="outline" className="w-full justify-start gap-3 h-12 border-blue-200 hover:bg-blue-50"><BookOpen className="h-5 w-5 text-blue-600" /><span className="text-gray-700 font-medium">Book a Class</span></Button></Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center text-gray-900"><TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />Recent Progress</CardTitle></CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3 animate-pulse">{[1, 2, 3].map(i => <div key={i} className="h-4 bg-gray-200 rounded w-full" />)}</div>
                ) : recentProgress.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No progress recorded yet. Start a lesson!</p>
                ) : (
                  <ul className="space-y-3">
                    {recentProgress.map(item => (
                      <li key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 truncate mr-2">{item.topic.name}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`h-2 w-2 rounded-full ${item.preClassComplete ? 'bg-green-500' : 'bg-gray-300'}`} title="Pre-class" />
                          <span className={`h-2 w-2 rounded-full ${item.liveClassAttended ? 'bg-green-500' : 'bg-gray-300'}`} title="Live class" />
                          <span className={`h-2 w-2 rounded-full ${item.afterClassComplete ? 'bg-green-500' : 'bg-gray-300'}`} title="After-class" />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
