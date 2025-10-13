import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Emergency fix that works with the original schema (before remainingHours was added)
export async function GET(request: NextRequest) {
  try {
    console.log('🚨 Emergency demo account fix...');
    
    // Test database connection first
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (dbError: any) {
      console.error('❌ Database connection failed:', dbError.message);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: dbError.message
      }, { status: 500 });
    }
    
    // Demo accounts with ONLY original schema fields
    const demoAccounts = [
      {
        email: 'admin@mindset.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'ADMIN' as const,
        level: null,
        studentId: null,
        isActive: true
      },
      {
        email: 'teacher1@mindset.com', 
        password: 'teacher123',
        name: 'Teacher Demo',
        role: 'TEACHER' as const,
        level: null,
        studentId: null,
        isActive: true
      },
      {
        email: 'student1@mindset.com',
        password: 'student123', 
        name: 'Student Demo',
        role: 'STUDENT' as const,
        level: 'STARTER' as const,
        studentId: 'MST-2025-0001',
        isActive: true
      }
    ];

    const results = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (const account of demoAccounts) {
      try {
        console.log(`🔄 Processing ${account.email}...`);
        
        // Delete existing user if exists
        const existingUser = await prisma.user.findUnique({
          where: { email: account.email }
        });
        
        if (existingUser) {
          console.log(`🗑️ Deleting existing user ${account.email}...`);
          // Delete packages first
          await prisma.package.deleteMany({
            where: { userId: existingUser.id }
          });
          // Delete user
          await prisma.user.delete({
            where: { id: existingUser.id }
          });
        }
        
        // Create new user with ONLY original schema fields
        console.log(`🔐 Creating user ${account.email}...`);
        const hashedPassword = await bcrypt.hash(account.password, 12);
        
        const newUser = await prisma.user.create({
          data: {
            email: account.email,
            password: hashedPassword,
            name: account.name,
            role: account.role,
            level: account.level,
            studentId: account.studentId,
            isActive: account.isActive
            // REMOVED: phone, remainingHours, comments (these don't exist in current schema)
          }
        });
        
        console.log(`✅ Created ${account.email} (${newUser.role})`);
        
        results.push({
          email: account.email,
          status: 'created',
          role: newUser.role,
          id: newUser.id
        });
        
        // Create a sample package for student
        if (account.role === 'STUDENT') {
          console.log(`📦 Creating package for ${account.email}...`);
          await prisma.package.create({
            data: {
              userId: newUser.id,
              totalLessons: 100,
              usedLessons: 10,
              remainingLessons: 90,
              validFrom: new Date(),
              validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            }
          });
        }
        
        successCount++;
        
      } catch (error: any) {
        console.error(`❌ Error with ${account.email}:`, error);
        errorCount++;
        results.push({
          email: account.email,
          status: 'error',
          error: error.message
        });
      }
    }

    console.log(`🎉 Emergency fix completed! Success: ${successCount}, Errors: ${errorCount}`);

    return NextResponse.json({
      success: successCount > 0,
      message: `EMERGENCY FIX: ${successCount} accounts created, ${errorCount} errors`,
      results,
      summary: {
        total: demoAccounts.length,
        success: successCount,
        errors: errorCount
      },
      credentials: {
        admin: 'admin@mindset.com / admin123',
        teacher: 'teacher1@mindset.com / teacher123', 
        student: 'student1@mindset.com / student123'
      },
      note: '🚨 EMERGENCY FIX - LOGIN NOW!',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('💥 Emergency fix error:', error);
    return NextResponse.json({
      success: false,
      error: 'Emergency fix failed',
      details: error.message,
      note: 'Schema mismatch - check database columns'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}