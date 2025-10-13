import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Demo accounts to create
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
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: account.email }
        });

        if (existingUser) {
          // Update existing user with new schema
          const hashedPassword = await bcrypt.hash(account.password, 12);
          
          const updatedUser = await prisma.user.update({
            where: { email: account.email },
            data: {
              password: hashedPassword,
              name: account.name,
              role: account.role,
              level: account.level,
              studentId: account.studentId,
              isActive: account.isActive,
              phone: null,
              remainingHours: account.role === 'STUDENT' ? 100 : null,
              comments: null
            }
          });
          
          results.push({
            email: account.email,
            status: 'updated',
            role: updatedUser.role
          });
        } else {
          // Create new user
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
              comments: null
            }
          });
          
          results.push({
            email: account.email,
            status: 'created',
            role: newUser.role
          });
        }
        
        // Create a sample package for student
        if (account.role === 'STUDENT') {
          const user = await prisma.user.findUnique({
            where: { email: account.email }
          });
          
          if (user) {
            // Check if package already exists
            const existingPackage = await prisma.package.findFirst({
              where: { userId: user.id }
            });
            
            if (!existingPackage) {
              await prisma.package.create({
                data: {
                  userId: user.id,
                  totalLessons: 100,
                  usedLessons: 0,
                  remainingLessons: 100,
                  validFrom: new Date(),
                  validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
                }
              });
            }
          }
        }
        
      } catch (error: any) {
        console.error(`Error setting up ${account.email}:`, error);
        results.push({
          email: account.email,
          status: 'error',
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Demo accounts setup completed',
      results,
      credentials: {
        admin: 'admin@mindset.com / admin123',
        teacher: 'teacher1@mindset.com / teacher123', 
        student: 'student1@mindset.com / student123'
      }
    });

  } catch (error: any) {
    console.error('Setup demo accounts error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to setup demo accounts',
      details: error.message
    }, { status: 500 });
  }
}