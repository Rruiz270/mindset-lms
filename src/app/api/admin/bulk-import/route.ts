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

function parseCSV(text: string): any[] {
  const lines = text.trim().split('\\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    // Skip empty rows
    if (!row['Full Name'] && !row['Email']) continue;
    
    rows.push(row);
  }
  
  return rows;
}

function validateStudentData(student: any, index: number): string[] {
  const errors: string[] = [];
  const rowNum = index + 2; // +2 because index is 0-based and we skip header row

  // Required fields
  if (!student['Full Name']) {
    errors.push(`Row ${rowNum}: Full Name is required`);
  }
  if (!student['Email']) {
    errors.push(`Row ${rowNum}: Email is required`);
  } else {
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(student['Email'])) {
      errors.push(`Row ${rowNum}: Invalid email format`);
    }
  }
  if (!student['Phone']) {
    errors.push(`Row ${rowNum}: Phone is required`);
  }
  
  // Date validation
  if (student['Birth Date']) {
    const birthDate = new Date(student['Birth Date']);
    if (isNaN(birthDate.getTime())) {
      errors.push(`Row ${rowNum}: Invalid birth date format. Use YYYY-MM-DD`);
    }
  }
  
  if (student['Contract Start']) {
    const startDate = new Date(student['Contract Start']);
    if (isNaN(startDate.getTime())) {
      errors.push(`Row ${rowNum}: Invalid contract start date. Use YYYY-MM-DD`);
    }
  }
  
  if (student['Contract End']) {
    const endDate = new Date(student['Contract End']);
    if (isNaN(endDate.getTime())) {
      errors.push(`Row ${rowNum}: Invalid contract end date. Use YYYY-MM-DD`);
    }
  }
  
  // CEFR Level validation
  const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  if (student['CEFR Level'] && !validLevels.includes(student['CEFR Level'].toUpperCase())) {
    errors.push(`Row ${rowNum}: Invalid CEFR Level. Must be one of: ${validLevels.join(', ')}`);
  }
  
  // Total Lessons validation
  if (student['Total Lessons']) {
    const lessons = parseInt(student['Total Lessons']);
    if (isNaN(lessons) || lessons <= 0) {
      errors.push(`Row ${rowNum}: Total Lessons must be a positive number`);
    }
  }
  
  return errors;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const students = parseCSV(text);
    
    if (students.length === 0) {
      return NextResponse.json({ error: 'No valid data found in CSV' }, { status: 400 });
    }

    // Validate all students first
    const allErrors: string[] = [];
    students.forEach((student, index) => {
      const errors = validateStudentData(student, index);
      allErrors.push(...errors);
    });

    // Check for duplicate emails in the file
    const emails = students.map(s => s['Email'].toLowerCase());
    const duplicateEmails = emails.filter((email, index) => emails.indexOf(email) !== index);
    if (duplicateEmails.length > 0) {
      allErrors.push(`Duplicate emails found in file: ${[...new Set(duplicateEmails)].join(', ')}`);
    }

    // Check for existing emails in database
    const existingEmails = await prisma.user.findMany({
      where: {
        email: {
          in: emails
        }
      },
      select: { email: true }
    });

    if (existingEmails.length > 0) {
      allErrors.push(`Emails already exist in database: ${existingEmails.map(u => u.email).join(', ')}`);
    }

    if (allErrors.length > 0) {
      return NextResponse.json({
        success: false,
        imported: 0,
        errors: allErrors,
        students: []
      });
    }

    // Import students
    const imported: any[] = [];
    const errors: string[] = [];
    
    // Map CEFR level to internal level enum
    const levelMapping: Record<string, string> = {
      'A1': 'STARTER',
      'A2': 'STARTER', 
      'B1': 'SURVIVOR',
      'B2': 'EXPLORER',
      'C1': 'EXPERT',
      'C2': 'EXPERT'
    };

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const rowNum = i + 2;
      
      try {
        // Generate temporary password
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 12);
        
        // Generate unique student ID
        const studentId = await generateStudentId();
        
        // Create user
        const user = await prisma.user.create({
          data: {
            email: student['Email'].toLowerCase(),
            password: hashedPassword,
            name: student['Full Name'],
            role: 'STUDENT',
            level: levelMapping[student['CEFR Level']?.toUpperCase()] || 'STARTER',
            studentId: studentId,
            isActive: true,
            phone: student['Phone'] || null,
            birthDate: student['Birth Date'] ? new Date(student['Birth Date']) : null,
            gender: student['Gender'] || null,
            address: student['Address'] || null
          }
        });

        // Create package if lesson information provided
        if (student['Total Lessons'] && student['Contract Start'] && student['Contract End']) {
          const totalLessons = parseInt(student['Total Lessons']) || 80;
          const validFrom = new Date(student['Contract Start']);
          const validUntil = new Date(student['Contract End']);
          
          await prisma.package.create({
            data: {
              userId: user.id,
              totalLessons,
              usedLessons: 0,
              remainingLessons: totalLessons,
              validFrom,
              validUntil
            }
          });
        }

        imported.push({
          studentId: user.studentId,
          name: user.name,
          email: user.email,
          tempPassword
        });

        console.log(`Imported student ${rowNum}: ${user.name} (${user.email}) - Password: ${tempPassword}`);

      } catch (error: any) {
        errors.push(`Row ${rowNum}: Failed to create student - ${error.message}`);
        console.error(`Failed to import student ${rowNum}:`, error);
      }
    }

    return NextResponse.json({
      success: imported.length > 0,
      imported: imported.length,
      errors,
      students: imported
    });

  } catch (error: any) {
    console.error('Bulk import error:', error);
    return NextResponse.json({
      success: false,
      imported: 0,
      errors: [`Server error: ${error.message}`],
      students: []
    }, { status: 500 });
  }
}