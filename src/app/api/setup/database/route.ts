import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin (for security)
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    // Test database connection
    await prisma.$connect();
    
    // Push schema to database (creates all tables)
    const { execSync } = require('child_process');
    
    try {
      // This will create all tables based on our Prisma schema
      execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Database schema created successfully! All tables are now ready.',
        tables: [
          'User (for students, teachers, admins)',
          'Package (lesson packages)',
          'Topic (class topics)',
          'Booking (class bookings)', 
          'AttendanceLog (attendance tracking)',
          'StudentStats (attendance statistics)',
          'Exercise (class exercises)',
          'Slide (class materials)',
          'Progress (student progress)',
          'Availability (teacher schedules)'
        ]
      });
    } catch (error) {
      console.error('Prisma push error:', error);
      return NextResponse.json({ 
        error: 'Failed to create database schema', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json({ 
      error: 'Database connection failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to check database status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Test connection and check if tables exist
    await prisma.$connect();
    
    const tableChecks = await Promise.allSettled([
      prisma.user.count(),
      prisma.package.count(),
      prisma.topic.count(),
      prisma.booking.count(),
      prisma.attendanceLog.count(),
      prisma.studentStats.count()
    ]);

    const tablesExist = tableChecks.every(check => check.status === 'fulfilled');

    return NextResponse.json({
      connected: true,
      tablesExist,
      tableStatus: {
        users: tableChecks[0].status === 'fulfilled' ? 'exists' : 'missing',
        packages: tableChecks[1].status === 'fulfilled' ? 'exists' : 'missing',
        topics: tableChecks[2].status === 'fulfilled' ? 'exists' : 'missing',
        bookings: tableChecks[3].status === 'fulfilled' ? 'exists' : 'missing',
        attendanceLogs: tableChecks[4].status === 'fulfilled' ? 'exists' : 'missing',
        studentStats: tableChecks[5].status === 'fulfilled' ? 'exists' : 'missing'
      }
    });

  } catch (error) {
    return NextResponse.json({ 
      connected: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}