'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Navbar from '@/components/layout/navbar'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { 
  LayoutDashboard, 
  UserPlus, 
  GraduationCap, 
  Settings,
  Users,
  Building2,
  Calendar,
  Award,
  BarChart3,
  FileText,
  UserCheck,
  Upload,
  Database,
} from 'lucide-react'


export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/auth/login');
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Control Panel
          </h1>
          <p className="text-gray-600">
            Manage all aspects of your Mindset LMS platform
          </p>
        </div>

        {/* Main Admin Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tile 1: Dashboard Admin */}
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-200"
                onClick={() => router.push('/admin/dashboard')}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <LayoutDashboard className="h-8 w-8 text-blue-600" />
                </div>
                <BarChart3 className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-xl mb-2">Dashboard Admin</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                View student metrics, course enrollments, contract periods, levels,
                and B2B vs B2C analytics
              </CardDescription>
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">Active Students</div>
                <div className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">Course Analytics</div>
                <div className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">B2B/B2C Stats</div>
              </div>
            </CardContent>
          </Card>

          {/* Tile 2: Registration */}
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-green-200"
                onClick={() => router.push('/admin/registration')}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-green-100 rounded-lg">
                  <UserPlus className="h-8 w-8 text-green-600" />
                </div>
                <Building2 className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-xl mb-2">Registration</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Register new students and companies with complete profile information,
                course selection, and contract details
              </CardDescription>
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">Student Forms</div>
                <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">Company Registration</div>
                <div className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded">Contract Setup</div>
              </div>
            </CardContent>
          </Card>

          {/* Tile 3: Teacher Registration */}
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-purple-200"
                onClick={() => router.push('/admin/teachers')}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <GraduationCap className="h-8 w-8 text-purple-600" />
                </div>
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-xl mb-2">Teacher Registration</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Manage teacher profiles, languages (English/Spanish), availability,
                and monthly compensation
              </CardDescription>
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">Language Skills</div>
                <div className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded">Availability</div>
                <div className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">Salary Management</div>
              </div>
            </CardContent>
          </Card>

          {/* Tile 4: Settings & Rules */}
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-orange-200"
                onClick={() => router.push('/admin/settings')}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Settings className="h-8 w-8 text-orange-600" />
                </div>
                <Award className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-xl mb-2">Settings & Rules</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Configure cancellation policies, contract freeze rules, class counts,
                student certificates, and system settings
              </CardDescription>
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">Cancellation Rules</div>
                <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">Contract Freeze</div>
                <div className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">Certificates</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-9 gap-4">
              <button 
                onClick={() => router.push('/admin/users')}
                className="p-4 text-center hover:bg-blue-50 rounded-lg transition-colors border-2 border-blue-200"
              >
                <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">View Users</span>
              </button>
              <button 
                onClick={() => router.push('/admin/simple-import')}
                className="p-4 text-center hover:bg-green-50 rounded-lg transition-colors border-2 border-green-200"
              >
                <Upload className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <span className="text-sm font-medium text-green-700">Import CSV</span>
              </button>
              <button 
                onClick={() => router.push('/admin/auto-populate')}
                className="p-4 text-center hover:bg-purple-50 rounded-lg transition-colors border-2 border-purple-200"
              >
                <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Auto-Populate</span>
              </button>
              <button 
                onClick={() => router.push('/admin/update-student-data')}
                className="p-4 text-center hover:bg-orange-50 rounded-lg transition-colors border-2 border-orange-200"
              >
                <Database className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">Update Hours</span>
              </button>
              <button 
                onClick={() => router.push('/admin/live-class-content')}
                className="p-4 text-center hover:bg-gray-50 rounded-lg transition-colors"
              >
                <FileText className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <span className="text-sm">Live Class Content</span>
              </button>
              <button 
                onClick={() => router.push('/admin/bookings')}
                className="p-4 text-center hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Calendar className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <span className="text-sm">View Bookings</span>
              </button>
              <button 
                onClick={() => router.push('/admin/reports')}
                className="p-4 text-center hover:bg-gray-50 rounded-lg transition-colors"
              >
                <BarChart3 className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <span className="text-sm">Generate Reports</span>
              </button>
              <button 
                onClick={() => router.push('/admin/communications')}
                className="p-4 text-center hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Users className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <span className="text-sm">Communications</span>
              </button>
              <button 
                onClick={() => router.push('/admin/attendance')}
                className="p-4 text-center hover:bg-gray-50 rounded-lg transition-colors"
              >
                <UserCheck className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <span className="text-sm">Attendance Reports</span>
              </button>
              <button 
                onClick={() => router.push('/admin/database')}
                className="p-4 text-center hover:bg-gray-50 rounded-lg transition-colors"
              >
                <FileText className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <span className="text-sm">View Database</span>
              </button>
              <button 
                onClick={() => router.push('/admin/setup')}
                className="p-4 text-center hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Settings className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                <span className="text-sm">Setup Database</span>
              </button>
              <button 
                onClick={() => router.push('/admin/setup-demo')}
                className="p-4 text-center hover:bg-red-50 rounded-lg transition-colors border-2 border-red-200"
              >
                <Users className="h-6 w-6 mx-auto mb-2 text-red-600" />
                <span className="text-sm font-medium text-red-700">Fix Demo Accounts</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}