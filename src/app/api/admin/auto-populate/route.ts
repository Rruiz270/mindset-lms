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

// Sample student data from your 3.csv file (first 50 students for testing)
const allStudents = [
  { name: "Abelardo Junior", email: "abelardo.geografia@gmail.com", phone: "8298240664", course: "Conversaciones", lessons: 193, level: "Basico", contractEnd: "23/10/2026" },
  { name: "Adonai Gabriel da Silva", email: "adonaigabriel@gmail.com", phone: "11997626734", course: "Conversaciones", lessons: 339, level: "Basico", contractEnd: "20/08/2026" },
  { name: "Adriana Abreu da Silva", email: "adrianasilva@grupoflipper.com.br", phone: "13996056876", course: "Smart Learning", lessons: 235, level: "Explorer", contractEnd: "29/09/2026" },
  { name: "Adriana Florio Cintas", email: "adriflorio2@gmail.com", phone: "11993944623", course: "Smart Learning", lessons: 31, level: "Explorer", contractEnd: "04/17/2024" },
  { name: "Agnes Ruescas - SL", email: "agnes.ruescas@outlook.com", phone: "11962994292", course: "Smart Learning", lessons: 233, level: "Survivor", contractEnd: "29/09/2026" },
  { name: "Alan Freitas Pereira - SL", email: "a.freitas.pereira@hotmail.com", phone: "27999187006", course: "Smart Learning", lessons: 206, level: "Expert", contractEnd: "17/04/2026" },
  { name: "Alana Barros Silva - SBO", email: "alana.sillva1234@gmail.com", phone: "11947574406", course: "Smart Business", lessons: 80, level: "Intermediate", contractEnd: "27/09/2026" },
  { name: "Alanna Ferreira Alves", email: "alannaalves_aaf@hotmail.com", phone: "11986809550", course: "Smart Conversation", lessons: 80, level: "Expert", contractEnd: "17/06/2026" },
  { name: "Alessandro Salazar Mousinho Bergo - CNV", email: "alessandro.bergo@gmail.com", phone: "21991709988", course: "Conversaciones", lessons: 200, level: "Avanzado", contractEnd: "11/04/2026" },
  { name: "Alexandre Ferreira", email: "a_ly_rio@hotmail.com", phone: "61999010137", course: "Smart Learning", lessons: 117, level: "Expert", contractEnd: "23/10/2025" },
  { name: "Alexandre Pierro - SBO", email: "alexandrepierro@gmail.com", phone: "11986543449", course: "Smart Business", lessons: 227, level: "Advanced", contractEnd: "06/12/2026" },
  { name: "Alexandre Pierro - SL", email: "alexandrepierro2@gmail.com", phone: "11986543449", course: "Smart Learning", lessons: 58, level: "Expert", contractEnd: "06/12/2026" },
  { name: "Alexandre Silva Nogueira", email: "alexandresilvanogueira@hotmail.com", phone: "38991732196", course: "Conversaciones", lessons: 150, level: "Avanzado", contractEnd: "29/11/2025" },
  { name: "Alice Selegato", email: "aliceselegatto@gmail.com", phone: "19981399973", course: "Conversaciones", lessons: 160, level: "Basico", contractEnd: "03/11/2026" },
  { name: "Aline Maria Santos de Carvalho Stival", email: "alinemstival2022@gmail.com", phone: "62999896188", course: "Conversaciones", lessons: 107, level: "Intermedio", contractEnd: "29/11/2025" },
  { name: "Aline Santos Rios", email: "aline.rios@grupobimbo.com", phone: "11991255638", course: "Conversaciones", lessons: 160, level: "Basico", contractEnd: "19/09/2026" },
  { name: "Almir Rodilhano", email: "rodilhano.almir@uol.com.br", phone: "11999644358", course: "Smart Learning", lessons: 171, level: "Explorer", contractEnd: "18/12/2025" },
  { name: "Alvaro Luiz Bruzadin Furtado", email: "alvaro.bruzadin@gmail.com", phone: "11976471821", course: "Smart Learning", lessons: 180, level: "Survivor", contractEnd: "02/07/2026" },
  { name: "Alvaro Nicolas Valenzuela Angulo CLOUDKITCHENS LATAM", email: "alvaro.valenzuela@cloudkitchens.com", phone: "56997356130", course: "Smart Conversation", lessons: 80, level: "Starter", contractEnd: "27/11/2025" },
  { name: "Amalia Oliveira", email: "amalia.oliveira@yahoo.com.br", phone: "11992070019", course: "Smart Business", lessons: 125, level: "Beginner", contractEnd: "10/10/2025" },
  { name: "Amyrane Alves", email: "amyranealves@gmail.com", phone: "1717311", course: "Conversaciones", lessons: 218, level: "Intermedio", contractEnd: "06/12/2025" },
  { name: "Ana Beatriz Lima Pedroza", email: "aana.bp09@gmail.com", phone: "", course: "Smart Conversation", lessons: 0, level: "Survivor", contractEnd: "" },
  { name: "Ana Carolina Brustello", email: "anabrustello@outlook.com", phone: "11980494853", course: "Conversaciones", lessons: 300, level: "Elemental", contractEnd: "08/07/2026" },
  { name: "Ana Vaz - SBO", email: "alu.souza@hotmail.com", phone: "11998195415", course: "Smart Business", lessons: 117, level: "Beginner", contractEnd: "30/10/2025" },
  { name: "Ananda Ribeiro Silva Nantes", email: "ananda-nantes@outlook.com", phone: "11973392596", course: "Smart Learning", lessons: 147, level: "Survivor", contractEnd: "16/12/2025" },
  { name: "Andre Albuquerque de Aguiar", email: "andre.aaguiar@hotmail.com", phone: "11964715976", course: "Smart Learning", lessons: 80, level: "Starter", contractEnd: "16/02/2026" },
  { name: "Andre Claro Fonseca", email: "claroafonseca@gmail.com", phone: "11991353361", course: "Smart Learning", lessons: 228, level: "Survivor", contractEnd: "28/07/2026" },
  { name: "Andre Quintanilha Leite", email: "andreerena@gmail.com", phone: "99988452290", course: "Smart Learning", lessons: 100, level: "Survivor", contractEnd: "17/01/2026" },
  { name: "Andre Rivas", email: "rivas.andre@gmail.com", phone: "11963884754", course: "Smart Business", lessons: 157, level: "Intermediate", contractEnd: "06/03/2026" },
  { name: "Andrea Gomes Caetano", email: "deacaetano@gmail.com", phone: "11974815522", course: "Smart Conversation", lessons: 184, level: "Survivor", contractEnd: "06/08/2026" },
  { name: "Andreia Carolina de Oliveira - SBO", email: "dreia_carolina@hotmail.com", phone: "11951921059", course: "Smart Learning", lessons: 145, level: "Intermediate", contractEnd: "18/02/2026" },
  { name: "ANDREIA SILVA DA ROSA DE AMORIM", email: "andreiasramorim@gmail.com", phone: "48999029622", course: "Smart Business", lessons: 155, level: "Beginner", contractEnd: "04/12/2025" },
  { name: "Andressa Reguini Sinenberg", email: "andressa.redi@gmail.com", phone: "11997701362", course: "Conversaciones", lessons: 80, level: "Basico", contractEnd: "29/10/2025" },
  { name: "Andreza Dinucci", email: "andrezamoreti@gmail.com", phone: "11993226135", course: "Conversaciones", lessons: 208, level: "Intermedio", contractEnd: "04/06/2026" },
  { name: "Ane Saes Zala Meneguel", email: "ameneguel@waits.com.br", phone: "11991165796", course: "Smart Conversation", lessons: 150, level: "Starter", contractEnd: "28/04/2027" },
  { name: "Angela Batista", email: "angela.batista1983@gmail.com", phone: "11976383567", course: "Smart Learning", lessons: 121, level: "Explorer", contractEnd: "18/12/2025" },
  { name: "Angelica Aiko Justino - SC", email: "angelicaaiko402@gmail.com", phone: "11911311615", course: "Smart Conversation", lessons: 248, level: "Explorer", contractEnd: "05/05/2026" },
  { name: "Angelica Aiko Justino - CNV", email: "angelicaaiko402cnv@gmail.com", phone: "11911311615", course: "Conversaciones", lessons: 160, level: "Intermedio", contractEnd: "23/01/2026" },
  { name: "Anna Clara Machado de Souza", email: "anna_clarasouza@hotmail.com", phone: "21971970830", course: "Smart Conversation", lessons: 138, level: "Explorer", contractEnd: "19/03/2026" },
  { name: "Antonio Arildo Aleixo", email: "aarildoa@hotmail.com", phone: "11952785614", course: "Conversaciones", lessons: 120, level: "Avanzado", contractEnd: "15/10/2025" },
  { name: "Antonio Linoeudo Sousa", email: "antoniopereiratst@hotmail.com", phone: "88999007417", course: "Smart Conversation", lessons: 80, level: "Starter", contractEnd: "28/10/2025" },
  { name: "Assunta Pica", email: "assuntapica@gmail.com", phone: "11989424769", course: "Smart Conversation", lessons: 80, level: "Survivor", contractEnd: "14/11/2025" },
  { name: "Beatriz Helena de Paula Machado CLOUDKITCHENS", email: "beatriz.machado@cloudkitchens.com", phone: "11971079091", course: "Conversaciones", lessons: 80, level: "Intermedio", contractEnd: "27/11/2025" },
  { name: "Bernardina Maria Vilhena de Souza Souza", email: "bernavsouza@gmail.com", phone: "61999831576", course: "Conversaciones", lessons: 156, level: "Basico", contractEnd: "21/02/2026" },
  { name: "Bernardo Ribeiro Ramos Da Costa", email: "bernardo.dc@gmail.com", phone: "21971503999", course: "Smart Learning", lessons: 116, level: "Explorer", contractEnd: "10/10/2025" },
  { name: "Bruno Alves Ferreira Camargos", email: "bruno.ferreirasg@gmail.com", phone: "61981454643", course: "Smart Business", lessons: 80, level: "Beginner", contractEnd: "05/11/2025" },
  { name: "Bruno Carvalho", email: "bruno.drcarvalho@gmail.com", phone: "11997521098", course: "Smart Learning", lessons: 159, level: "Explorer", contractEnd: "05/05/2026" },
  { name: "Bruno Henrique Costa", email: "bruno.costa92@live.com", phone: "11983012972", course: "Smart Learning", lessons: 162, level: "Survivor", contractEnd: "28/11/2025" },
  { name: "Bruno Imar Fonseca Nunes", email: "imar.nunes@kaminsolutions.com", phone: "", course: "Smart Conversation", lessons: 0, level: "Starter", contractEnd: "" },
  { name: "Bruno Tanganeli Di Giacomo", email: "Brunotanganeli@hotmail.com", phone: "11967689818", course: "Smart Business", lessons: 160, level: "Intermediate", contractEnd: "23/05/2026" },
  { name: "Bruno Yukio Tanoue", email: "brunotanoue@hotmail.com", phone: "48996306627", course: "Smart Learning", lessons: 134, level: "Explorer", contractEnd: "06/05/2026" }
];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const imported: any[] = [];
    const errors: string[] = [];
    
    console.log(`Starting import of ${allStudents.length} students`);
    
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
        
        // Create user with all required fields
        const user = await prisma.user.create({
          data: {
            email: studentData.email.toLowerCase(),
            password: hashedPassword,
            name: studentData.name,
            role: 'STUDENT',
            level: levelMapping[studentData.level] || 'STARTER',
            studentId: studentId,
            isActive: true
          }
        });

        // Create package if contract end date exists and is valid
        if (studentData.contractEnd) {
          // Parse date from DD/MM/YYYY format
          function parseDate(dateStr: string): Date {
            if (!dateStr) return new Date();
            const [day, month, year] = dateStr.split('/').map(Number);
            return new Date(year, month - 1, day);
          }
          
          const validUntil = parseDate(studentData.contractEnd);
          const validFrom = new Date(validUntil);
          validFrom.setFullYear(validFrom.getFullYear() - 1);
          
          if (!isNaN(validUntil.getTime())) {
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
        console.error(`Error importing ${studentData.name}:`, error);
        errors.push(`${studentData.name}: ${error.message || 'Unknown error'}`);
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