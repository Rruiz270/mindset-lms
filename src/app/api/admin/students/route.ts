import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Generate unique student ID in format: MST-YYYY-NNNN
async function generateStudentId(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `MST-${currentYear}-`;
  
  // Find the highest number for this year
  const lastStudent = await prisma.user.findFirst({
    where: {
      role: 'STUDENT',
      studentId: {
        startsWith: prefix
      }
    },
    orderBy: {
      studentId: 'desc'
    }
  });

  let nextNumber = 1;
  if (lastStudent?.studentId) {
    const lastNumber = parseInt(lastStudent.studentId.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['fullName', 'email', 'phone', 'birthDate', 'cefrLevel', 'mindsetLevel', 'course', 'contractStart', 'contractEnd'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Generate a temporary password (student will change on first login)
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Map CEFR level to internal level enum
    const levelMapping: Record<string, string> = {
      'A1': 'STARTER',
      'A2': 'STARTER', 
      'B1': 'SURVIVOR',
      'B2': 'EXPLORER',
      'C1': 'EXPERT',
      'C2': 'EXPERT'
    };

    // Generate unique student ID
    const studentId = await generateStudentId();

    // Create user account
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.fullName,
        role: 'STUDENT',
        level: levelMapping[data.cefrLevel] || 'STARTER',
        studentId: studentId,
        isActive: true
      }
    });

    // Create package for the student
    const validFrom = new Date(data.contractStart);
    const validUntil = new Date(data.contractEnd);
    
    const studentPackage = await prisma.package.create({
      data: {
        userId: user.id,
        totalLessons: data.totalHours || 80,
        usedLessons: 0,
        remainingLessons: data.totalHours || 80,
        validFrom,
        validUntil
      }
    });

    // Create student profile with additional information
    // Note: We might need to extend the User model or create a separate StudentProfile model
    // For now, storing basic info in User model
    
    // Log the registration
    console.log(`New student registered: ${data.fullName} (${data.email})`);
    console.log(`Temporary password: ${tempPassword}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Student registered successfully',
      userId: user.id,
      studentId: user.studentId,
      packageId: studentPackage.id,
      tempPassword // In production, send this via email instead
    });

  } catch (error) {
    console.error('Error registering student:', error);
    return NextResponse.json({ error: 'Failed to register student' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all students with their packages
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        packages: true,
        studentBookings: {
          include: {
            topic: true,
            teacher: {
              select: { name: true }
            }
          },
          take: 5,
          orderBy: { scheduledAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(students);

  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}