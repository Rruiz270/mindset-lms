'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestAuthPage() {
  const [email, setEmail] = useState('admin@mindset.com')
  const [password, setPassword] = useState('admin123')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      
      const data = await response.json()
      setResult({ status: response.status, data })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  const testHealth = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      setResult({ status: response.status, data })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={testLogin} 
              disabled={loading}
              className="flex-1"
            >
              Test Login
            </Button>
            <Button 
              onClick={testHealth} 
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              Check Health
            </Button>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Quick Test Credentials:</h3>
            <div className="text-sm space-y-1">
              <button 
                className="block text-blue-600 hover:underline"
                onClick={() => {
                  setEmail('admin@mindset.com')
                  setPassword('admin123')
                }}
              >
                Admin: admin@mindset.com / admin123
              </button>
              <button 
                className="block text-blue-600 hover:underline"
                onClick={() => {
                  setEmail('student1@mindset.com')
                  setPassword('student123')
                }}
              >
                Student: student1@mindset.com / student123
              </button>
              <button 
                className="block text-blue-600 hover:underline"
                onClick={() => {
                  setEmail('teacher1@mindset.com')
                  setPassword('teacher123')
                }}
              >
                Teacher: teacher1@mindset.com / teacher123
              </button>
            </div>
          </div>
          
          {result && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <h3 className="font-medium mb-2">Result:</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}