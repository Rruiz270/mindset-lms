import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTopicForDate } from '@/data/topics';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get student level
    const student = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { level: true }
    });

    if (!student?.level) {
      return NextResponse.json({ error: 'Student level not set' }, { status: 400 });
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date required' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get available teachers (for now, using mock teachers)
    const teachers = [
      { id: 'teacher1', name: 'Mike Wilson' },
      { id: 'teacher2', name: 'Anna Garcia' }, 
      { id: 'teacher3', name: 'Sarah Johnson' },
      { id: 'teacher4', name: 'Lisa Chen' },
      { id: 'teacher5', name: 'David Brown' }
    ];

    const availableClasses = [];
    const current = new Date(start);

    while (current <= end) {
      // Skip Sundays (no classes) - Sunday = 0 in JavaScript
      if (current.getDay() !== 0) {
        // Get the correct topic for this date and student level
        const topic = getTopicForDate(current, student.level as any);
        
        if (topic) {
          // Create morning and evening slots
          const morningTime = new Date(current);
          morningTime.setHours(9, 0, 0, 0);
          
          const eveningTime = new Date(current);
          eveningTime.setHours(19, 0, 0, 0);

          // Morning class
          const morningTeacher = teachers[Math.floor(Math.random() * teachers.length)];
          const morningCapacity = Math.floor(Math.random() * 8) + 2; // 2-10 students
          const morningEnrolled = Math.floor(Math.random() * (morningCapacity - 1)) + 1;
          
          availableClasses.push({
            id: `${current.toISOString().split('T')[0]}-09-00`,
            date: current.toISOString().split('T')[0],
            time: '09:00',
            topic: topic.name,
            teacher: morningTeacher,
            capacity: morningCapacity,
            enrolled: morningEnrolled,
            available: morningCapacity - morningEnrolled,
            level: student.level,
            courseType: topic.courseType
          });

          // Evening class
          const eveningTeacher = teachers[Math.floor(Math.random() * teachers.length)];
          const eveningCapacity = Math.floor(Math.random() * 8) + 2;
          const eveningEnrolled = Math.floor(Math.random() * (eveningCapacity - 1)) + 1;
          
          availableClasses.push({
            id: `${current.toISOString().split('T')[0]}-19-00`,
            date: current.toISOString().split('T')[0],
            time: '19:00',
            topic: topic.name,
            teacher: eveningTeacher,
            capacity: eveningCapacity,
            enrolled: eveningEnrolled,
            available: eveningCapacity - eveningEnrolled,
            level: student.level,
            courseType: topic.courseType
          });
        }
      }
      
      // Move to next day
      current.setDate(current.getDate() + 1);
    }

    return NextResponse.json({
      success: true,
      classes: availableClasses,
      studentLevel: student.level,
      totalClasses: availableClasses.length
    });

  } catch (error: any) {
    console.error('Error fetching available classes:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch available classes',
      details: error.message
    }, { status: 500 });
  }
}