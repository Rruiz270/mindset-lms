import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get teacher's classes with student and topic information
    const classes = await prisma.$queryRaw`
      SELECT 
        b.id,
        b.date,
        b.time,
        b.status,
        b."topicId",
        s.id as "studentId",
        s.name as "studentName",
        s.email as "studentEmail",
        t.id as "topic.id",
        t.name as "topic.name",
        t.level as "topic.level",
        t."orderIndex" as "topic.orderIndex",
        t.description as "topic.description"
      FROM "Booking" b
      JOIN "User" s ON b."studentId" = s.id
      JOIN "Topic" t ON b."topicId" = t.id
      WHERE b."teacherId" = ${session.user.id}
      AND b.status IN ('confirmed', 'completed')
      ORDER BY b.date DESC, b.time ASC
    ` as any[]

    // Transform the flat result into nested structure
    const formattedClasses = classes.map(row => ({
      id: row.id,
      date: row.date,
      time: row.time,
      status: row.status,
      studentId: row.studentId,
      studentName: row.studentName,
      studentEmail: row.studentEmail,
      topic: {
        id: row['topic.id'],
        name: row['topic.name'],
        level: row['topic.level'],
        orderIndex: row['topic.orderIndex'],
        description: row['topic.description']
      }
    }))

    return NextResponse.json(formattedClasses)

  } catch (error: any) {
    console.error('Error fetching teacher classes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch classes', details: error.message },
      { status: 500 }
    )
  }
}