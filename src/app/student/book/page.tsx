'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/navbar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Clock, User, BookOpen } from 'lucide-react'

export default function BookClassPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [topics, setTopics] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [availableSlots, setAvailableSlots] = useState([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (session?.user?.role !== 'STUDENT') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    // Fetch topics for the student's level
    const fetchTopics = async () => {
      if (session?.user?.level) {
        try {
          const response = await fetch(`/api/topics?level=${session.user.level}`)
          if (response.ok) {
            const data = await response.json()
            setTopics(data)
          }
        } catch (error) {
          console.error('Error fetching topics:', error)
        }
      }
    }

    if (session?.user?.level) {
      fetchTopics()
    }
  }, [session?.user?.level])

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    return slots
  }

  const generateDateOptions = () => {
    const dates = []
    for (let i = 1; i <= 14; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedTopic) {
      alert('Please select all required fields')
      return
    }

    // This would integrate with the booking API
    alert('Booking feature coming soon!')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session?.user || session.user.role !== 'STUDENT') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Book a Class
          </h1>
          <p className="text-gray-600">
            Schedule your next live English lesson
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <select
                className="w-full p-3 border border-gray-300 rounded-md"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              >
                <option value="">Choose a date</option>
                {generateDateOptions().map(date => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Select Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <select
                className="w-full p-3 border border-gray-300 rounded-md"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                disabled={!selectedDate}
              >
                <option value="">Choose a time</option>
                {generateTimeSlots().map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {!selectedDate && (
                <p className="text-sm text-gray-500 mt-2">
                  Please select a date first
                </p>
              )}
            </CardContent>
          </Card>

          {/* Topic Selection */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Select Topic ({session.user.level} Level)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <select
                className="w-full p-3 border border-gray-300 rounded-md"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
              >
                <option value="">Choose a topic</option>
                {topics.map((topic: any) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-2">
                Topics are designed for your current level
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Booking Summary */}
        {selectedDate && selectedTime && selectedTopic && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {selectedTime}</p>
                <p><strong>Topic:</strong> {topics.find((t: any) => t.id === selectedTopic)?.name}</p>
                <p><strong>Duration:</strong> 1 hour</p>
                <p><strong>Level:</strong> {session.user.level}</p>
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <Button 
                  className="w-full md:w-auto"
                  onClick={handleBooking}
                >
                  Confirm Booking
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Booking Information</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <p>• Classes are 1 hour long</p>
            <p>• Maximum 10 students per class</p>
            <p>• You can cancel up to 6 hours before the class</p>
            <p>• Google Meet link will be sent to your email</p>
            <p>• Complete pre-class activities for better learning</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}