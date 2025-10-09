import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.fullName || !data.email) {
      return NextResponse.json({ error: 'Full name and email are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Create teacher user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.fullName,
        role: 'TEACHER'
      }
    });

    // Create availability records if provided
    if (data.availability && Array.isArray(data.availability)) {
      const availabilityRecords = data.availability.map((slot: any) => ({
        teacherId: user.id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isActive: true
      }));

      await prisma.availability.createMany({
        data: availabilityRecords
      });
    }

    // Log the registration
    console.log(`New teacher registered: ${data.fullName} (${data.email})`);
    console.log(`Temporary password: ${tempPassword}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Teacher registered successfully',
      userId: user.id,
      tempPassword // In production, send this via email instead
    });

  } catch (error) {
    console.error('Error registering teacher:', error);
    return NextResponse.json({ error: 'Failed to register teacher' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const teachers = await prisma.user.findMany({
      where: {
        role: 'TEACHER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        availability: {
          select: {
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            isActive: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ teachers });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
  }
}