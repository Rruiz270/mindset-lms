'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Navbar from '@/components/layout/navbar'
import EnhancedBookingCalendar from '@/components/booking/EnhancedBookingCalendar'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function BookClassPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Book a Class
          </h1>
          <p className="text-gray-600">
            Schedule your next live English lesson for {session.user.level} level
          </p>
        </div>

        <EnhancedBookingCalendar 
          studentLevel={session.user.level || 'STARTER'}
          onBookingComplete={() => router.push('/student')}
        />
      </div>
    </div>
  )
}