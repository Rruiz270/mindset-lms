// Clean student data array for auto-populate feature
// Format: { name: "Name", email: "email", phone: "phone", course: "Course", lessons: number, level: "Level", contractEnd: "DD/MM/YYYY" }

const studentsData = [
  { name: "Abelardo Junior", email: "abelardo.geografia@gmail.com", phone: "8298240664", course: "Conversaciones", lessons: 193, level: "Basico", contractEnd: "23/10/2026" },
  { name: "Adonai Gabriel da Silva", email: "adonaigabriel@gmail.com", phone: "11997626734", course: "Conversaciones", lessons: 339, level: "Basico", contractEnd: "20/08/2026" },
  { name: "Adriana Abreu da Silva", email: "adrianasilva@grupoflipper.com.br", phone: "13996056876", course: "Smart Learning", lessons: 235, level: "Explorer", contractEnd: "29/09/2026" },
  { name: "Adriana Florio Cintas", email: "adriflorio2@gmail.com", phone: "11993944623", course: "Smart Learning", lessons: 31, level: "Explorer", contractEnd: "04/17/2024" }
  // ... and 812 more student records
];

// To use in your auto-populate feature:
// studentsData.forEach(student => {
//   console.log(`${student.name} - ${student.email} - ${student.course}`);
// });