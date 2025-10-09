import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting system initialization...');

    // Test basic database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    // Check if User table exists by trying a simple query
    try {
      await prisma.user.findFirst();
      console.log('✅ User table exists');
    } catch (tableError) {
      console.error('❌ User table does not exist or has issues:', tableError);
      return NextResponse.json({
        success: false,
        error: 'Database tables not set up',
        details: 'Please run database setup first. The User table does not exist.',
        action: 'setup_required'
      }, { status: 400 });
    }

    // Check if admin exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('✅ Admin already exists');
      return NextResponse.json({ 
        success: true, 
        message: 'System ready! Admin account already exists.',
        adminEmail: existingAdmin.email,
        action: 'ready'
      });
    }

    // Create admin with only required fields
    console.log('Creating admin account...');
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@mindset.com',
        password: adminPassword,
        name: 'Admin User',
        role: 'ADMIN'
      }
    });

    console.log('✅ Admin created successfully');

    return NextResponse.json({ 
      success: true, 
      message: 'System initialized! Admin account created successfully.',
      adminEmail: admin.email,
      defaultPassword: 'admin123',
      action: 'created'
    });

  } catch (error: any) {
    console.error('❌ System initialization failed:', error);
    
    return NextResponse.json({ 
      success: false,
      error: 'System initialization failed',
      details: error.message,
      code: error.code,
      action: 'failed'
    }, { status: 500 });
  }
}