import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting database table creation...');

    // Create all tables using raw SQL
    console.log('Creating User table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'STUDENT',
        "level" TEXT,
        "studentId" TEXT UNIQUE,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log('Creating Package table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Package" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "totalLessons" INTEGER NOT NULL,
        "usedLessons" INTEGER NOT NULL DEFAULT 0,
        "remainingLessons" INTEGER NOT NULL,
        "validFrom" TIMESTAMP(3) NOT NULL,
        "validUntil" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Package_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `;

    console.log('Creating Topic table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Topic" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "level" TEXT NOT NULL,
        "orderIndex" INTEGER NOT NULL,
        "description" TEXT,
        "lessonPlan" TEXT,
        "objectives" JSONB,
        "materials" JSONB
      );
    `;

    console.log('Creating Booking table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Booking" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "studentId" TEXT NOT NULL,
        "teacherId" TEXT NOT NULL,
        "topicId" TEXT NOT NULL,
        "scheduledAt" TIMESTAMP(3) NOT NULL,
        "duration" INTEGER NOT NULL DEFAULT 60,
        "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
        "googleMeetLink" TEXT,
        "googleEventId" TEXT,
        "cancelledAt" TIMESTAMP(3),
        "attendedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Booking_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "Booking_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "Booking_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `;

    console.log('Creating AttendanceLog table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "AttendanceLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "bookingId" TEXT NOT NULL,
        "studentId" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "timestamp" TIMESTAMP(3) NOT NULL,
        "recordedBy" TEXT,
        "source" TEXT NOT NULL DEFAULT 'manual',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AttendanceLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "AttendanceLog_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `;

    console.log('Creating StudentStats table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "StudentStats" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "studentId" TEXT NOT NULL UNIQUE,
        "totalClasses" INTEGER NOT NULL DEFAULT 0,
        "attendedClasses" INTEGER NOT NULL DEFAULT 0,
        "attendanceRate" INTEGER NOT NULL DEFAULT 0,
        "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log('All tables created successfully!');

    return NextResponse.json({ 
      success: true, 
      message: 'Database tables created successfully! You can now create admin account.',
      tablesCreated: [
        'User (with studentId and isActive fields)',
        'Package (lesson packages)',
        'Topic (class topics)', 
        'Booking (class bookings)',
        'AttendanceLog (attendance tracking)',
        'StudentStats (attendance statistics)'
      ]
    });

  } catch (error: any) {
    console.error('Database setup error:', error);
    
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create database tables',
      details: error.message,
      code: error.code
    }, { status: 500 });
  }
}