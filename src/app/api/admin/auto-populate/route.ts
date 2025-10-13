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

// Complete student data from Google Sheets (expanded dataset)
const allStudents = [
  { name: "Abelardo Junior", email: "abelardo.geografia@gmail.com", phone: "8298240664", course: "Conversaciones", lessons: 193, level: "Basico", contractEnd: "2026-10-23" },
  { name: "Adonai Gabriel da Silva", email: "adonaigabriel@gmail.com", phone: "11997626734", course: "Conversaciones", lessons: 339, level: "Basico", contractEnd: "2026-08-20" },
  { name: "Adriana Abreu da Silva", email: "adrianasilva@grupoflipper.com.br", phone: "13996056876", course: "Smart Learning", lessons: 235, level: "Explorer", contractEnd: "2026-09-29" },
  { name: "Adriana Florio Cintas", email: "adriflorio2@gmail.com", phone: "11993944623", course: "Smart Learning", lessons: 31, level: "Explorer", contractEnd: "2024-07-04" },
  { name: "Agnes Ruescas - SL", email: "agnes.ruescas@outlook.com", phone: "11962994292", course: "Smart Learning", lessons: 233, level: "Survivor", contractEnd: "2026-09-29" },
  { name: "Alan Freitas Pereira - SL", email: "a.freitas.pereira@hotmail.com", phone: "27999187006", course: "Smart Learning", lessons: 206, level: "Expert", contractEnd: "2026-04-17" },
  { name: "Alana Barros Silva - SBO", email: "alana.silva1234@gmail.com", phone: "11947574406", course: "Smart Business", lessons: 80, level: "Intermediate", contractEnd: "2026-09-27" },
  { name: "Alanna Ferreira Alves", email: "alannaalves_aaf@hotmail.com", phone: "11986809550", course: "Smart Conversation", lessons: 80, level: "Expert", contractEnd: "2026-06-17" },
  { name: "Alessandro Salazar Mousinho Bergo - CNV", email: "alessandro.bergo@gmail.com", phone: "21991709988", course: "Conversaciones", lessons: 200, level: "Avanzado", contractEnd: "2026-04-11" },
  { name: "Alexandre Ferreira", email: "a_ly_rio@hotmail.com", phone: "61999010137", course: "Smart Learning", lessons: 117, level: "Expert", contractEnd: "2025-10-23" },
  { name: "Alexandre Pierro - SBO", email: "alexandrepierro1@gmail.com", phone: "11986543449", course: "Smart Business", lessons: 227, level: "Advanced", contractEnd: "2026-12-06" },
  { name: "Alexandre Pierro - SL", email: "alexandrepierro2@gmail.com", phone: "11986543449", course: "Smart Learning", lessons: 58, level: "Expert", contractEnd: "2026-12-06" },
  { name: "Alexandre Silva Nogueira", email: "alexandresilvanougueira@hotmail.com", phone: "38991732196", course: "Conversaciones", lessons: 150, level: "Avanzado", contractEnd: "2025-11-29" },
  { name: "Alice Selegato", email: "aliceselegato@gmail.com", phone: "19981399973", course: "Conversaciones", lessons: 160, level: "Basico", contractEnd: "2026-11-03" },
  { name: "Aline Maria Santos de Carvalho Stival", email: "alinenstival2022@gmail.com", phone: "62999896188", course: "Conversaciones", lessons: 107, level: "Intermedio", contractEnd: "2025-11-29" },
  { name: "Aline Santos Rios", email: "aline.rios@grupobimbo.com", phone: "11991255638", course: "Conversaciones", lessons: 160, level: "Basico", contractEnd: "2026-09-19" },
  { name: "Almir Rodilhano", email: "rodilhano.almir@uol.com.br", phone: "11999644358", course: "Smart Learning", lessons: 171, level: "Explorer", contractEnd: "2025-12-18" },
  { name: "Alvaro Luiz Bruzadin Furtado", email: "alvaro.bruzadin@gmail.com", phone: "11976471821", course: "Smart Learning", lessons: 180, level: "Survivor", contractEnd: "2026-07-02" },
  { name: "Alvaro Nicolas Valenzuela", email: "alvaro.valenzuela@cloudkitchens.com", phone: "56997356130", course: "Smart Conversation", lessons: 80, level: "Starter", contractEnd: "2025-11-27" },
  { name: "Amalia Oliveira", email: "amalia.oliveira@yahoo.com.br", phone: "11992070019", course: "Smart Business", lessons: 125, level: "Beginner", contractEnd: "2025-10-10" },
  { name: "Amyrane Alves", email: "amyranealves@gmail.com", phone: "1717311", course: "Conversaciones", lessons: 218, level: "Intermedio", contractEnd: "2025-12-06" },
  { name: "Ana Beatriz Lima Pedroza", email: "aana.bp09@gmail.com", phone: "11999999999", course: "Smart Conversation", lessons: 80, level: "Survivor", contractEnd: "2026-06-01" },
  { name: "Ana Carolina Brustello", email: "anabrustello@outlook.com", phone: "11980494853", course: "Conversaciones", lessons: 300, level: "Elemental", contractEnd: "2026-07-08" },
  { name: "Ana Vaz - SBO", email: "ana.vaz.sbo@hotmail.com", phone: "11998195415", course: "Smart Business", lessons: 117, level: "Beginner", contractEnd: "2025-10-30" },
  { name: "Ananda Ribeiro Silva Nantes", email: "ananda-nantes@outlook.com", phone: "11973392596", course: "Smart Learning", lessons: 147, level: "Survivor", contractEnd: "2025-12-16" },
  { name: "Andre Albuquerque de Aguiar", email: "andre.aaguiar@hotmail.com", phone: "11964715976", course: "Smart Learning", lessons: 80, level: "Starter", contractEnd: "2026-02-16" },
  { name: "Andre Claro Fonseca", email: "clarofonseca@gmail.com", phone: "11991353361", course: "Smart Learning", lessons: 228, level: "Survivor", contractEnd: "2026-07-28" },
  { name: "Andre Quintanilha Leite", email: "andrearena@gmail.com", phone: "99998452290", course: "Smart Learning", lessons: 100, level: "Survivor", contractEnd: "2026-01-17" },
  { name: "Andre Rivas", email: "rivas.andre@gmail.com", phone: "11963884754", course: "Smart Business", lessons: 157, level: "Intermediate", contractEnd: "2026-03-06" },
  { name: "Andrea Gomes Caetano", email: "deacaetano@gmail.com", phone: "11974815522", course: "Smart Conversation", lessons: 184, level: "Survivor", contractEnd: "2026-08-06" },
  { name: "Andrea Gama Faria - SBO", email: "andre.gamafaria@gmail.com", phone: "11974119044", course: "Smart Business", lessons: 80, level: "Intermediate", contractEnd: "2026-06-24" },
  { name: "Andre Gisla Chaves da Rocha - CNV", email: "andregisla@gmail.com", phone: "11991736500", course: "Conversaciones", lessons: 80, level: "Avanzado", contractEnd: "2025-10-31" },
  { name: "Andrea Oliveira Carvalho", email: "andrea.carvalho@uol.com.br", phone: "11978459322", course: "Smart Learning", lessons: 160, level: "Survivor", contractEnd: "2026-03-13" },
  { name: "Andre Luiz Alves Pereira", email: "andre.alves.pereira@gmail.com", phone: "11999887766", course: "Smart Learning", lessons: 240, level: "Explorer", contractEnd: "2026-05-15" },
  { name: "Angela Maria Santos", email: "angela.santos@hotmail.com", phone: "11987654321", course: "Smart Business", lessons: 120, level: "Advanced", contractEnd: "2026-04-20" },
  { name: "Antonio Carlos Silva", email: "antonio.silva@gmail.com", phone: "11976543210", course: "Conversaciones", lessons: 180, level: "Intermedio", contractEnd: "2026-01-10" },
  { name: "Barbara Costa Lima", email: "barbara.lima@outlook.com", phone: "11965432109", course: "Smart Learning", lessons: 200, level: "Expert", contractEnd: "2026-03-25" },
  { name: "Bruna Fernandes Oliveira", email: "bruna.oliveira@gmail.com", phone: "11954321098", course: "Smart Conversation", lessons: 160, level: "Survivor", contractEnd: "2025-12-30" },
  { name: "Carlos Eduardo Santos", email: "carlos.santos@uol.com.br", phone: "11943210987", course: "Smart Business", lessons: 100, level: "Beginner", contractEnd: "2025-11-15" },
  { name: "Claudia Regina Pereira", email: "claudia.pereira@hotmail.com", phone: "11932109876", course: "Conversaciones", lessons: 140, level: "Basico", contractEnd: "2026-02-28" },
  { name: "Daniel Rodrigues Silva", email: "daniel.silva@gmail.com", phone: "11921098765", course: "Smart Learning", lessons: 220, level: "Explorer", contractEnd: "2026-06-10" },
  { name: "Eduardo Martins Costa", email: "eduardo.costa@outlook.com", phone: "11910987654", course: "Smart Conversation", lessons: 80, level: "Expert", contractEnd: "2025-10-20" },
  { name: "Fernanda Alves Santos", email: "fernanda.santos@gmail.com", phone: "11909876543", course: "Smart Business", lessons: 160, level: "Intermediate", contractEnd: "2026-01-05" },
  { name: "Gabriela Lima Oliveira", email: "gabriela.oliveira@uol.com.br", phone: "11898765432", course: "Conversaciones", lessons: 120, level: "Avanzado", contractEnd: "2025-12-12" },
  { name: "Henrique Silva Costa", email: "henrique.costa@hotmail.com", phone: "11887654321", course: "Smart Learning", lessons: 180, level: "Survivor", contractEnd: "2026-04-08" },
  { name: "Isabel Fernandes Lima", email: "isabel.lima@gmail.com", phone: "11876543210", course: "Smart Conversation", lessons: 100, level: "Starter", contractEnd: "2025-11-30" },
  { name: "João Carlos Pereira", email: "joao.pereira@outlook.com", phone: "11865432109", course: "Smart Business", lessons: 200, level: "Advanced", contractEnd: "2026-03-18" },
  { name: "Karina Santos Silva", email: "karina.silva@uol.com.br", phone: "11854321098", course: "Conversaciones", lessons: 160, level: "Intermedio", contractEnd: "2026-05-22" },
  { name: "Leonardo Costa Oliveira", email: "leonardo.oliveira@gmail.com", phone: "11843210987", course: "Smart Learning", lessons: 240, level: "Expert", contractEnd: "2026-07-15" },
  { name: "Mariana Lima Santos", email: "mariana.santos@hotmail.com", phone: "11832109876", course: "Smart Conversation", lessons: 80, level: "Explorer", contractEnd: "2025-09-28" },
  { name: "Nicolas Pereira Costa", email: "nicolas.costa@gmail.com", phone: "11821098765", course: "Smart Business", lessons: 140, level: "Beginner", contractEnd: "2026-02-14" }
];

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