'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';
import axios from 'axios';
import Navbar from '@/components/layout/navbar';

interface Availability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

export default function TeacherAvailability() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'TEACHER') {
      router.push('/auth/login');
    } else {
      fetchAvailability();
    }
  }, [session, status, router]);

  const fetchAvailability = async () => {
    try {
      const response = await axios.get('/api/teachers/availability');
      setAvailability(response.data);
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    if (!newSlot.dayOfWeek || !newSlot.startTime || !newSlot.endTime) {
      alert('Please fill in all fields');
      return;
    }

    if (newSlot.startTime >= newSlot.endTime) {
      alert('End time must be after start time');
      return;
    }

    try {
      await axios.post('/api/teachers/availability', {
        dayOfWeek: parseInt(newSlot.dayOfWeek),
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        isActive: true,
      });
      
      setNewSlot({ dayOfWeek: '', startTime: '', endTime: '' });
      fetchAvailability();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error adding availability');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await axios.put('/api/teachers/availability', {
        id,
        isActive: !isActive,
      });
      fetchAvailability();
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this availability slot?')) {
      return;
    }

    try {
      await axios.delete(`/api/teachers/availability?id=${id}`);
      fetchAvailability();
    } catch (error) {
      console.error('Error deleting availability:', error);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Availability</h1>
          <Button variant="outline" onClick={() => router.push('/teacher')}>
            Back to Dashboard
          </Button>
        </div>

        {/* Add New Slot */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add Availability Slot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Day of Week</Label>
                <Select
                  value={newSlot.dayOfWeek}
                  onValueChange={(value) => setNewSlot({ ...newSlot, dayOfWeek: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Start Time</Label>
                <Select
                  value={newSlot.startTime}
                  onValueChange={(value) => setNewSlot({ ...newSlot, startTime: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>End Time</Label>
                <Select
                  value={newSlot.endTime}
                  onValueChange={(value) => setNewSlot({ ...newSlot, endTime: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="End time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={handleAddSlot} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Slot
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Availability */}
        <Card>
          <CardHeader>
            <CardTitle>Your Current Availability</CardTitle>
          </CardHeader>
          <CardContent>
            {availability.length === 0 ? (
              <p className="text-muted-foreground">No availability slots configured yet.</p>
            ) : (
              <div className="space-y-2">
                {DAYS_OF_WEEK.map((day, dayIndex) => {
                  const daySlots = availability
                    .filter((slot) => slot.dayOfWeek === dayIndex)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime));

                  if (daySlots.length === 0) return null;

                  return (
                    <div key={dayIndex} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">{day}</h4>
                      <div className="space-y-2">
                        {daySlots.map((slot) => (
                          <div
                            key={slot.id}
                            className={`flex items-center justify-between p-2 rounded ${
                              slot.isActive ? 'bg-green-50' : 'bg-gray-50'
                            }`}
                          >
                            <div>
                              <span className="font-medium">
                                {slot.startTime} - {slot.endTime}
                              </span>
                              {!slot.isActive && (
                                <span className="ml-2 text-sm text-muted-foreground">(Inactive)</span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleActive(slot.id, slot.isActive)}
                              >
                                {slot.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(slot.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}