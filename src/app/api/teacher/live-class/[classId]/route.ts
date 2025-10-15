import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { classId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get booking and topic information
    const booking = await prisma.$queryRaw`
      SELECT 
        b.id,
        b.date,
        b.time,
        u.name as "studentName",
        t.id as "topicId",
        t.name as "topicName",
        t."orderIndex" as "topicOrderIndex"
      FROM "Booking" b
      JOIN "User" u ON b."studentId" = u.id
      JOIN "Topic" t ON b."topicId" = t.id
      WHERE b.id = ${params.classId}
      AND b."teacherId" = ${session.user.id}
    ` as any[]

    if (booking.length === 0) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    const classData = booking[0]

    // Define activities for "Getting a Job" topic
    // This would normally come from the database, but for now we'll hardcode it
    const activities = [
      {
        id: '1',
        title: 'Warm-up Discussion',
        description: 'Engage students with questions about jobs and work experience',
        type: 'discussion',
        duration: 10,
        order: 1,
        resourceUrl: null
      },
      {
        id: '2',
        title: 'Grammar Focus: Present Perfect & Modals',
        description: 'Teach key structures for talking about experience and abilities',
        type: 'exercise',
        duration: 15,
        order: 2,
        resourceUrl: null
      },
      {
        id: '3',
        title: 'Vocabulary Building: Job-related Terms',
        description: 'Introduce and practice essential vocabulary for job applications',
        type: 'exercise',
        duration: 15,
        order: 3,
        resourceUrl: null
      },
      {
        id: '4',
        title: 'Role-Play: Job Interview',
        description: 'Practice interview scenarios with students',
        type: 'discussion',
        duration: 15,
        order: 4,
        resourceUrl: null
      },
      {
        id: '5',
        title: 'Wrap-up Quiz',
        description: 'Quick review of key concepts from the lesson',
        type: 'quiz',
        duration: 5,
        order: 5,
        resourceUrl: null
      }
    ]

    // For other topics, we could fetch from database or define different activities
    // This is a simplified approach for the demo

    return NextResponse.json({
      id: classData.id,
      date: classData.date,
      time: classData.time,
      studentName: classData.studentName,
      topicName: classData.topicName,
      topicOrderIndex: classData.topicOrderIndex,
      activities
    })

  } catch (error: any) {
    console.error('Error fetching class info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch class info', details: error.message },
      { status: 500 }
    )
  }
}