import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get live attendance for a specific class/booking
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    // Get booking details with expected students
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            level: true
          }
        },
        topic: {
          select: {
            name: true
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Get live attendance status for this class
    const attendanceRecords = await prisma.attendanceLog.findMany({
      where: {
        bookingId,
        timestamp: {
          gte: new Date(new Date(booking.scheduledAt).getTime() - 30 * 60 * 1000), // 30 minutes before
          lte: new Date(new Date(booking.scheduledAt).getTime() + 90 * 60 * 1000)  // 90 minutes after
        }
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            level: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    // Determine current attendance status for each student
    const studentAttendance = new Map();
    
    // Process attendance records chronologically
    attendanceRecords.reverse().forEach(record => {
      const studentId = record.studentId;
      if (!studentAttendance.has(studentId)) {
        studentAttendance.set(studentId, {
          student: record.student,
          status: 'absent',
          joinedAt: null,
          leftAt: null,
          duration: 0,
          events: []
        });
      }
      
      const attendance = studentAttendance.get(studentId);
      attendance.events.push({
        action: record.action,
        timestamp: record.timestamp
      });

      if (record.action === 'joined') {
        attendance.status = 'present';
        attendance.joinedAt = record.timestamp;
      } else if (record.action === 'left') {
        attendance.status = 'left';
        attendance.leftAt = record.timestamp;
        
        // Calculate duration if both join and leave times exist
        if (attendance.joinedAt) {
          const duration = new Date(record.timestamp).getTime() - new Date(attendance.joinedAt).getTime();
          attendance.duration += Math.max(0, duration / (1000 * 60)); // minutes
        }
      } else if (record.action === 'rejoined') {
        attendance.status = 'present';
        attendance.joinedAt = record.timestamp;
      }
    });

    // For group classes, get all expected students
    let expectedStudents = [];
    if (booking.student) {
      // Individual booking
      expectedStudents = [booking.student];
    } else {
      // Group class - get all students booked for this time slot
      const groupBookings = await prisma.booking.findMany({
        where: {
          scheduledAt: booking.scheduledAt,
          topicId: booking.topicId,
          teacherId: booking.teacherId
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              level: true
            }
          }
        }
      });
      expectedStudents = groupBookings.map(b => b.student);
    }

    // Combine expected students with their attendance status
    const attendanceStatus = expectedStudents.map(student => {
      const attendance = studentAttendance.get(student.id);
      return {
        student,
        status: attendance?.status || 'absent',
        joinedAt: attendance?.joinedAt || null,
        leftAt: attendance?.leftAt || null,
        duration: Math.round(attendance?.duration || 0),
        events: attendance?.events || []
      };
    });

    return NextResponse.json({
      booking: {
        id: booking.id,
        scheduledAt: booking.scheduledAt,
        topic: booking.topic?.name,
        status: booking.status
      },
      attendance: attendanceStatus,
      summary: {
        totalExpected: expectedStudents.length,
        present: attendanceStatus.filter(a => a.status === 'present').length,
        absent: attendanceStatus.filter(a => a.status === 'absent').length,
        left: attendanceStatus.filter(a => a.status === 'left').length
      }
    });

  } catch (error) {
    console.error('Error fetching live attendance:', error);
    return NextResponse.json({ error: 'Failed to fetch live attendance' }, { status: 500 });
  }
}

// Update live attendance (for Google Meet webhook or manual marking)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, studentId, action, timestamp, source } = await request.json();

    // Validate action
    if (!['joined', 'left', 'rejoined', 'marked_present', 'marked_absent'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Record the attendance event
    const attendanceRecord = await prisma.attendanceLog.create({
      data: {
        bookingId,
        studentId,
        action,
        timestamp: new Date(timestamp || new Date()),
        recordedBy: session.user.id,
        source: source || 'manual' // 'google_meet', 'manual', 'webhook'
      }
    });

    // Update booking attendance if student joined
    if (['joined', 'rejoined', 'marked_present'].includes(action)) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          attendedAt: new Date()
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      attendanceId: attendanceRecord.id,
      timestamp: attendanceRecord.timestamp
    });

  } catch (error) {
    console.error('Error updating live attendance:', error);
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 });
  }
}