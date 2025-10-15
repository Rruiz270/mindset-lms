'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  BookOpen,
  FileText,
  Users,
  School
} from 'lucide-react'

export default function InitializePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [currentStep, setCurrentStep] = useState('')

  const addResult = (message: string, success: boolean) => {
    setResults(prev => [...prev, { message, success, timestamp: new Date() }])
  }

  const initializeDatabase = async () => {
    setLoading(true)
    setResults([])
    
    try {
      // Step 0: Ensure Content table exists
      setCurrentStep('Creating Content table...')
      addResult('Creating Content table if needed...', true)
      
      const contentTableResponse = await fetch('/api/admin/create-content-table', {
        method: 'POST',
      })
      const contentTableData = await contentTableResponse.json()
      
      if (contentTableData.success) {
        addResult(`✅ ${contentTableData.message}`, true)
      } else {
        addResult(`❌ Failed to create Content table: ${contentTableData.error || 'Unknown error'}`, false)
      }

      // Step 1: Setup Topics
      setCurrentStep('Setting up topics...')
      addResult('Setting up topics...', true)
      
      const topicsResponse = await fetch('/api/admin/setup-topics-if-needed', {
        method: 'POST',
      })
      const topicsData = await topicsResponse.json()
      
      if (topicsData.success || topicsData.count > 0) {
        addResult(`✅ Topics initialized: ${topicsData.count || topicsData.message}`, true)
      } else {
        addResult(`❌ Failed to setup topics: ${topicsData.error || 'Unknown error'}`, false)
      }

      // Step 2: Create sample content for first topic
      setCurrentStep('Adding sample content...')
      addResult('Adding sample content for Travel: Things to Do...', true)
      
      const contentResponse = await fetch('/api/admin/seed-starter-content', {
        method: 'POST',
      })
      const contentData = await contentResponse.json()
      
      if (contentData.success) {
        addResult(`✅ Sample content added: ${contentData.stats.total} items`, true)
      } else {
        addResult(`⚠️ Could not add sample content: ${contentData.error || 'Unknown error'}`, false)
      }

      // Step 3: Summary
      setCurrentStep('Initialization complete!')
      addResult('🎉 Database initialization complete!', true)
      
    } catch (error: any) {
      addResult(`❌ Error: ${error.message}`, false)
    } finally {
      setLoading(false)
      setCurrentStep('')
    }
  }

  const checkDatabaseStatus = async () => {
    setLoading(true)
    setResults([])
    
    try {
      // Check topics
      const topicsResponse = await fetch('/api/topics?level=STARTER')
      const topicsData = await topicsResponse.json()
      
      if (Array.isArray(topicsData)) {
        addResult(`✅ Found ${topicsData.length} starter topics`, true)
      } else {
        addResult('❌ No topics found in database', false)
      }

      // Check for content
      const contentResponse = await fetch('/api/admin/content?level=starter')
      const contentData = await contentResponse.json()
      
      if (Array.isArray(contentData)) {
        addResult(`✅ Found ${contentData.length} content items`, true)
      } else {
        addResult('❌ No content found in database', false)
      }
      
    } catch (error: any) {
      addResult(`❌ Error checking status: ${error.message}`, false)
    } finally {
      setLoading(false)
    }
  }

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <p className="text-center">Admin access required</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Database className="h-8 w-8 text-blue-600" />
            Database Initialization
          </h1>
          <p className="text-gray-600">
            Initialize your database with topics and sample content
          </p>
        </div>

        <div className="grid gap-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Use these tools to set up your database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  onClick={checkDatabaseStatus}
                  disabled={loading}
                  variant="outline"
                  className="flex-1"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Check Database Status
                </Button>
                
                <Button 
                  onClick={initializeDatabase}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Initialize Database
                    </>
                  )}
                </Button>
              </div>

              {currentStep && (
                <Alert>
                  <AlertDescription className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {currentStep}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg flex items-start gap-2 ${
                        result.success 
                          ? 'bg-green-50 text-green-800' 
                          : 'bg-red-50 text-red-800'
                      }`}
                    >
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-4 w-4 mt-0.5" />
                      )}
                      <span className="text-sm">{result.message}</span>
                    </div>
                  ))}
                </div>

                {results.some(r => r.success) && (
                  <div className="mt-6 flex gap-4">
                    <Button 
                      onClick={() => router.push('/admin/content')}
                      className="flex-1"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Go to Content Management
                    </Button>
                    <Button 
                      onClick={() => router.push('/admin')}
                      variant="outline"
                      className="flex-1"
                    >
                      Back to Admin
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>What This Does</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex gap-3">
                  <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Creates Topics</h3>
                    <p className="text-sm text-gray-600">
                      Adds 32 starter topics + sample topics for other levels
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <FileText className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Adds Sample Content</h3>
                    <p className="text-sm text-gray-600">
                      Creates pre-class, live class, and post-class content for the first topic
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <School className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Ready to Use</h3>
                    <p className="text-sm text-gray-600">
                      After initialization, you can immediately start managing content
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}