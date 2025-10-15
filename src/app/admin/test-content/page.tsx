'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function TestContentPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const runTests = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/test-content-table')
      const data = await response.json()
      setResults(data)
    } catch (error: any) {
      setResults({ error: error.message })
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
            Content Table Diagnostics
          </h1>
          <p className="text-gray-600">
            Test the Content table and identify any issues
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Run Diagnostics</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runTests}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Run Content Table Tests
                </>
              )}
            </Button>

            {results && (
              <div className="mt-6 space-y-4">
                <Alert className={results.tableExists ? 'border-green-500' : 'border-red-500'}>
                  <AlertDescription>
                    <div className="flex items-center gap-2">
                      {results.tableExists ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-semibold">Content Table:</span>
                      {results.tableExists ? 'Exists' : 'Does not exist'}
                    </div>
                  </AlertDescription>
                </Alert>

                <Alert>
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Enums:</span>
                      </div>
                      <div className="ml-6 space-y-1">
                        <div>ContentType: {results.enumsExist?.ContentType ? '✅' : '❌'}</div>
                        <div>ContentPhase: {results.enumsExist?.ContentPhase ? '✅' : '❌'}</div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>

                {results.tableExists && (
                  <>
                    <Alert>
                      <AlertDescription>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Content Count:</span>
                          {results.selectError ? `Error: ${results.selectError}` : results.contentCount}
                        </div>
                      </AlertDescription>
                    </Alert>

                    <Alert>
                      <AlertDescription>
                        <div className="space-y-2">
                          <div className="font-semibold">Sample Topic:</div>
                          {results.sampleTopic ? (
                            <div className="ml-6">
                              <div>ID: {results.sampleTopic.id}</div>
                              <div>Name: {results.sampleTopic.name}</div>
                            </div>
                          ) : (
                            <div className="ml-6 text-red-600">No Travel topic found</div>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>

                    <Alert className={results.insertResult === 'Success' ? 'border-green-500' : 'border-red-500'}>
                      <AlertDescription>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {results.insertResult === 'Success' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="font-semibold">Insert Test:</span>
                            {results.insertResult || 'Not run'}
                          </div>
                          {results.insertError && (
                            <div className="ml-6 text-sm text-red-600">
                              <div>Error: {results.insertError.message}</div>
                              <div>Code: {results.insertError.code}</div>
                              {results.insertError.detail && (
                                <div>Detail: {JSON.stringify(results.insertError.detail)}</div>
                              )}
                            </div>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  </>
                )}

                <Alert>
                  <AlertDescription>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Database URL:</span>
                      {results.databaseUrl}
                    </div>
                  </AlertDescription>
                </Alert>

                {results.error && (
                  <Alert className="border-red-500">
                    <AlertDescription>
                      <div className="text-red-600">
                        <div className="font-semibold">Error:</div>
                        <div>{results.error}</div>
                        {results.details && <div className="text-sm">{results.details}</div>}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <div className="mt-6 flex gap-4">
              <Button 
                variant="outline"
                onClick={() => router.push('/admin/initialize')}
                className="flex-1"
              >
                Back to Initialize
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/admin')}
                className="flex-1"
              >
                Back to Admin
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}