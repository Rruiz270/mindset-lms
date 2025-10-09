'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/layout/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  UserPlus,
  Building2,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Clock,
  Briefcase,
  Check,
  XCircle
} from 'lucide-react';

interface StudentForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  gender: string;
  cefrLevel: string;
  mindsetLevel: string;
  course: string;
  totalHours: number;
  contractStart: string;
  contractEnd: string;
  company?: string;
  isB2B: boolean;
  emergencyContact: string;
  emergencyPhone: string;
}

interface CompanyForm {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  employeeCount: number;
  contractType: string;
  notes: string;
}

export default function RegistrationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [studentForm, setStudentForm] = useState<StudentForm>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    gender: '',
    cefrLevel: '',
    mindsetLevel: '',
    course: '',
    totalHours: 80,
    contractStart: '',
    contractEnd: '',
    company: '',
    isB2B: false,
    emergencyContact: '',
    emergencyPhone: ''
  });

  const [companyForm, setCompanyForm] = useState<CompanyForm>({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    industry: '',
    employeeCount: 0,
    contractType: '',
    notes: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess('');
    
    try {
      const response = await fetch('/api/admin/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentForm),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to register student');
      }
      
      setError('');
      setSuccess(`Student registered successfully! Temporary password: ${result.tempPassword}`);
      setStudentForm({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        birthDate: '',
        gender: '',
        cefrLevel: '',
        mindsetLevel: '',
        course: '',
        totalHours: 80,
        contractStart: '',
        contractEnd: '',
        company: '',
        isB2B: false,
        emergencyContact: '',
        emergencyPhone: ''
      });
    } catch (error) {
      console.error('Error registering student:', error);
      setSuccess('');
      setError(error instanceof Error ? error.message : 'Failed to register student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess('');
    
    try {
      const response = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyForm),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to register company');
      }
      
      setError('');
      setSuccess('Company registered successfully!');
      setCompanyForm({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        industry: '',
        employeeCount: 0,
        contractType: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error registering company:', error);
      setSuccess('');
      setError(error instanceof Error ? error.message : 'Failed to register company');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
    return <div className="min-h-screen flex items-center justify-center">Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/admin')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Panel
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Registration Center
          </h1>
          <p className="text-gray-600">
            Register new students and partner companies
          </p>
        </div>

        {success && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-700">
                <Check className="h-5 w-5" />
                <span>{success}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Student Registration
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Company Registration
            </TabsTrigger>
          </TabsList>

          {/* Student Registration */}
          <TabsContent value="student">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  New Student Registration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStudentSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name *</label>
                        <Input
                          value={studentForm.fullName}
                          onChange={(e) => setStudentForm({...studentForm, fullName: e.target.value})}
                          placeholder="Enter full name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email *</label>
                        <Input
                          type="email"
                          value={studentForm.email}
                          onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                          placeholder="student@email.com"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone *</label>
                        <Input
                          value={studentForm.phone}
                          onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})}
                          placeholder="+1 (555) 123-4567"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Birth Date *</label>
                        <Input
                          type="date"
                          value={studentForm.birthDate}
                          onChange={(e) => setStudentForm({...studentForm, birthDate: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Gender</label>
                        <Select 
                          value={studentForm.gender} 
                          onValueChange={(value) => setStudentForm({...studentForm, gender: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Address</label>
                        <Textarea
                          value={studentForm.address}
                          onChange={(e) => setStudentForm({...studentForm, address: e.target.value})}
                          placeholder="Enter full address"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Academic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">CEFR Level *</label>
                        <Select 
                          value={studentForm.cefrLevel} 
                          onValueChange={(value) => setStudentForm({...studentForm, cefrLevel: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select CEFR level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A1">A1 - Beginner</SelectItem>
                            <SelectItem value="A2">A2 - Elementary</SelectItem>
                            <SelectItem value="B1">B1 - Intermediate</SelectItem>
                            <SelectItem value="B2">B2 - Upper Intermediate</SelectItem>
                            <SelectItem value="C1">C1 - Advanced</SelectItem>
                            <SelectItem value="C2">C2 - Proficiency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Mindset Level *</label>
                        <Select 
                          value={studentForm.mindsetLevel} 
                          onValueChange={(value) => setStudentForm({...studentForm, mindsetLevel: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select internal level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="STARTER">STARTER</SelectItem>
                            <SelectItem value="SURVIVOR">SURVIVOR</SelectItem>
                            <SelectItem value="EXPLORER">EXPLORER</SelectItem>
                            <SelectItem value="EXPERT">EXPERT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Course Type *</label>
                        <Select 
                          value={studentForm.course} 
                          onValueChange={(value) => setStudentForm({...studentForm, course: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="smart-learning">Smart Learning</SelectItem>
                            <SelectItem value="smart-conversation">Smart Conversation</SelectItem>
                            <SelectItem value="conversaciones">Conversaciones</SelectItem>
                            <SelectItem value="private-lessons">Private Lessons</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Total Hours</label>
                        <Input
                          type="number"
                          value={studentForm.totalHours}
                          onChange={(e) => setStudentForm({...studentForm, totalHours: Number(e.target.value)})}
                          placeholder="80"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contract Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Contract Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Contract Start Date *</label>
                        <Input
                          type="date"
                          value={studentForm.contractStart}
                          onChange={(e) => setStudentForm({...studentForm, contractStart: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Contract End Date *</label>
                        <Input
                          type="date"
                          value={studentForm.contractEnd}
                          onChange={(e) => setStudentForm({...studentForm, contractEnd: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 mb-2">
                          <input
                            type="checkbox"
                            checked={studentForm.isB2B}
                            onChange={(e) => setStudentForm({...studentForm, isB2B: e.target.checked})}
                          />
                          <span className="text-sm font-medium">B2B Student (Company)</span>
                        </label>
                        {studentForm.isB2B && (
                          <Input
                            value={studentForm.company}
                            onChange={(e) => setStudentForm({...studentForm, company: e.target.value})}
                            placeholder="Company name"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Emergency Contact
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Contact Name</label>
                        <Input
                          value={studentForm.emergencyContact}
                          onChange={(e) => setStudentForm({...studentForm, emergencyContact: e.target.value})}
                          placeholder="Emergency contact name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Contact Phone</label>
                        <Input
                          value={studentForm.emergencyPhone}
                          onChange={(e) => setStudentForm({...studentForm, emergencyPhone: e.target.value})}
                          placeholder="Emergency contact phone"
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Registering...' : 'Register Student'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Registration */}
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  New Company Registration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCompanySubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Company Name *</label>
                      <Input
                        value={companyForm.companyName}
                        onChange={(e) => setCompanyForm({...companyForm, companyName: e.target.value})}
                        placeholder="Enter company name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Contact Person *</label>
                      <Input
                        value={companyForm.contactPerson}
                        onChange={(e) => setCompanyForm({...companyForm, contactPerson: e.target.value})}
                        placeholder="Primary contact name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email *</label>
                      <Input
                        type="email"
                        value={companyForm.email}
                        onChange={(e) => setCompanyForm({...companyForm, email: e.target.value})}
                        placeholder="company@email.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone *</label>
                      <Input
                        value={companyForm.phone}
                        onChange={(e) => setCompanyForm({...companyForm, phone: e.target.value})}
                        placeholder="+1 (555) 123-4567"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Industry</label>
                      <Select 
                        value={companyForm.industry} 
                        onValueChange={(value) => setCompanyForm({...companyForm, industry: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Employee Count</label>
                      <Input
                        type="number"
                        value={companyForm.employeeCount}
                        onChange={(e) => setCompanyForm({...companyForm, employeeCount: Number(e.target.value)})}
                        placeholder="Number of employees"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Address</label>
                      <Textarea
                        value={companyForm.address}
                        onChange={(e) => setCompanyForm({...companyForm, address: e.target.value})}
                        placeholder="Company address"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Contract Type</label>
                      <Select 
                        value={companyForm.contractType} 
                        onValueChange={(value) => setCompanyForm({...companyForm, contractType: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select contract type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="annual">Annual Contract</SelectItem>
                          <SelectItem value="quarterly">Quarterly Contract</SelectItem>
                          <SelectItem value="project-based">Project Based</SelectItem>
                          <SelectItem value="custom">Custom Terms</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Notes</label>
                      <Textarea
                        value={companyForm.notes}
                        onChange={(e) => setCompanyForm({...companyForm, notes: e.target.value})}
                        placeholder="Additional notes or requirements"
                        rows={3}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Registering...' : 'Register Company'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}