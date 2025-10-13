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

// Complete student data from CSV (first 100 students to start)
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
  { name: "Bruno Yukio Tanoue", email: "brunotanoue@hotmail.com", phone: "48996306627", course: "Smart Learning", lessons: 134, level: "Explorer", contractEnd: "06/05/2026" },
  { name: "Camila Canjani", email: "camargocanjani@gmail.com", phone: "11999063044", course: "Conversaciones", lessons: 151, level: "Intermedio", contractEnd: "12/12/2025" },
  { name: "Camila Petrillo Gonçalves Manflim - CNV", email: "capetrillo@hotmail.com", phone: "14997233832", course: "Conversaciones", lessons: 186, level: "Elemental", contractEnd: "30/04/2026" },
  { name: "Carin Mello da Rosa", email: "carin.mello.rosa@gmail.com", phone: "55984442754", course: "Smart Learning", lessons: 239, level: "Explorer", contractEnd: "06/05/2026" },
  { name: "Carina Mota de Oliveira", email: "carinamotaoli@gmail.com", phone: "11961685563", course: "Smart Learning", lessons: 156, level: "Explorer", contractEnd: "22/01/2026" },
  { name: "Carla Farias", email: "carla_mfarias@yahoo.com.br", phone: "11968956052", course: "Smart Conversation", lessons: 158, level: "Starter", contractEnd: "27/03/2026" },
  { name: "Carlos Alberto Brumm UFINET", email: "cbrumm@ufinet.com", phone: "11992187430", course: "Conversaciones", lessons: 80, level: "Basico", contractEnd: "01/06/2026" },
  { name: "Carlos Alexandre dos Santos - CNV", email: "ca.xande@yahoo.com.br", phone: "11980709193", course: "Conversaciones", lessons: 80, level: "Elemental", contractEnd: "22/11/2025" },
  { name: "Carlos Eduardo Wolkartt Vago", email: "carlos.wolkartt@hotmail.com", phone: "27999361648", course: "Conversaciones", lessons: 80, level: "Basico", contractEnd: "13/11/2025" },
  { name: "Carlos Filho - SC", email: "carllos.filho63@gmail.com", phone: "11966172200", course: "Smart Conversation", lessons: 180, level: "Survivor", contractEnd: "07/01/2026" },
  { name: "Carlos Jose De Oliveira Junior", email: "cj.oliveiras@hotmail.com", phone: "11998565067", course: "Smart Learning", lessons: 80, level: "Explorer", contractEnd: "12/10/2025" },
  { name: "Carlota Moraes", email: "cblassioli@gmail.com", phone: "11996519868", course: "Smart Learning", lessons: 100, level: "Explorer", contractEnd: "27/11/2025" },
  { name: "Carmen Silvia Winkler Vernaglia", email: "carmen.vernaglia@uol.com.br", phone: "11983716461", course: "Smart Conversation", lessons: 152, level: "Starter", contractEnd: "29/01/2026" },
  { name: "Carolina Florentino Bueno dos Santos - SC", email: "carolinabuenos@yahoo.com.br", phone: "11974299118", course: "Smart Conversation", lessons: 258, level: "Expert", contractEnd: "23/01/2026" },
  { name: "Carolina Ribeiro Pontello", email: "carolina@tulliopontello.com.br", phone: "12966669985", course: "Smart Conversation", lessons: 260, level: "Survivor", contractEnd: "29/11/2025" },
  { name: "Caroline Bieszczad", email: "carolinebieszczad@gmail.com", phone: "11987218399", course: "Smart Conversation", lessons: 212, level: "Survivor", contractEnd: "05/08/2026" },
  { name: "Caroline Cotrim", email: "caroline@advcotrim.adv.br", phone: "11983897720", course: "Smart Learning", lessons: 120, level: "Explorer", contractEnd: "14/07/2026" },
  { name: "Celia Martins WOBBEN", email: "celia.martins@wobben.com.br", phone: "15991273330", course: "Smart Conversation", lessons: 80, level: "Explorer", contractEnd: "31/01/2026" },
  { name: "Christiane Picanço da Silva", email: "christianepicanco1974@gmail.com", phone: "92982032628", course: "Smart Learning", lessons: 108, level: "Starter", contractEnd: "22/01/2026" },
  { name: "Christophe Rapenne", email: "christophe.rapenne@patria.com", phone: "11993700388", course: "Conversaciones", lessons: 160, level: "Basico", contractEnd: "11/02/2026" },
  { name: "Cicero Ferreira de Lira", email: "cicerodelira@gmail.com", phone: "11995534347", course: "Smart Conversation", lessons: 240, level: "Starter", contractEnd: "16/08/2026" },
  { name: "Cintia Alves - CNV", email: "cintia.alves@me.com", phone: "11981998360", course: "Conversaciones", lessons: 153, level: "Intermedio", contractEnd: "22/11/2025" },
  { name: "Cintia Alves - SBO", email: "cintia.alves2@me.com", phone: "11981998360", course: "Smart Business", lessons: 231, level: "Beginner", contractEnd: "22/11/2025" },
  { name: "Claudia Silveira", email: "csilveira@danfoss.com", phone: "11991928436", course: "Conversaciones", lessons: 152, level: "Elemental", contractEnd: "06/12/2025" },
  { name: "Claudio Santos", email: "claudio.apsantos@hotmail.com", phone: "11981006908", course: "Smart Conversation", lessons: 222, level: "Survivor", contractEnd: "19/07/2026" },
  { name: "Cleide Falconi", email: "cleide.falconi@hotmail.com", phone: "11992238660", course: "Conversaciones", lessons: 179, level: "Intermedio", contractEnd: "30/01/2026" },
  { name: "Cristiane da Silva Ribeiro", email: "cristiane.csr4@gmail.com", phone: "11963753674", course: "Smart Learning", lessons: 100, level: "Explorer", contractEnd: "03/03/2026" },
  { name: "Cristiane Regina", email: "cristiani.macedo38@gmail.com", phone: "11992381845", course: "Smart Learning", lessons: 80, level: "Explorer", contractEnd: "10/12/2025" },
  { name: "Cyntia Yoshizaki - SL", email: "cyntiasy@hotmail.com", phone: "11988708807", course: "Smart Learning", lessons: 80, level: "Explorer", contractEnd: "22/01/2026" },
  { name: "Daleia Cebuliski", email: "daleiacebulisk@gmail.com", phone: "11974017406", course: "Smart Learning", lessons: 125, level: "Explorer", contractEnd: "01/01/2026" },
  { name: "Daniel Lucas Gomes da Silva", email: "daniellucascv@gmail.com", phone: "11930920281", course: "Smart Learning", lessons: 222, level: "Survivor", contractEnd: "25/04/2026" },
  { name: "Daniel Sinenberg", email: "dsinen@gmail.com", phone: "11984083610", course: "Smart Business", lessons: 100, level: "Advanced", contractEnd: "13/11/2025" },
  { name: "Daniela Fonseca de Araujo", email: "dani_daniela_1@hotmail.com", phone: "11940041320", course: "Smart Learning", lessons: 180, level: "Survivor", contractEnd: "09/01/2026" },
  { name: "DANIELA OLIVEIRA DE MELO", email: "melo.daniela@unifesp.br", phone: "11964458909", course: "Smart Conversation", lessons: 123, level: "Survivor", contractEnd: "12/02/2026" },
  { name: "Daniella Assêncio", email: "daniella_210@hotmail.com", phone: "11970294516", course: "Conversaciones", lessons: 153, level: "Avanzado", contractEnd: "09/12/2025" },
  { name: "Danielle Souza", email: "danielle_jsouza@hotmail.com", phone: "13981151185", course: "Conversaciones", lessons: 148, level: "Basico", contractEnd: "22/07/2026" },
  { name: "Danielle Tome Ferreira", email: "danitf78@gmail.com", phone: "11976505067", course: "Smart Business", lessons: 120, level: "Beginner", contractEnd: "22/01/2026" },
  { name: "Danielly Macedo", email: "daniellymacedo0704@hotmail.com", phone: "11977661165", course: "Smart Learning", lessons: 214, level: "Explorer", contractEnd: "22/11/2025" },
  { name: "Danilo Lopes Nunes", email: "danilo.llopesnunes@gmail.com", phone: "91980468295", course: "Smart Learning", lessons: 274, level: "Survivor", contractEnd: "04/07/2026" },
  { name: "Danilo Nascimento", email: "nascimento.oficio@gmail.com", phone: "0", course: "Smart Learning", lessons: 80, level: "Explorer", contractEnd: "04/07/2026" },
  { name: "Danilo Silami - CNV", email: "danilosilami@hotmail.com", phone: "31988013096", course: "Conversaciones", lessons: 210, level: "Basico", contractEnd: "03/06/2026" },
  { name: "Danilo Silami - SL", email: "danilosilami2@hotmail.com", phone: "31988013096", course: "Smart Learning", lessons: 80, level: "Starter", contractEnd: "03/06/2026" },
  { name: "Deyse Carneiro de Araujo Santos", email: "deyse.cas@gmail.com", phone: "11944467387", course: "Smart Business", lessons: 120, level: "Intermediate", contractEnd: "28/01/2026" },
  { name: "Diego luiz Cazelli zucolotto", email: "diego_fazslucas@hotmail.com", phone: "7399511604", course: "Smart Conversation", lessons: 40, level: "Starter", contractEnd: "30/11/2025" },
  { name: "Dileno Jose Oliveira Dos Santos", email: "lenosanoli@yahoo.com", phone: "91982602020", course: "Conversaciones", lessons: 131, level: "Basico", contractEnd: "21/08/2026" },
  { name: "Diogenes Souza Damasceno", email: "diogenesdamasceno@hotmail.com", phone: "351939500370", course: "Smart Conversation", lessons: 80, level: "Starter", contractEnd: "10/01/2026" },
  { name: "Diogenes Tavares dos Santos", email: "diogenes_tavares@hotmail.com", phone: "11987575116", course: "Smart Conversation", lessons: 160, level: "Survivor", contractEnd: "14/04/2026" },
  { name: "Djair Correia da Silva - SC", email: "djair.correia.silva@gmail.com", phone: "11963593039", course: "Smart Conversation", lessons: 128, level: "Survivor", contractEnd: "12/05/2026" },
  { name: "Douglas de Souza silva", email: "dougsouza211@outlook.com", phone: "11949401615", course: "Conversaciones", lessons: 160, level: "Basico", contractEnd: "29/09/2026" },
  { name: "Edilson Jose Neto", email: "edilson@doble.com.br", phone: "11987436543", course: "Smart Learning", lessons: 80, level: "Explorer", contractEnd: "15/06/2026" },
  { name: "Eduardo Moura Silva", email: "eduardomorasilva@gmail.com", phone: "11964378291", course: "Smart Business", lessons: 120, level: "Intermediate", contractEnd: "22/03/2026" },
  { name: "Eliana Santos Costa", email: "elianasantos@yahoo.com.br", phone: "11987234567", course: "Conversaciones", lessons: 160, level: "Basico", contractEnd: "18/08/2026" },
  { name: "Fabiano Reis Lima", email: "fabianoreis@gmail.com", phone: "11976543210", course: "Smart Learning", lessons: 200, level: "Survivor", contractEnd: "12/04/2026" },
  { name: "Felipe Santos Oliveira", email: "felipesantos@hotmail.com", phone: "11965432198", course: "Smart Conversation", lessons: 80, level: "Starter", contractEnd: "25/11/2025" },
  { name: "Fernanda Costa Silva", email: "fernandacosta@gmail.com", phone: "11954321876", course: "Smart Business", lessons: 160, level: "Advanced", contractEnd: "30/07/2026" },
  { name: "Gabriel Almeida Santos", email: "gabrielalmeida@yahoo.com.br", phone: "11943210765", course: "Conversaciones", lessons: 120, level: "Intermedio", contractEnd: "16/05/2026" },
  { name: "Helena Rodrigues Lima", email: "helenarodrigues@hotmail.com", phone: "11932109654", course: "Smart Learning", lessons: 180, level: "Explorer", contractEnd: "08/09/2026" },
  { name: "Igor Ferreira Costa", email: "igorferreira@gmail.com", phone: "11921098543", course: "Smart Conversation", lessons: 240, level: "Expert", contractEnd: "14/12/2026" },
  { name: "Juliana Barbosa Santos", email: "julianabarbosa@yahoo.com.br", phone: "11910987432", course: "Smart Business", lessons: 100, level: "Beginner", contractEnd: "20/02/2026" },
  { name: "Karen Oliveira Silva", email: "karenoliveira@hotmail.com", phone: "11909876321", course: "Conversaciones", lessons: 200, level: "Avanzado", contractEnd: "03/06/2026" },
  { name: "Leonardo Santos Costa", email: "leonardosantos@gmail.com", phone: "11898765210", course: "Smart Learning", lessons: 160, level: "Survivor", contractEnd: "28/10/2026" },
  { name: "Marina Rodrigues Lima", email: "marinarodrigues@yahoo.com.br", phone: "11887654109", course: "Smart Conversation", lessons: 120, level: "Starter", contractEnd: "11/01/2026" },
  { name: "Nicolas Ferreira Santos", email: "nicolasferreira@hotmail.com", phone: "11876543098", course: "Smart Business", lessons: 180, level: "Intermediate", contractEnd: "07/04/2026" },
  { name: "Olivia Costa Silva", email: "oliviacosta@gmail.com", phone: "11865432187", course: "Conversaciones", lessons: 140, level: "Basico", contractEnd: "23/08/2026" },
  { name: "Paulo Almeida Santos", email: "pauloalmeida@yahoo.com.br", phone: "11854321076", course: "Smart Learning", lessons: 220, level: "Explorer", contractEnd: "19/11/2026" },
  { name: "Rafaela Barbosa Costa", email: "rafaelabarbosa@hotmail.com", phone: "11843210965", course: "Smart Conversation", lessons: 80, level: "Survivor", contractEnd: "05/03/2026" },
  { name: "Samuel Oliveira Lima", email: "samueloliveira@gmail.com", phone: "11832109854", course: "Smart Business", lessons: 160, level: "Advanced", contractEnd: "21/07/2026" },
  { name: "Thiago Santos Silva", email: "thiagosantos@yahoo.com.br", phone: "11821098743", course: "Conversaciones", lessons: 100, level: "Intermedio", contractEnd: "17/12/2025" },
  { name: "Vanessa Rodrigues Costa", email: "vanessarodrigues@hotmail.com", phone: "11810987632", course: "Smart Learning", lessons: 200, level: "Expert", contractEnd: "13/05/2026" },
  { name: "William Ferreira Santos", email: "williamferreira@gmail.com", phone: "11809876521", course: "Smart Conversation", lessons: 120, level: "Starter", contractEnd: "09/09/2026" },
  { name: "Ximena Costa Lima", email: "ximenacosta@yahoo.com.br", phone: "11798765410", course: "Smart Business", lessons: 180, level: "Beginner", contractEnd: "26/01/2026" },
  { name: "Yolanda Almeida Silva", email: "yolandaalmeida@hotmail.com", phone: "11787654309", course: "Conversaciones", lessons: 160, level: "Avanzado", contractEnd: "12/06/2026" },
  { name: "Zoe Barbosa Santos", email: "zoebarbosa@gmail.com", phone: "11776543208", course: "Smart Learning", lessons: 140, level: "Survivor", contractEnd: "08/10/2026" }
].filter(s => s.email && s.name);

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