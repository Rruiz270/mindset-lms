import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Hardcoded student data from Fix up.csv (first 50 for testing)
const studentUpdates = [
  { email: "abelardo.geografia@gmail.com", phone: "8298240664", comments: "", remainingHours: 172 },
  { email: "adonaigabriel@gmail.com", phone: "11997626734", comments: "Aluno possuia 179 aulas e renovou com 160.", remainingHours: 338 },
  { email: "adrianasilva@grupoflipper.com.br", phone: "13996056876", comments: "A aluna renovou e adicionou 80 aulas ao pacote totalizando 155 aulas.", remainingHours: 235 },
  { email: "adriflorio2@gmail.com", phone: "11993944623", comments: "", remainingHours: 31 },
  { email: "agnes.ruescas@outlook.com", phone: "11962994292", comments: "", remainingHours: 224 },
  { email: "a.freitas.pereira@hotmail.com", phone: "27999187006", comments: "", remainingHours: 83 },
  { email: "alana.sillva1234@gmail.com", phone: "11947574406", comments: "", remainingHours: 80 },
  { email: "alannaalves_aaf@hotmail.com", phone: "11986809550", comments: "", remainingHours: 77 },
  { email: "alessandro.bergo@gmail.com", phone: "21991709988", comments: "", remainingHours: 27 },
  { email: "a_ly_rio@hotmail.com", phone: "61999010137", comments: "", remainingHours: -18 }
];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let updated = 0;
    let notFound = 0;
    let errors = 0;
    const results: any[] = [];

    console.log(`Starting update for ${studentUpdates.length} students`);

    for (const studentData of studentUpdates) {
      try {
        // Clean the email and ensure proper formatting
        const cleanEmail = studentData.email.toLowerCase().trim();
        
        // First check if student exists
        const existingUser = await prisma.user.findFirst({
          where: {
            email: cleanEmail,
            role: 'STUDENT'
          }
        });

        if (existingUser) {
          // Update the student
          const result = await prisma.user.update({
            where: {
              id: existingUser.id
            },
            data: {
              phone: studentData.phone || null,
              comments: studentData.comments || null,
              remainingHours: studentData.remainingHours
            }
          });

          updated++;
          results.push({
            email: cleanEmail,
            status: 'updated',
            remainingHours: studentData.remainingHours,
            studentId: result.studentId
          });
          console.log(`✅ Updated ${cleanEmail} - ${studentData.remainingHours} hours`);
        } else {
          notFound++;
          results.push({
            email: cleanEmail,
            status: 'not_found'
          });
          console.log(`❌ Student not found: ${cleanEmail}`);
        }

      } catch (error: any) {
        errors++;
        results.push({
          email: studentData.email,
          status: 'error',
          error: error.message
        });
        console.error(`Error updating ${studentData.email}:`, error.message);
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: studentUpdates.length,
        updated,
        notFound,
        errors
      },
      results: results.slice(0, 10), // Show first 10 results
      message: `Successfully updated ${updated} students with remaining hours and phone data`
    });

  } catch (error: any) {
    console.error('Update student data error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update student data',
      details: error.message
    }, { status: 500 });
  }
}