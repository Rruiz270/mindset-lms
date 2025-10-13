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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    console.log('File content preview:', text.substring(0, 200));
    
    // Better CSV parsing that handles quoted fields
    function parseCSVLine(line: string): string[] {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    }

    const lines = text.trim().split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV must have at least 2 lines (header + data)' }, { status: 400 });
    }
    
    const headers = parseCSVLine(lines[0]).map(h => h.replace(/"/g, ''));
    console.log('CSV Headers found:', headers);
    
    const students = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]).map(v => v.replace(/"/g, ''));
      const student: any = {};
      
      headers.forEach((header, index) => {
        student[header] = values[index] || '';
      });
      
      console.log(`Row ${i} student data:`, student);
      
      // Map to expected format - try multiple column name variations
      const mappedStudent = {
        'Full Name': student['Full Name'] || student['Nome'] || student['Name'] || student['Student Name'] || '',
        'Email': student['Email'] || student['E-mail'] || student['email'] || '',
        'Phone': student['Phone'] || student['Telefone'] || student['phone'] || '',
        'CEFR Level': student['Level'] || student['CEFR Level'] || student['Nivel'] || student['Nível'] || '',
        'Total Lessons': student['Total Lessons'] || student['Aulas'] || student['Lessons'] || student['Classes'] || '',
        'Contract End': student['Contract End'] || student['Fim de Contrato'] || student['End Date'] || ''
      };
      
      console.log(`Row ${i} mapped:`, mappedStudent);
      
      // Only add if has name and email
      if (mappedStudent['Full Name'] && mappedStudent['Email']) {
        students.push(mappedStudent);
      }
    }
    
    console.log(`Found ${students.length} valid students`);
    
    if (students.length === 0) {
      return NextResponse.json({ 
        error: 'No valid students found in CSV',
        details: 'Make sure your CSV has Full Name and Email columns with data'
      }, { status: 400 });
    }

    // Import students
    const imported: any[] = [];
    const errors: string[] = [];
    
    // Level mapping
    const levelMapping: Record<string, string> = {
      'Basico': 'STARTER', 'Basic': 'STARTER', 'Beginner': 'STARTER', 'Starter': 'STARTER',
      'Survivor': 'SURVIVOR', 'Intermediate': 'SURVIVOR', 'Intermedio': 'SURVIVOR',
      'Explorer': 'EXPLORER', 'Advanced': 'EXPLORER', 'Avancado': 'EXPLORER',
      'Expert': 'EXPERT', 'Elemental': 'STARTER',
      'A1': 'STARTER', 'A2': 'STARTER', 'B1': 'SURVIVOR', 'B2': 'EXPLORER', 'C1': 'EXPERT', 'C2': 'EXPERT'
    };

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const rowNum = i + 2;
      
      try {
        // Check if email exists
        const existing = await prisma.user.findUnique({
          where: { email: student['Email'].toLowerCase() }
        });
        
        if (existing) {
          errors.push(`Row ${rowNum}: Email ${student['Email']} already exists`);
          continue;
        }

        // Generate password and student ID
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 12);
        const studentId = await generateStudentId();
        
        // Create user
        const user = await prisma.user.create({
          data: {
            email: student['Email'].toLowerCase(),
            password: hashedPassword,
            name: student['Full Name'],
            role: 'STUDENT',
            level: levelMapping[student['CEFR Level']] || 'STARTER',
            studentId: studentId,
            isActive: true,
            phone: student['Phone'] || null
          }
        });

        // Create package if contract end date exists
        if (student['Contract End']) {
          const totalLessons = parseInt(student['Total Lessons']) || 80;
          const validUntil = new Date(student['Contract End']);
          const validFrom = new Date(validUntil);
          validFrom.setFullYear(validFrom.getFullYear() - 1);
          
          if (!isNaN(validUntil.getTime())) {
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
        }

        imported.push({
          studentId: user.studentId,
          name: user.name,
          email: user.email,
          tempPassword,
          level: user.level
        });

      } catch (error: any) {
        console.error(`Error importing row ${rowNum}:`, error);
        errors.push(`Row ${rowNum}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: imported.length > 0,
      imported: imported.length,
      total: students.length,
      errors,
      students: imported.slice(0, 10) // Show first 10 for preview
    });

  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({
      success: false,
      error: 'Import failed',
      details: error.message
    }, { status: 500 });
  }
}