import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const classes = await prisma.booking.findMany({
      where: {
        teacherId: session.user.id,
        status: { in: ['SCHEDULED', 'COMPLETED'] },
      },
      include: {
        student: {
          select: { id: true, name: true, email: true, level: true },
        },
        topic: {
          select: { id: true, name: true, level: true, orderIndex: true, description: true },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    })

    const formattedClasses = classes.map(booking => ({
      id: booking.id,
      scheduledAt: booking.scheduledAt.toISOString(),
      status: booking.status,
      googleMeetLink: booking.googleMeetLink,
      duration: booking.duration,
      attendedAt: booking.attendedAt?.toISOString() || null,
      student: booking.student,
      topic: booking.topic,
    }))

    return NextResponse.json(formattedClasses)

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error fetching teacher classes:', message)
    return NextResponse.json(
      { error: 'Failed to fetch classes', details: message },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookingId, action } = await req.json()

    if (!bookingId || !action) {
      return NextResponse.json({ error: 'bookingId and action required' }, { status: 400 })
    }

    if (action === 'complete') {
      const booking = await prisma.booking.update({
        where: { id: bookingId, teacherId: session.user.id },
        data: {
          status: 'COMPLETED',
          attendedAt: new Date(),
        },
      })

      // Update student progress for this topic
      await prisma.progress.upsert({
        where: {
          userId_topicId: {
            userId: booking.studentId,
            topicId: booking.topicId,
          },
        },
        update: { liveClassAttended: true },
        create: {
          userId: booking.studentId,
          topicId: booking.topicId,
          liveClassAttended: true,
        },
      })

      // Deduct a lesson credit from the student's package
      const pkg = await prisma.package.findFirst({
        where: {
          userId: booking.studentId,
          remainingLessons: { gt: 0 },
          validUntil: { gte: new Date() },
        },
        orderBy: { validUntil: 'asc' },
      })

      if (pkg) {
        await prisma.package.update({
          where: { id: pkg.id },
          data: {
            usedLessons: { increment: 1 },
            remainingLessons: { decrement: 1 },
          },
        })
      }

      return NextResponse.json({ success: true, booking })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error updating class:', message)
    return NextResponse.json(
      { error: 'Failed to update class', details: message },
      { status: 500 }
    )
  }
}
