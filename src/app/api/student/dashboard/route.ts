import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTopicForDate, getUpcomingTopics } from '@/data/topics';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get student user data
    const student = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        level: true,
        studentId: true,
        isActive: true,
        createdAt: true
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get student's active package
    const packageInfo = await prisma.package.findFirst({
      where: {
        userId: session.user.id,
        validUntil: { gte: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get upcoming bookings
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        studentId: session.user.id,
        scheduledAt: { gte: new Date() },
        status: 'SCHEDULED'
      },
      include: {
        teacher: {
          select: { id: true, name: true, email: true }
        },
        topic: {
          select: { id: true, name: true, level: true }
        }
      },
      orderBy: { scheduledAt: 'asc' },
      take: 5
    });

    // Get student stats
    const studentStats = await prisma.studentStats.findUnique({
      where: { studentId: session.user.id }
    });

    // Calculate current and upcoming topics based on student level
    const today = new Date();
    const currentTopic = student.level ? getTopicForDate(today, student.level as any) : null;
    const upcomingTopicsData = student.level ? getUpcomingTopics(student.level as any, 7) : [];

    // Get recent progress
    const recentProgress = await prisma.progress.findMany({
      where: { userId: session.user.id },
      include: {
        topic: {
          select: { id: true, name: true, level: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 5
    });

    // Calculate course start date (can be from package or student creation)
    const courseStartDate = packageInfo?.validFrom || student.createdAt;
    
    // Calculate contract end date
    const contractEndDate = packageInfo?.validUntil;

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        level: student.level,
        studentId: student.studentId,
        isActive: student.isActive,
        courseStartDate: courseStartDate?.toISOString(),
        contractEndDate: contractEndDate?.toISOString(),
      },
      package: packageInfo ? {
        totalLessons: packageInfo.totalLessons,
        usedLessons: packageInfo.usedLessons,
        remainingLessons: packageInfo.remainingLessons,
        validFrom: packageInfo.validFrom.toISOString(),
        validUntil: packageInfo.validUntil.toISOString()
      } : null,
      currentTopic,
      upcomingTopics: upcomingTopicsData,
      upcomingBookings: upcomingBookings.map(booking => ({
        id: booking.id,
        scheduledAt: booking.scheduledAt.toISOString(),
        teacher: booking.teacher,
        topic: booking.topic,
        googleMeetLink: booking.googleMeetLink,
        status: booking.status
      })),
      stats: studentStats ? {
        totalClasses: studentStats.totalClasses,
        attendedClasses: studentStats.attendedClasses,
        attendanceRate: studentStats.attendanceRate,
        lastUpdated: studentStats.lastUpdated.toISOString()
      } : {
        totalClasses: 0,
        attendedClasses: 0,
        attendanceRate: 0,
        lastUpdated: new Date().toISOString()
      },
      recentProgress: recentProgress.map(progress => ({
        id: progress.id,
        topic: progress.topic,
        preClassComplete: progress.preClassComplete,
        liveClassAttended: progress.liveClassAttended,
        afterClassComplete: progress.afterClassComplete,
        completedAt: progress.completedAt?.toISOString(),
        updatedAt: progress.updatedAt.toISOString()
      }))
    });

  } catch (error: any) {
    console.error('Error fetching student dashboard data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch dashboard data',
      details: error.message
    }, { status: 500 });
  }
}