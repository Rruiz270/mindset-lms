import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    console.log('🔄 RESTORING MINDSET LMS TO WORKING STATE...');

    // 1. Ensure admin account exists
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    // Try to create admin, ignore if already exists
    try {
      const admin = await prisma.user.upsert({
        where: { email: 'admin@mindset.com' },
        update: {}, // Don't update if exists
        create: {
          email: 'admin@mindset.com',
          password: adminPassword,
          name: 'Admin User',
          role: 'ADMIN',
          isActive: true
        }
      });
      console.log('✅ Admin account ready:', admin.email);
    } catch (adminError) {
      console.log('Admin might already exist, continuing...');
    }

    // 2. Test database connection
    const userCount = await prisma.user.count();
    console.log(`✅ Database connected. Found ${userCount} users.`);

    return NextResponse.json({
      success: true,
      message: 'Mindset LMS restored successfully!',
      credentials: {
        email: 'admin@mindset.com',
        password: 'admin123'
      },
      userCount,
      next_steps: [
        'Login with admin@mindset.com / admin123',
        'Go to Registration Center',
        'Register students with real data',
        'Students will get unique IDs like MST-2025-0001'
      ]
    });

  } catch (error: any) {
    console.error('❌ Restore failed:', error);
    return NextResponse.json({
      success: false,
      error: 'System restore failed',
      details: error.message,
      suggestion: 'The database tables might need to be recreated'
    }, { status: 500 });
  }
}