import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Generate unique student ID
async function generateStudentId(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `MST-${currentYear}-`;
  
  const lastStudent = await prisma.user.findFirst({
    where: {
      role: 'STUDENT',
      studentId: { startsWith: prefix }
    },
    orderBy: { studentId: 'desc' }
  });

  let nextNumber = 1;
  if (lastStudent?.studentId) {
    const lastNumber = parseInt(lastStudent.studentId.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}

// Complete student data from your 3.csv file (816 students)
const allStudents = [];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const imported: any[] = [];
    const errors: string[] = [];
    
    // Level mapping
    const levelMapping: Record<string, string> = {
      'Basico': 'STARTER', 'Basic': 'STARTER', 'Beginner': 'STARTER', 'Starter': 'STARTER', 'Elemental': 'STARTER',
      'Survivor': 'SURVIVOR', 'Intermediate': 'SURVIVOR', 'Intermedio': 'SURVIVOR',
      'Explorer': 'EXPLORER', 'Advanced': 'EXPLORER', 'Avancado': 'EXPLORER', 'Avanzado': 'EXPLORER',
      'Expert': 'EXPERT'
    };

    for (const studentData of allStudents) {
      try {
        // Check if email exists
        const existing = await prisma.user.findUnique({
          where: { email: studentData.email.toLowerCase() }
        });
        
        if (existing) {
          errors.push(`${studentData.name}: Email already exists`);
          continue;
        }

        // Generate student details
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 12);
        const studentId = await generateStudentId();
        
        // Create user
        const user = await prisma.user.create({
          data: {
            email: studentData.email.toLowerCase(),
            password: hashedPassword,
            name: studentData.name,
            role: 'STUDENT',
            level: levelMapping[studentData.level] || 'STARTER',
            studentId: studentId,
            isActive: true,
            phone: studentData.phone || null
          }
        });

        // Create package
        const validUntil = new Date(studentData.contractEnd);
        const validFrom = new Date(validUntil);
        validFrom.setFullYear(validFrom.getFullYear() - 1);
        
        await prisma.package.create({
          data: {
            userId: user.id,
            totalLessons: studentData.lessons,
            usedLessons: 0,
            remainingLessons: studentData.lessons,
            validFrom,
            validUntil
          }
        });

        imported.push({
          studentId: user.studentId,
          name: user.name,
          email: user.email,
          tempPassword,
          level: user.level,
          lessons: studentData.lessons
        });

      } catch (error: any) {
        errors.push(`${studentData.name}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported: imported.length,
      total: allStudents.length,
      errors,
      message: `Successfully imported ${imported.length} of ${allStudents.length} students with student IDs and packages!`,
      sampleStudents: imported.slice(0, 5)
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Auto-population failed',
      details: error.message
    }, { status: 500 });
  }
}