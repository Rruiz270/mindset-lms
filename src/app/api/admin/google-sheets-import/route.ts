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

// Parse date from DD/MM/YYYY format to Date object
function parseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sheetUrl } = await request.json();
    
    if (!sheetUrl || !sheetUrl.includes('docs.google.com/spreadsheets')) {
      return NextResponse.json({ error: 'Invalid Google Sheets URL' }, { status: 400 });
    }

    // Extract spreadsheet ID from URL
    const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      return NextResponse.json({ error: 'Could not extract spreadsheet ID' }, { status: 400 });
    }
    
    const spreadsheetId = match[1];
    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=0`;

    // Fetch CSV data
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch spreadsheet data');
    }

    const csvText = await response.text();
    const lines = csvText.trim().split('\n');
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'No data found in spreadsheet' }, { status: 400 });
    }

    // Parse CSV
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const students = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length < 7) continue; // Skip incomplete rows
      
      const student = {
        name: values[0],
        email: values[1],
        phone: values[2],
        course: values[3],
        lessons: parseInt(values[4]) || 0,
        level: values[5],
        contractEnd: values[6]
      };
      
      if (student.name && student.email) {
        students.push(student);
      }
    }

    console.log(`Found ${students.length} students in Google Sheets`);

    // Level mapping
    const levelMapping: Record<string, string> = {
      'Basico': 'STARTER', 'Basic': 'STARTER', 'Beginner': 'STARTER', 'Starter': 'STARTER', 'Elemental': 'STARTER',
      'Survivor': 'SURVIVOR', 'Intermediate': 'SURVIVOR', 'Intermedio': 'SURVIVOR', 'Intermediário': 'SURVIVOR',
      'Explorer': 'EXPLORER', 'Advanced': 'EXPLORER', 'Avancado': 'EXPLORER', 'Avanzado': 'EXPLORER', 'Avançado': 'EXPLORER',
      'Expert': 'EXPERT'
    };

    const imported: any[] = [];
    const errors: string[] = [];
    const updates: any[] = [];

    for (const studentData of students) {
      try {
        // Check if email exists
        const existing = await prisma.user.findUnique({
          where: { email: studentData.email.toLowerCase() }
        });
        
        if (existing) {
          // Update existing user's package if needed
          const hasActivePackage = await prisma.package.findFirst({
            where: {
              userId: existing.id,
              validUntil: { gte: new Date() }
            }
          });

          if (!hasActivePackage && studentData.contractEnd) {
            const validUntil = parseDate(studentData.contractEnd);
            const validFrom = new Date(validUntil);
            validFrom.setFullYear(validFrom.getFullYear() - 1);
            
            await prisma.package.create({
              data: {
                userId: existing.id,
                totalLessons: studentData.lessons,
                usedLessons: 0,
                remainingLessons: studentData.lessons,
                validFrom,
                validUntil
              }
            });
            
            updates.push(`${studentData.name}: Package updated`);
          } else {
            errors.push(`${studentData.name}: Email already exists`);
          }
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
        if (studentData.contractEnd) {
          const validUntil = parseDate(studentData.contractEnd);
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
        }

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
      updated: updates.length,
      total: students.length,
      errors,
      message: `Successfully processed ${imported.length + updates.length} of ${students.length} students!`,
      sampleStudents: imported.slice(0, 5),
      updates: updates.slice(0, 5)
    });

  } catch (error: any) {
    console.error('Google Sheets import error:', error);
    return NextResponse.json({
      success: false,
      error: 'Import failed',
      details: error.message
    }, { status: 500 });
  }
}