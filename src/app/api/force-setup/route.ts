import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Use direct SQL to create tables and admin user
    const { Client } = require('pg');
    
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    // Create User table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "email" TEXT UNIQUE NOT NULL,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "role" TEXT DEFAULT 'STUDENT',
        "level" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await client.query(`
      INSERT INTO "User" ("id", "email", "password", "name", "role") 
      VALUES ('admin-001', 'admin@mindset.com', $1, 'Admin User', 'ADMIN')
      ON CONFLICT ("email") DO NOTHING;
    `, [hashedPassword]);

    await client.end();

    return NextResponse.json({
      success: true,
      message: 'SETUP COMPLETE! Login with admin@mindset.com / admin123',
      credentials: {
        email: 'admin@mindset.com',
        password: 'admin123'
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      details: 'Direct database setup failed'
    }, { status: 500 });
  }
}