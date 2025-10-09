import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log('🚨 EMERGENCY SETUP STARTING...');

    // Step 1: Create basic User table if it doesn't exist
    console.log('Creating User table...');
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL PRIMARY KEY DEFAULT ('user_' || substr(md5(random()::text), 1, 8)),
          "email" TEXT NOT NULL UNIQUE,
          "password" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "role" TEXT NOT NULL DEFAULT 'STUDENT',
          "level" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `;
      console.log('✅ User table created');
    } catch (tableError) {
      console.log('User table might already exist:', tableError);
    }

    // Step 2: Check if admin exists
    let adminExists = false;
    try {
      const existingAdmin = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
      });
      if (existingAdmin) {
        adminExists = true;
        console.log('✅ Admin already exists:', existingAdmin.email);
      }
    } catch (checkError) {
      console.log('Could not check for existing admin, will try to create one');
    }

    // Step 3: Create admin if doesn't exist
    if (!adminExists) {
      console.log('Creating admin account...');
      const adminPassword = await bcrypt.hash('admin123', 12);
      
      try {
        const admin = await prisma.user.create({
          data: {
            email: 'admin@mindset.com',
            password: adminPassword,
            name: 'Admin User',
            role: 'ADMIN'
          }
        });
        console.log('✅ Admin created:', admin.email);
      } catch (createError: any) {
        console.error('Admin creation failed:', createError.message);
        // If creation fails, try with raw SQL
        try {
          await prisma.$executeRaw`
            INSERT INTO "User" ("id", "email", "password", "name", "role", "createdAt", "updatedAt")
            VALUES ('admin_001', 'admin@mindset.com', ${adminPassword}, 'Admin User', 'ADMIN', NOW(), NOW())
            ON CONFLICT ("email") DO NOTHING;
          `;
          console.log('✅ Admin created via raw SQL');
        } catch (rawError) {
          throw new Error(`Both Prisma and raw SQL failed: ${createError.message}`);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Emergency setup complete! Login with admin@mindset.com / admin123',
      adminEmail: 'admin@mindset.com',
      defaultPassword: 'admin123'
    });

  } catch (error: any) {
    console.error('🚨 EMERGENCY SETUP FAILED:', error);
    
    return NextResponse.json({ 
      success: false,
      error: 'Emergency setup failed',
      details: error.message,
      suggestion: 'Check Neon database connection and permissions'
    }, { status: 500 });
  }
}