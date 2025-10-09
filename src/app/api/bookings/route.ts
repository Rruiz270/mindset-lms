import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const createBookingSchema = z.object({
  teacherId: z.string(),
  topicId: z.string(),
  scheduledAt: z.string().datetime(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming') === 'true';

    const where: any = {};

    // Filter by role
    if (session.user.role === 'STUDENT') {
      where.studentId = session.user.id;
    } else if (session.user.role === 'TEACHER') {
      where.teacherId = session.user.id;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter upcoming bookings
    if (upcoming) {
      where.scheduledAt = {
        gte: new Date(),
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            level: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        topic: true,
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createBookingSchema.parse(body);

    // Check if student has available credits
    const studentPackage = await prisma.package.findFirst({
      where: {
        userId: session.user.id,
        validUntil: {
          gte: new Date(),
        },
        remainingLessons: {
          gt: 0,
        },
      },
      orderBy: {
        validUntil: 'asc',
      },
    });

    if (!studentPackage) {
      return NextResponse.json(
        { error: 'No available credits or valid package' },
        { status: 400 }
      );
    }

    // Check if the slot is available (max 10 students per class)
    const existingBookings = await prisma.booking.count({
      where: {
        teacherId: validatedData.teacherId,
        scheduledAt: new Date(validatedData.scheduledAt),
        status: {
          in: ['SCHEDULED', 'COMPLETED'],
        },
      },
    });

    if (existingBookings >= 10) {
      return NextResponse.json(
        { error: 'This class is full' },
        { status: 400 }
      );
    }

    // Check if booking is at least 1 hour in advance
    const scheduledTime = new Date(validatedData.scheduledAt);
    const minBookingTime = new Date();
    minBookingTime.setHours(minBookingTime.getHours() + 1);

    if (scheduledTime < minBookingTime) {
      return NextResponse.json(
        { error: 'Bookings must be made at least 1 hour in advance' },
        { status: 400 }
      );
    }

    // Check teacher availability
    const dayOfWeek = scheduledTime.getDay();
    const hours = scheduledTime.getHours().toString().padStart(2, '0');
    const minutes = scheduledTime.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    const availability = await prisma.availability.findFirst({
      where: {
        teacherId: validatedData.teacherId,
        dayOfWeek,
        isActive: true,
        startTime: {
          lte: timeString,
        },
        endTime: {
          gt: timeString,
        },
      },
    });

    if (!availability) {
      return NextResponse.json(
        { error: 'Teacher is not available at this time' },
        { status: 400 }
      );
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        studentId: session.user.id,
        teacherId: validatedData.teacherId,
        topicId: validatedData.topicId,
        scheduledAt: scheduledTime,
        status: 'SCHEDULED',
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            level: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        topic: true,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}