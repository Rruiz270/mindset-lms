import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      return NextResponse.json({ 
        success: true, 
        message: 'Admin account already exists',
        adminEmail: existingAdmin.email
      });
    }

    // Create admin account
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    // Try to create admin with new schema fields, fallback if schema not updated
    let admin;
    try {
      admin = await prisma.user.create({
        data: {
          email: 'admin@mindset.com',
          password: adminPassword,
          name: 'Admin User',
          role: 'ADMIN',
          isActive: true
        }
      });
    } catch (schemaError: any) {
      // If error is about missing column, try without isActive
      if (schemaError.message?.includes('column') || schemaError.message?.includes('isActive')) {
        admin = await prisma.user.create({
          data: {
            email: 'admin@mindset.com',
            password: adminPassword,
            name: 'Admin User',
            role: 'ADMIN'
          }
        });
      } else {
        throw schemaError;
      }
    }

    console.log('Created admin account:', admin.email);

    return NextResponse.json({ 
      success: true, 
      message: 'Admin account created successfully!',
      adminEmail: admin.email,
      defaultPassword: 'admin123'
    });

  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json({ 
      error: 'Failed to create admin account',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}