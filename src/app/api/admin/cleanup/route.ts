import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting database cleanup...');

    // Delete in order to respect foreign key constraints
    await prisma.progress.deleteMany({});
    await prisma.submission.deleteMany({});
    await prisma.attendanceLog.deleteMany({});
    await prisma.studentStats.deleteMany({});
    await prisma.booking.deleteMany({});
    await prisma.availability.deleteMany({});
    await prisma.package.deleteMany({});
    
    // Delete users (students and teachers) but keep admin
    await prisma.user.deleteMany({
      where: {
        role: {
          in: ['STUDENT', 'TEACHER']
        }
      }
    });

    // Optionally keep topics for the curriculum, or delete them too
    // await prisma.topic.deleteMany({});
    
    console.log('Database cleanup completed successfully!');

    return NextResponse.json({ 
      success: true, 
      message: 'All dummy data cleaned up successfully. Database is ready for real data.' 
    });

  } catch (error) {
    console.error('Error cleaning up database:', error);
    return NextResponse.json({ 
      error: 'Failed to cleanup database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}