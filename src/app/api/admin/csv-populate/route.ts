import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

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
  if (!dateStr) return new Date();
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Read the CSV file directly
    const csvPath = '/Users/Raphael/Downloads/3.csv';
    
    if (!fs.existsSync(csvPath)) {
      return NextResponse.json({ error: 'CSV file not found' }, { status: 400 });
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.trim().split('\n');
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'No data found in CSV' }, { status: 400 });
    }

    // Parse CSV with semicolon separator
    function parseCSVLine(line: string): string[] {
      const separator = ';';
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === separator && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    }

    // Skip header and parse students
    const students = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length >= 6 && values[0] && values[1]) { // Must have name and email
        students.push({
          name: values[0],
          email: values[1],
          phone: values[2] || '',
          course: values[3] || '',
          lessons: parseInt(values[4]) || 0,
          level: values[5] || '',
          contractEnd: values[7] || '' // Skip "Inicio Contrato" column
        });
      }
    }

    console.log(`Found ${students.length} students to import`);

    // Level mapping
    const levelMapping: Record<string, string> = {
      'Basico': 'STARTER', 'Basic': 'STARTER', 'Beginner': 'STARTER', 'Starter': 'STARTER', 'Elemental': 'STARTER',
      'Survivor': 'SURVIVOR', 'Intermediate': 'SURVIVOR', 'Intermedio': 'SURVIVOR', 'Intermediário': 'SURVIVOR',
      'Explorer': 'EXPLORER', 'Advanced': 'EXPLORER', 'Avancado': 'EXPLORER', 'Avanzado': 'EXPLORER', 'Avançado': 'EXPLORER',
      'Expert': 'EXPERT'
    };

    const imported: any[] = [];
    const errors: string[] = [];
    const BATCH_SIZE = 20; // Process 20 students at a time

    // Process in batches
    for (let batchStart = 0; batchStart < students.length; batchStart += BATCH_SIZE) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE, students.length);
      const batch = students.slice(batchStart, batchEnd);
      
      console.log(`Processing batch ${Math.floor(batchStart / BATCH_SIZE) + 1}: students ${batchStart + 1}-${batchEnd}`);
      
      for (const studentData of batch) {
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

          // Create package if contract end date exists
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
      
      // Small delay between batches
      if (batchStart + BATCH_SIZE < students.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return NextResponse.json({
      success: true,
      imported: imported.length,
      total: students.length,
      errors,
      message: `Successfully imported ${imported.length} of ${students.length} students from CSV!`,
      sampleStudents: imported.slice(0, 5)
    });

  } catch (error: any) {
    console.error('CSV import error:', error);
    return NextResponse.json({
      success: false,
      error: 'Import failed',
      details: error.message
    }, { status: 500 });
  }
}