import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, studentId, action, timestamp } = await request.json();

    // Record attendance event
    const attendanceRecord = await prisma.attendanceLog.create({
      data: {
        bookingId,
        studentId,
        action, // 'joined', 'left', 'rejoined'
        timestamp: new Date(timestamp),
        recordedBy: session.user.id
      }
    });

    // Update booking attendance status if student joined
    if (action === 'joined') {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          attendedAt: new Date()
        }
      });

      // Update student's overall attendance stats
      await updateStudentAttendanceStats(studentId);
    }

    return NextResponse.json({ 
      success: true, 
      attendanceId: attendanceRecord.id 
    });

  } catch (error) {
    console.error('Error recording attendance:', error);
    return NextResponse.json({ error: 'Failed to record attendance' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const studentId = searchParams.get('studentId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let whereClause: any = {};

    if (bookingId) {
      whereClause.bookingId = bookingId;
    }

    if (studentId) {
      whereClause.studentId = studentId;
    }

    if (startDate && endDate) {
      whereClause.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const attendanceRecords = await prisma.attendanceLog.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            level: true
          }
        },
        booking: {
          select: {
            id: true,
            scheduledAt: true,
            topic: {
              select: {
                name: true
              }
            },
            teacher: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    return NextResponse.json(attendanceRecords);

  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

async function updateStudentAttendanceStats(studentId: string) {
  try {
    // Calculate attendance rate for the student
    const totalBookings = await prisma.booking.count({
      where: {
        studentId,
        status: 'COMPLETED'
      }
    });

    const attendedBookings = await prisma.booking.count({
      where: {
        studentId,
        status: 'COMPLETED',
        attendedAt: {
          not: null
        }
      }
    });

    const attendanceRate = totalBookings > 0 ? (attendedBookings / totalBookings) * 100 : 0;

    // Update or create student attendance statistics
    await prisma.studentStats.upsert({
      where: { studentId },
      update: {
        totalClasses: totalBookings,
        attendedClasses: attendedBookings,
        attendanceRate: Math.round(attendanceRate)
      },
      create: {
        studentId,
        totalClasses: totalBookings,
        attendedClasses: attendedBookings,
        attendanceRate: Math.round(attendanceRate)
      }
    });

  } catch (error) {
    console.error('Error updating attendance stats:', error);
  }
}