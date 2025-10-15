import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { studentId, teacherId } = await req.json()

    // Get all topics for starter level
    const topics = await prisma.$queryRaw`
      SELECT id, name, "orderIndex" 
      FROM "Topic" 
      WHERE level = 'STARTER'::"Level"
      ORDER BY "orderIndex"
      LIMIT 10
    ` as any[]

    const bookings = []
    const today = new Date()
    
    // Create bookings for the next 10 topics
    for (let i = 0; i < topics.length && i < 10; i++) {
      const topic = topics[i]
      const bookingDate = new Date(today)
      
      // Schedule classes every 2-3 days
      bookingDate.setDate(bookingDate.getDate() + (i * 3) - 5) // Start 5 days ago to have some past classes
      
      // Skip weekends
      const dayOfWeek = bookingDate.getDay()
      if (dayOfWeek === 0) bookingDate.setDate(bookingDate.getDate() + 1) // Sunday to Monday
      if (dayOfWeek === 6) bookingDate.setDate(bookingDate.getDate() + 2) // Saturday to Monday
      
      const booking = await prisma.$queryRaw`
        INSERT INTO "Booking" (
          id, "studentId", "teacherId", "topicId", date, time, 
          status, "googleMeetLink", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid()::text,
          ${studentId},
          ${teacherId},
          ${topic.id},
          ${bookingDate.toISOString().split('T')[0]},
          '10:00',
          ${bookingDate < today ? 'completed' : 'confirmed'}::"BookingStatus",
          ${'https://meet.google.com/demo-' + Math.random().toString(36).substr(2, 9)},
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        ) RETURNING id, date, status
      `
      
      bookings.push({
        topicId: topic.id,
        topicName: topic.name,
        date: bookingDate.toISOString().split('T')[0],
        status: bookingDate < today ? 'completed' : 'confirmed'
      })
    }

    return NextResponse.json({
      success: true,
      bookingsCreated: bookings.length,
      bookings
    })

  } catch (error: any) {
    console.error('Error creating demo bookings:', error)
    return NextResponse.json(
      { error: 'Failed to create bookings', details: error.message },
      { status: 500 }
    )
  }
}