import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    console.log('🔧 Quick Admin Setup Starting...');

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { 
        email: 'admin@mindset.com' 
      }
    });

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Admin account already exists!',
        email: 'admin@mindset.com',
        password: 'admin123',
        note: 'You can login now'
      });
    }

    // Create admin account
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@mindset.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
        isActive: true
      }
    });

    console.log('✅ Admin created:', admin.email);

    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully!',
      email: 'admin@mindset.com',
      password: 'admin123',
      adminId: admin.id
    });

  } catch (error: any) {
    console.error('❌ Quick setup failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create admin account',
      details: error.message,
      suggestion: 'Database might need initialization'
    }, { status: 500 });
  }
}

export async function POST() {
  return GET(); // Same logic for both GET and POST
}