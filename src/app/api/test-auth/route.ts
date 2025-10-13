import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // Get the admin user
    const user = await prisma.user.findUnique({
      where: { email: 'admin@mindset.com' }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' });
    }

    // Test password comparison
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, user.password);

    // Also generate a fresh hash to compare
    const freshHash = await bcrypt.hash(testPassword, 10);
    const freshIsValid = await bcrypt.compare(testPassword, freshHash);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      },
      storedPasswordHash: user.password,
      testPassword: testPassword,
      isPasswordValid: isValid,
      freshHash: freshHash,
      freshHashValid: freshIsValid,
      bcryptVersion: bcrypt.version || 'unknown'
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error.message 
    });
  }
}

export async function POST() {
  return GET();
}