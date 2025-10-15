'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BookOpen, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { ALL_TOPICS } from '@/data/topics'

export default function SetupTopicsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSetupTopics = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/admin/setup-topics-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to setup topics')
      }
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const checkTopicStatus = async () => {
    try {
      // Only run on client side
      if (typeof window === 'undefined') return
      
      const response = await fetch('/api/admin/setup-topics-simple')
      const data = await response.json()
      
      if (data.success && data.totalTopics > 0) {
        setResult({
          alreadySetup: true,
          totalTopics: data.totalTopics,
          byLevel: data.byLevel
        })
      }
    } catch (err) {
      console.error('Error checking topic status:', err)
    }
  }

  // Check status on mount
  useState(() => {
    checkTopicStatus()
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Setup Course Topics
          </h1>
          <p className="text-gray-600">
            Initialize all Smart Learning and Smart Conversation topics for the system
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Topic Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Topic Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Smart Learning Topics</h3>
                  <div className="space-y-1 text-sm">
                    <p>• STARTER: 32 topics (3-day cycle)</p>
                    <p>• SURVIVOR: 40 topics (2-day cycle)</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-green-900 mb-2">Smart Conversation Topics</h3>
                  <div className="space-y-1 text-sm">
                    <p>• EXPLORER: 40 topics (2-day cycle)</p>
                    <p>• EXPERT: 40 topics (2-day cycle)</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Total Topics */}
            <Alert>
              <BookOpen className="h-4 w-4" />
              <AlertDescription>
                Total topics to setup: {ALL_TOPICS.length} topics across all levels
              </AlertDescription>
            </Alert>

            {/* Results */}
            {result && (
              <div className="space-y-4">
                {result.alreadySetup ? (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription>
                      <strong>Topics Already Setup!</strong>
                      <p className="mt-2">Found {result.totalTopics} topics in the database:</p>
                      <ul className="mt-2 space-y-1 text-sm">
                        {Object.entries(result.byLevel).map(([level, count]) => (
                          <li key={level}>• {level}: {count as number} topics</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      <strong>Success!</strong> Created {result.details?.created} topics
                      {result.summary && (
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>• STARTER: {result.summary.STARTER} topics</div>
                          <div>• SURVIVOR: {result.summary.SURVIVOR} topics</div>
                          <div>• EXPLORER: {result.summary.EXPLORER} topics</div>
                          <div>• EXPERT: {result.summary.EXPERT} topics</div>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Action Button */}
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleSetupTopics}
                disabled={loading || result?.alreadySetup}
                className="min-w-[200px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting up topics...
                  </>
                ) : result?.alreadySetup ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Topics Already Setup
                  </>
                ) : (
                  <>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Setup All Topics
                  </>
                )}
              </Button>
            </div>

            {/* Info */}
            <div className="text-center text-sm text-gray-600 space-y-1">
              <p>This will create all topics needed for the course schedule</p>
              <p>Topics follow the exact calendar pattern with proper cycling</p>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={() => router.push('/admin')}>
            Back to Admin Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}