import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get student's bookings and their topics
    const bookings = await prisma.$queryRaw`
      SELECT 
        b.id,
        b.date,
        b.time,
        b.status,
        b."topicId",
        t.name as "topicName",
        t."orderIndex",
        u.name as "teacherName"
      FROM "Booking" b
      JOIN "Topic" t ON b."topicId" = t.id
      JOIN "User" u ON b."teacherId" = u.id
      WHERE b."studentId" = ${session.user.id}
      AND b.status IN ('confirmed', 'completed')
      ORDER BY b.date, b.time
    `

    return NextResponse.json(bookings)

  } catch (error: any) {
    console.error('Error fetching upcoming lessons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lessons', details: error.message },
      { status: 500 }
    )
  }
}