import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: {
        id: params.id,
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

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check authorization
    if (
      session.user.role === 'STUDENT' && 
      booking.studentId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    } else if (
      session.user.role === 'TEACHER' && 
      booking.teacherId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check authorization
    if (
      session.user.role === 'STUDENT' && 
      booking.studentId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    } else if (
      session.user.role === 'TEACHER' && 
      booking.teacherId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Handle cancellation
    if (status === 'CANCELLED') {
      const now = new Date();
      const scheduledTime = new Date(booking.scheduledAt);
      const hoursUntilClass = (scheduledTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Check 6-hour cancellation policy
      if (hoursUntilClass < 6 && session.user.role === 'STUDENT') {
        return NextResponse.json(
          { error: 'Cancellations must be made at least 6 hours in advance' },
          { status: 400 }
        );
      }

      // Refund credit if cancelled in time
      if (hoursUntilClass >= 6 && session.user.role === 'STUDENT') {
        await prisma.package.updateMany({
          where: {
            userId: booking.studentId,
            validUntil: {
              gte: new Date(),
            },
          },
          data: {
            usedLessons: {
              decrement: 1,
            },
            remainingLessons: {
              increment: 1,
            },
          },
        });
      }
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status,
        cancelledAt: status === 'CANCELLED' ? new Date() : undefined,
        attendedAt: status === 'COMPLETED' ? new Date() : undefined,
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

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.booking.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}