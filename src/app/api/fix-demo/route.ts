import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Simple endpoint to fix demo accounts - no auth required for emergency fixes
export async function GET(request: NextRequest) {
  try {
    console.log('Starting demo account fix...');
    
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
    
    for (const account of demoAccounts) {
      try {
        console.log(`Processing ${account.email}...`);
        
        // Delete existing user if exists
        await prisma.user.deleteMany({
          where: { email: account.email }
        });
        
        // Create new user with hashed password
        const hashedPassword = await bcrypt.hash(account.password, 12);
        
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
        
        console.log(`✅ Created ${account.email} (${newUser.role})`);
        
        results.push({
          email: account.email,
          status: 'created',
          role: newUser.role,
          id: newUser.id
        });
        
        // Create a sample package for student
        if (account.role === 'STUDENT') {
          await prisma.package.create({
            data: {
              userId: newUser.id,
              totalLessons: 100,
              usedLessons: 10,
              remainingLessons: 90,
              validFrom: new Date(),
              validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
            }
          });
          console.log(`✅ Created package for ${account.email}`);
        }
        
      } catch (error: any) {
        console.error(`❌ Error with ${account.email}:`, error.message);
        results.push({
          email: account.email,
          status: 'error',
          error: error.message
        });
      }
    }

    console.log('Demo account fix completed');

    return NextResponse.json({
      success: true,
      message: 'Demo accounts have been fixed!',
      results,
      credentials: {
        admin: 'admin@mindset.com / admin123',
        teacher: 'teacher1@mindset.com / teacher123', 
        student: 'student1@mindset.com / student123'
      },
      note: 'You can now login with these credentials'
    });

  } catch (error: any) {
    console.error('Fix demo accounts error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fix demo accounts',
      details: error.message,
      note: 'Please check the server logs for more details'
    }, { status: 500 });
  }
}

// Also support POST for completeness
export async function POST(request: NextRequest) {
  return GET(request);
}