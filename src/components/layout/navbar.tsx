'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BookOpen, Calendar, Users, Settings, Home } from 'lucide-react'

export default function Navbar() {
  const { data: session } = useSession()

  const getNavLinks = () => {
    if (!session?.user) return [];
    
    switch (session.user.role) {
      case 'STUDENT':
        return [
          { href: '/student', label: 'Dashboard', icon: Home },
          { href: '/student/book', label: 'Book Class', icon: Calendar },
          { href: '/student/exercises', label: 'Exercises', icon: BookOpen },
          { href: '/student/progress', label: 'Progress', icon: Users },
        ];
      case 'TEACHER':
        return [
          { href: '/teacher', label: 'Dashboard', icon: Home },
          { href: '/teacher/availability', label: 'Availability', icon: Calendar },
        ];
      case 'ADMIN':
        return [
          { href: '/admin', label: 'Dashboard', icon: Home },
          { href: '/admin/users', label: 'Users', icon: Users },
          { href: '/admin/settings', label: 'Settings', icon: Settings },
        ];
      default:
        return [{ href: '/dashboard', label: 'Dashboard', icon: Home }];
    }
  };

  const navLinks = getNavLinks();

  return (
    <nav className="border-b bg-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <h1 className="text-xl font-bold text-primary">Mindset LMS</h1>
          
          {session?.user && (
            <>
              <div className="hidden md:flex items-center space-x-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <link.icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
              
              <div className="text-sm text-gray-600 hidden lg:block">
                {session.user.level && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {session.user.level}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
        
        {session?.user && (
          <div className="flex items-center space-x-4">
            <div className="text-sm hidden sm:block">
              <span className="text-gray-600">{session.user.name} • </span>
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