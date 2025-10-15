'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ExercisesPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to unified content management
    router.push('/admin/content')
  }, [])

  return null
}