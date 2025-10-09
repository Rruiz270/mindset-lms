import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

interface TimeSlot {
  teacherId: string;
  teacherName: string;
  dateTime: string;
  available: boolean;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const teacherId = searchParams.get('teacherId');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get teacher availability
    const where: any = {
      isActive: true,
    };

    if (teacherId) {
      where.teacherId = teacherId;
    }

    const availabilities = await prisma.availability.findMany({
      where,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Get existing bookings in the date range
    const bookingWhere: any = {
      scheduledAt: {
        gte: start,
        lte: end,
      },
      status: {
        in: ['SCHEDULED', 'COMPLETED'],
      },
    };

    if (teacherId) {
      bookingWhere.teacherId = teacherId;
    }

    const existingBookings = await prisma.booking.groupBy({
      by: ['teacherId', 'scheduledAt'],
      where: bookingWhere,
      _count: {
        id: true,
      },
    });

    // Create booking map for quick lookup
    const bookingMap = new Map<string, number>();
    existingBookings.forEach((booking) => {
      const key = `${booking.teacherId}-${booking.scheduledAt.toISOString()}`;
      bookingMap.set(key, booking._count.id);
    });

    // Generate time slots
    const slots: TimeSlot[] = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();

      availabilities
        .filter((avail) => avail.dayOfWeek === dayOfWeek)
        .forEach((availability) => {
          // Generate hourly slots within the availability window
          const [startHour, startMin] = availability.startTime.split(':').map(Number);
          const [endHour, endMin] = availability.endTime.split(':').map(Number);

          const slotStart = new Date(currentDate);
          slotStart.setHours(startHour, startMin, 0, 0);

          const slotEnd = new Date(currentDate);
          slotEnd.setHours(endHour, endMin, 0, 0);

          // Generate hourly slots
          while (slotStart < slotEnd) {
            const slotDateTime = new Date(slotStart);
            const key = `${availability.teacherId}-${slotDateTime.toISOString()}`;
            const bookingCount = bookingMap.get(key) || 0;

            // Only show slots that are at least 1 hour in the future
            const minBookingTime = new Date();
            minBookingTime.setHours(minBookingTime.getHours() + 1);

            if (slotDateTime >= minBookingTime) {
              slots.push({
                teacherId: availability.teacherId,
                teacherName: availability.teacher.name,
                dateTime: slotDateTime.toISOString(),
                available: bookingCount < 10, // Max 10 students per class
              });
            }

            slotStart.setHours(slotStart.getHours() + 1);
          }
        });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Sort slots by date and time
    slots.sort((a, b) => 
      new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );

    return NextResponse.json(slots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    );
  }
}