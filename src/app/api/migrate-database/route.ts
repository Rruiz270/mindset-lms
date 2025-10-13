import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔧 Migrating database schema...');

    // Add studentId and isActive columns if they don't exist
    await prisma.$executeRaw`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "studentId" TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
    `;

    console.log('✅ Database schema updated');

    // Count users
    const userCount = await prisma.user.count();
    const studentsCount = await prisma.user.count({ where: { role: 'STUDENT' } });

    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully!',
      userCount,
      studentsCount,
      note: 'studentId and isActive columns added to User table'
    });

  } catch (error: any) {
    console.error('❌ Migration failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Migration failed',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST() {
  return GET(); // Same logic for both
}