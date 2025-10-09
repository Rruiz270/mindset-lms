import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting bootstrap process...');

    // First, check if we can connect to the database
    await prisma.$connect();
    console.log('Database connection successful');

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      return NextResponse.json({ 
        success: true, 
        message: 'Admin account already exists',
        adminEmail: existingAdmin.email,
        action: 'existing'
      });
    }

    // Create admin with basic schema (no new fields)
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    console.log('Creating admin user...');
    const admin = await prisma.user.create({
      data: {
        email: 'admin@mindset.com',
        password: adminPassword,
        name: 'Admin User',
        role: 'ADMIN'
        // Intentionally not including isActive or studentId
      }
    });

    console.log('Admin created successfully:', admin.email);

    return NextResponse.json({ 
      success: true, 
      message: 'Admin account created successfully! You can now login.',
      adminEmail: admin.email,
      defaultPassword: 'admin123',
      action: 'created'
    });

  } catch (error: any) {
    console.error('Bootstrap error:', error);
    
    // Return detailed error for debugging
    return NextResponse.json({ 
      success: false,
      error: 'Failed to bootstrap system',
      details: error.message,
      code: error.code
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}