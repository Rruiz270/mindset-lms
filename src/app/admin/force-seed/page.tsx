'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ForceSeedPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Seeding content...')
  
  useEffect(() => {
    fetch('/api/admin/force-seed-content')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus(`Success! Created ${data.stats.newContent} content items and ${data.stats.newExercises} exercises. Redirecting...`)
          setTimeout(() => router.push('/admin/content'), 2000)
        } else {
          setStatus(`Error: ${data.error}`)
        }
      })
      .catch(err => setStatus(`Error: ${err.message}`))
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Force Seed Content</h1>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  )
}