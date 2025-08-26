'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user) {
      // Redirect based on user role
      switch (session.user.role) {
        case 'STUDENT':
          router.push('/student')
          break
        case 'TEACHER':
          router.push('/teacher')
          break
        case 'ADMIN':
          router.push('/admin')
          break
        default:
          router.push('/auth/login')
      }
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return null
}