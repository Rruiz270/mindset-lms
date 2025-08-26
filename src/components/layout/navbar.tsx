'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="border-b bg-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-primary">Mindset LMS</h1>
          {session?.user && (
            <div className="text-sm text-gray-600">
              Welcome, {session.user.name}
              {session.user.level && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {session.user.level}
                </span>
              )}
            </div>
          )}
        </div>
        
        {session?.user && (
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-600">Role: </span>
              <span className="font-medium">{session.user.role}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}