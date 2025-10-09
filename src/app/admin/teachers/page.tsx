'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
  GraduationCap,
  UserPlus,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Languages,
  Star,
  Award,
  Check,
  Plus,
  Trash2
} from 'lucide-react';

interface TeacherForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  gender: string;
  languages: string[];
  nativeLanguage: string;
  certifications: string[];
  experience: number;
  education: string;
  specializations: string[];
  monthlySalary: number;
  hourlyRate: number;
  contractType: string;
  startDate: string;
  availability: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };
  biography: string;
  emergencyContact: string;
  emergencyPhone: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  languages: string[];
  salary: number;
  status: string;
  startDate: string;
}

export default function TeacherRegistrationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('register');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [teacherForm, setTeacherForm] = useState<TeacherForm>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    gender: '',
    languages: [],
    nativeLanguage: '',
    certifications: [],
    experience: 0,
    education: '',
    specializations: [],
    monthlySalary: 0,
    hourlyRate: 0,
    contractType: '',
    startDate: '',
    availability: {
      monday: { start: '09:00', end: '17:00', available: false },
      tuesday: { start: '09:00', end: '17:00', available: false },
      wednesday: { start: '09:00', end: '17:00', available: false },
      thursday: { start: '09:00', end: '17:00', available: false },
      friday: { start: '09:00', end: '17:00', available: false },
      saturday: { start: '09:00', end: '17:00', available: false },
      sunday: { start: '09:00', end: '17:00', available: false },
    },
    biography: '',
    emergencyContact: '',
    emergencyPhone: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
    } else {
      fetchTeachers();
    }
  }, [status, session, router]);

  const fetchTeachers = async () => {
    try {
      // TODO: Replace with actual API call
      setTeachers([
        {
          id: '1',
          name: 'Sarah Johnson',
          email: 'sarah@mindset.com',
          languages: ['English', 'Spanish'],
          salary: 3500,
          status: 'Active',
          startDate: '2024-01-15'
        },
        {
          id: '2',
          name: 'Carlos Rodriguez',
          email: 'carlos@mindset.com',
          languages: ['Spanish', 'English'],
          salary: 3200,
          status: 'Active',
          startDate: '2024-02-01'
        }
      ]);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // TODO: Implement API call to register teacher
      console.log('Registering teacher:', teacherForm);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Teacher registered successfully!');
      // Reset form
      setTeacherForm({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        birthDate: '',
        gender: '',
        languages: [],
        nativeLanguage: '',
        certifications: [],
        experience: 0,
        education: '',
        specializations: [],
        monthlySalary: 0,
        hourlyRate: 0,
        contractType: '',
        startDate: '',
        availability: {
          monday: { start: '09:00', end: '17:00', available: false },
          tuesday: { start: '09:00', end: '17:00', available: false },
          wednesday: { start: '09:00', end: '17:00', available: false },
          thursday: { start: '09:00', end: '17:00', available: false },
          friday: { start: '09:00', end: '17:00', available: false },
          saturday: { start: '09:00', end: '17:00', available: false },
          sunday: { start: '09:00', end: '17:00', available: false },
        },
        biography: '',
        emergencyContact: '',
        emergencyPhone: ''
      });
      
      // Refresh teachers list
      fetchTeachers();
    } catch (error) {
      console.error('Error registering teacher:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addLanguage = (language: string) => {
    if (language && !teacherForm.languages.includes(language)) {
      setTeacherForm({
        ...teacherForm,
        languages: [...teacherForm.languages, language]
      });
    }
  };

  const removeLanguage = (language: string) => {
    setTeacherForm({
      ...teacherForm,
      languages: teacherForm.languages.filter(l => l !== language)
    });
  };

  const addCertification = (cert: string) => {
    if (cert && !teacherForm.certifications.includes(cert)) {
      setTeacherForm({
        ...teacherForm,
        certifications: [...teacherForm.certifications, cert]
      });
    }
  };

  const removeCertification = (cert: string) => {
    setTeacherForm({
      ...teacherForm,
      certifications: teacherForm.certifications.filter(c => c !== cert)
    });
  };

  const updateAvailability = (day: string, field: string, value: any) => {
    setTeacherForm({
      ...teacherForm,
      availability: {
        ...teacherForm.availability,
        [day]: {
          ...teacherForm.availability[day as keyof typeof teacherForm.availability],
          [field]: value
        }
      }
    });
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
            Teacher Management
          </h1>
          <p className="text-gray-600">
            Manage teacher registration, languages, and compensation
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="register" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Register Teacher
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Manage Teachers
            </TabsTrigger>
          </TabsList>

          {/* Teacher Registration */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  New Teacher Registration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
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
                          value={teacherForm.fullName}
                          onChange={(e) => setTeacherForm({...teacherForm, fullName: e.target.value})}
                          placeholder="Enter full name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email *</label>
                        <Input
                          type="email"
                          value={teacherForm.email}
                          onChange={(e) => setTeacherForm({...teacherForm, email: e.target.value})}
                          placeholder="teacher@email.com"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone *</label>
                        <Input
                          value={teacherForm.phone}
                          onChange={(e) => setTeacherForm({...teacherForm, phone: e.target.value})}
                          placeholder="+1 (555) 123-4567"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Birth Date</label>
                        <Input
                          type="date"
                          value={teacherForm.birthDate}
                          onChange={(e) => setTeacherForm({...teacherForm, birthDate: e.target.value})}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Address</label>
                        <Textarea
                          value={teacherForm.address}
                          onChange={(e) => setTeacherForm({...teacherForm, address: e.target.value})}
                          placeholder="Full address"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Language Skills */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Languages className="h-5 w-5" />
                      Language Skills
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Native Language *</label>
                        <Select 
                          value={teacherForm.nativeLanguage} 
                          onValueChange={(value) => setTeacherForm({...teacherForm, nativeLanguage: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select native language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="spanish">Spanish</SelectItem>
                            <SelectItem value="portuguese">Portuguese</SelectItem>
                            <SelectItem value="french">French</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Teaching Languages</label>
                        <div className="flex gap-2 mb-2">
                          <Select onValueChange={addLanguage}>
                            <SelectTrigger>
                              <SelectValue placeholder="Add language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="English">English</SelectItem>
                              <SelectItem value="Spanish">Spanish</SelectItem>
                              <SelectItem value="Portuguese">Portuguese</SelectItem>
                              <SelectItem value="French">French</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {teacherForm.languages.map((lang) => (
                            <Badge key={lang} variant="secondary" className="flex items-center gap-1">
                              {lang}
                              <button
                                type="button"
                                onClick={() => removeLanguage(lang)}
                                className="ml-1 hover:text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Professional Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Years of Experience</label>
                        <Input
                          type="number"
                          value={teacherForm.experience}
                          onChange={(e) => setTeacherForm({...teacherForm, experience: Number(e.target.value)})}
                          placeholder="Years of teaching experience"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Education</label>
                        <Input
                          value={teacherForm.education}
                          onChange={(e) => setTeacherForm({...teacherForm, education: e.target.value})}
                          placeholder="Highest degree/education"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Certifications</label>
                        <div className="flex gap-2 mb-2">
                          <Input
                            placeholder="Add certification"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = e.target as HTMLInputElement;
                                addCertification(input.value);
                                input.value = '';
                              }
                            }}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {teacherForm.certifications.map((cert) => (
                            <Badge key={cert} variant="secondary" className="flex items-center gap-1">
                              {cert}
                              <button
                                type="button"
                                onClick={() => removeCertification(cert)}
                                className="ml-1 hover:text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Biography</label>
                        <Textarea
                          value={teacherForm.biography}
                          onChange={(e) => setTeacherForm({...teacherForm, biography: e.target.value})}
                          placeholder="Brief biography and teaching philosophy"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Compensation */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Compensation
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Monthly Salary (USD)</label>
                        <Input
                          type="number"
                          value={teacherForm.monthlySalary}
                          onChange={(e) => setTeacherForm({...teacherForm, monthlySalary: Number(e.target.value)})}
                          placeholder="3500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Hourly Rate (USD)</label>
                        <Input
                          type="number"
                          value={teacherForm.hourlyRate}
                          onChange={(e) => setTeacherForm({...teacherForm, hourlyRate: Number(e.target.value)})}
                          placeholder="25"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Contract Type</label>
                        <Select 
                          value={teacherForm.contractType} 
                          onValueChange={(value) => setTeacherForm({...teacherForm, contractType: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full-time">Full Time</SelectItem>
                            <SelectItem value="part-time">Part Time</SelectItem>
                            <SelectItem value="freelance">Freelance</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Weekly Availability
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(teacherForm.availability).map(([day, schedule]) => (
                        <div key={day} className="flex items-center gap-4 p-3 border rounded-lg">
                          <div className="w-20">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={schedule.available}
                                onChange={(e) => updateAvailability(day, 'available', e.target.checked)}
                              />
                              <span className="text-sm font-medium capitalize">{day}</span>
                            </label>
                          </div>
                          {schedule.available && (
                            <>
                              <div>
                                <Input
                                  type="time"
                                  value={schedule.start}
                                  onChange={(e) => updateAvailability(day, 'start', e.target.value)}
                                  className="w-24"
                                />
                              </div>
                              <span className="text-sm text-gray-500">to</span>
                              <div>
                                <Input
                                  type="time"
                                  value={schedule.end}
                                  onChange={(e) => updateAvailability(day, 'end', e.target.value)}
                                  className="w-24"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      ))}
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
                          value={teacherForm.emergencyContact}
                          onChange={(e) => setTeacherForm({...teacherForm, emergencyContact: e.target.value})}
                          placeholder="Emergency contact name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Contact Phone</label>
                        <Input
                          value={teacherForm.emergencyPhone}
                          onChange={(e) => setTeacherForm({...teacherForm, emergencyPhone: e.target.value})}
                          placeholder="Emergency contact phone"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date *</label>
                    <Input
                      type="date"
                      value={teacherForm.startDate}
                      onChange={(e) => setTeacherForm({...teacherForm, startDate: e.target.value})}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Registering...' : 'Register Teacher'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teacher Management */}
          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Current Teachers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teachers.map((teacher) => (
                    <div key={teacher.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{teacher.name}</h4>
                        <p className="text-sm text-gray-600">{teacher.email}</p>
                        <div className="flex gap-2 mt-2">
                          {teacher.languages.map((lang) => (
                            <Badge key={lang} variant="outline" className="text-xs">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${teacher.salary}/month</p>
                        <Badge className={teacher.status === 'Active' ? 'bg-green-600' : 'bg-gray-600'}>
                          {teacher.status}
                        </Badge>
                      </div>
                      <div className="ml-4">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}