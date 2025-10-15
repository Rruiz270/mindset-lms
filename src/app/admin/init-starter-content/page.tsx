'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'

export default function InitStarterContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    if (session?.user?.role === 'ADMIN' && status === 'idle') {
      initContent()
    }
  }, [session])

  const initContent = async () => {
    setStatus('loading')
    try {
      const response = await axios.post('/api/admin/seed-starter-complete')
      setResult(response.data)
      setStatus('success')
    } catch (error: any) {
      setResult({ error: error.response?.data?.error || error.message })
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Initializing Starter Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600">Creating content and exercises...</p>
            </div>
          )}

          {status === 'success' && result && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
              <div>
                <p className="text-lg font-semibold text-green-800">Success!</p>
                <p className="text-gray-600 mt-2">{result.message}</p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
                  <p>Topics: {result.stats?.topics || 0}</p>
                  <p>Content Created: {result.stats?.contentCreated || 0}</p>
                  <p>Exercises Created: {result.stats?.exercisesCreated || 0}</p>
                </div>
              </div>
              <Button 
                onClick={() => router.push('/admin/content')}
                className="w-full"
              >
                View Content
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 mx-auto text-red-600" />
              <div>
                <p className="text-lg font-semibold text-red-800">Error</p>
                <p className="text-gray-600 mt-2">{result?.error || 'Failed to create content'}</p>
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={initContent}
                  className="w-full"
                >
                  Try Again
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/admin')}
                  className="w-full"
                >
                  Back to Admin
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}