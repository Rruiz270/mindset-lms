'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Users, 
  Search, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  GraduationCap,
  Building,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Eye
} from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  level?: string;
  studentId?: string;
  isActive?: boolean;
  createdAt: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  remainingHours?: number;
  comments?: string;
  packages?: {
    id: string;
    totalLessons: number;
    usedLessons: number;
    remainingLessons: number;
    validFrom: string;
    validUntil: string;
  }[];
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user?.role !== 'ADMIN') {
      redirect('/auth/login');
    }
    
    fetchUsers();
  }, [session, status]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.studentId && user.studentId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Shield className="h-4 w-4" />;
      case 'TEACHER': return <GraduationCap className="h-4 w-4" />;
      case 'STUDENT': return <User className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800 border-red-200';
      case 'TEACHER': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'STUDENT': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin Panel
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  User Management
                </h1>
                <p className="text-gray-600">Manage all users in the system</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admins</option>
                <option value="TEACHER">Teachers</option>
                <option value="STUDENT">Students</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Students</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.role === 'STUDENT').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Teachers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.role === 'TEACHER').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.role === 'ADMIN').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No users found matching your criteria</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getRoleIcon(user.role)}
                          <h3 className="font-semibold text-gray-900">{user.name}</h3>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </Badge>
                          {user.studentId && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              ID: {user.studentId}
                            </Badge>
                          )}
                          {user.isActive !== undefined && (
                            <Badge className={user.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                              {user.isActive ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Inactive
                                </>
                              )}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{user.email}</span>
                          </div>
                          
                          {user.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Joined {formatDate(user.createdAt)}</span>
                          </div>
                          
                          {user.level && (
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4" />
                              <span>Level: {user.level}</span>
                            </div>
                          )}
                          
                          {user.remainingHours !== undefined && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span className={user.remainingHours > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                {user.remainingHours} hours remaining
                              </span>
                            </div>
                          )}
                        </div>

                        {user.packages && user.packages.length > 0 && (
                          <div className="mt-2 p-2 bg-gray-50 rounded">
                            <p className="text-sm font-medium text-gray-700">Package Info:</p>
                            {user.packages.map((pkg, index) => (
                              <div key={pkg.id} className="text-xs text-gray-600">
                                {pkg.remainingLessons}/{pkg.totalLessons} lessons remaining 
                                • Valid until {formatDate(pkg.validUntil)}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {user.comments && (
                          <div className="mt-2 p-2 bg-yellow-50 rounded border-l-2 border-yellow-200">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-yellow-800">{user.comments}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {user.role === 'STUDENT' && (
                        <div className="flex flex-col gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const details = {
                                name: user.name,
                                email: user.email,
                                phone: user.phone || 'Not provided',
                                studentId: user.studentId || 'N/A',
                                level: user.level || 'Not set',
                                remainingHours: user.remainingHours ?? 'Not set',
                                comments: user.comments || 'No comments',
                                status: user.isActive ? 'Active' : 'Inactive',
                                joinedDate: formatDate(user.createdAt)
                              };
                              
                              alert(`Student Details:\n\nName: ${details.name}\nEmail: ${details.email}\nPhone: ${details.phone}\nStudent ID: ${details.studentId}\nLevel: ${details.level}\nRemaining Hours: ${details.remainingHours}\nStatus: ${details.status}\nJoined: ${details.joinedDate}\n\nComments:\n${details.comments}`);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}