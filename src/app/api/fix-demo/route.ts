import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Simple endpoint to fix demo accounts - no auth required for emergency fixes
export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Starting demo account fix...');
    
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
    
    // Demo accounts to create/fix
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
        
        // Check if user exists first
        const existingUser = await prisma.user.findUnique({
          where: { email: account.email }
        });
        
        if (existingUser) {
          console.log(`👤 User ${account.email} already exists, deleting...`);
          // Delete packages first due to foreign key constraint
          await prisma.package.deleteMany({
            where: { userId: existingUser.id }
          });
          // Delete user
          await prisma.user.delete({
            where: { id: existingUser.id }
          });
          console.log(`🗑️ Deleted existing user ${account.email}`);
        }
        
        // Create new user with hashed password
        console.log(`🔐 Hashing password for ${account.email}...`);
        const hashedPassword = await bcrypt.hash(account.password, 12);
        
        console.log(`👤 Creating user ${account.email}...`);
        const newUser = await prisma.user.create({
          data: {
            email: account.email,
            password: hashedPassword,
            name: account.name,
            role: account.role,
            level: account.level,
            studentId: account.studentId,
            isActive: account.isActive,
            phone: null,
            remainingHours: account.role === 'STUDENT' ? 100 : null,
            comments: account.role === 'STUDENT' ? 'Demo student account' : null
          }
        });
        
        console.log(`✅ Created ${account.email} (${newUser.role}) with ID: ${newUser.id}`);
        
        results.push({
          email: account.email,
          status: 'created',
          role: newUser.role,
          id: newUser.id,
          hashedPassword: hashedPassword.substring(0, 10) + '...' // Show partial hash for verification
        });
        
        // Create a sample package for student
        if (account.role === 'STUDENT') {
          console.log(`📦 Creating package for ${account.email}...`);
          const packageData = await prisma.package.create({
            data: {
              userId: newUser.id,
              totalLessons: 100,
              usedLessons: 10,
              remainingLessons: 90,
              validFrom: new Date(),
              validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
            }
          });
          console.log(`✅ Created package for ${account.email} with ID: ${packageData.id}`);
        }
        
        successCount++;
        
      } catch (error: any) {
        console.error(`❌ Error with ${account.email}:`, error);
        errorCount++;
        results.push({
          email: account.email,
          status: 'error',
          error: error.message,
          stack: error.stack?.substring(0, 200) + '...'
        });
      }
    }

    console.log(`🎉 Demo account fix completed! Success: ${successCount}, Errors: ${errorCount}`);

    await prisma.$disconnect();

    return NextResponse.json({
      success: successCount > 0,
      message: `Demo accounts fixed! ${successCount} created, ${errorCount} errors`,
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
      note: 'You can now login with these credentials',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('💥 Fix demo accounts error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fix demo accounts',
      details: error.message,
      stack: error.stack?.substring(0, 300) + '...',
      note: 'Please check the server logs for more details',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Also support POST for completeness
export async function POST(request: NextRequest) {
  return GET(request);
}