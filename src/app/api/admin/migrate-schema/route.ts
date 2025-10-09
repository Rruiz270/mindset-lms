import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('Adding studentId and isActive columns to User table...');

    // Add the new columns to the User table
    await prisma.$executeRaw`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "studentId" TEXT,
      ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
    `;

    // Create unique constraint for studentId
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'User_studentId_key'
        ) THEN
          ALTER TABLE "User" ADD CONSTRAINT "User_studentId_key" UNIQUE ("studentId");
        END IF;
      END $$;
    `;

    console.log('Schema migration completed successfully!');

    return NextResponse.json({ 
      success: true, 
      message: 'Database schema updated successfully. Student ID system is now active!' 
    });

  } catch (error) {
    console.error('Error migrating schema:', error);
    return NextResponse.json({ 
      error: 'Failed to migrate schema',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}