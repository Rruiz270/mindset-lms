import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTopicForDate } from '@/data/topics';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Get today's bookings for this teacher
    const todayBookings = await prisma.booking.findMany({
      where: {
        teacherId: session.user.id,
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            level: true,
            studentId: true
          }
        },
        topic: {
          select: {
            id: true,
            name: true,
            level: true,
            description: true
          }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    });

    // Get all students this teacher has taught or will teach
    const allStudents = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        studentBookings: {
          some: {
            teacherId: session.user.id
          }
        }
      },
      include: {
        studentStats: true,
        packages: {
          where: {
            validUntil: { gte: new Date() }
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    // Get teacher's upcoming bookings (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        teacherId: session.user.id,
        scheduledAt: {
          gt: endOfDay,
          lte: nextWeek
        },
        status: 'SCHEDULED'
      },
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
            id: true,
            name: true,
            level: true
          }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    });

    // Get teacher's stats for the month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthlyBookings = await prisma.booking.findMany({
      where: {
        teacherId: session.user.id,
        scheduledAt: {
          gte: startOfMonth,
          lte: endOfMonth
        },
        status: 'COMPLETED'
      },
      include: {
        student: true
      }
    });

    // Format today's classes with course type determination
    const formattedTodayClasses = todayBookings.map(booking => {
      const student = booking.student;
      const topic = booking.topic;
      
      // Determine course type based on level and topic
      let courseType = 'Smart Learning';
      if (student.level === 'EXPLORER' || student.level === 'EXPERT') {
        courseType = 'Smart Conversation';
      }

      return {
        id: booking.id,
        time: booking.scheduledAt.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        courseType,
        topic: topic?.name || 'No Topic Assigned',
        students: [{
          id: student.id,
          name: student.name,
          email: student.email,
          level: student.level || 'Not Set',
          attendanceRate: 95, // Default for now
          lastClass: booking.scheduledAt.toISOString().split('T')[0],
          totalClasses: 1
        }],
        maxStudents: courseType === 'Private Lessons' ? 1 : (courseType === 'Smart Conversation' ? 6 : 8),
        googleMeetLink: booking.googleMeetLink,
        status: booking.status.toLowerCase(),
        materialId: topic?.id || 'default'
      };
    });

    // Format students data
    const formattedStudents = allStudents.map(student => ({
      id: student.id,
      name: student.name,
      email: student.email,
      level: student.level || 'Not Set',
      attendanceRate: student.studentStats?.attendanceRate || 0,
      lastClass: student.studentStats?.lastUpdated.toISOString().split('T')[0] || today.toISOString().split('T')[0],
      totalClasses: student.studentStats?.totalClasses || 0
    }));

    // Calculate stats
    const stats = {
      todayClasses: todayBookings.length,
      nextClasses: upcomingBookings.length,
      totalStudents: allStudents.length,
      monthlyStats: {
        classesCompleted: monthlyBookings.length,
        studentsAttended: new Set(monthlyBookings.map(b => b.student.id)).size,
        averageRating: 4.8, // Mock data for now
        earnings: monthlyBookings.length * 25, // $25 per class
        attendanceRate: monthlyBookings.length > 0 ? 94 : 0,
        totalHours: monthlyBookings.length * 1 // 1 hour per class
      },
      recentReviews: [] // Mock empty for now
    };

    return NextResponse.json({
      success: true,
      todayClasses: formattedTodayClasses,
      students: formattedStudents,
      stats,
      upcomingBookings: upcomingBookings.map(booking => ({
        id: booking.id,
        scheduledAt: booking.scheduledAt.toISOString(),
        student: booking.student,
        topic: booking.topic,
        googleMeetLink: booking.googleMeetLink,
        status: booking.status
      }))
    });

  } catch (error: any) {
    console.error('Error fetching teacher dashboard data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch teacher dashboard data',
      details: error.message
    }, { status: 500 });
  }
}