// CSV to JavaScript Array Converter for Student Data
// Input format: Full Name;Email;Phone;Course;Total Lessons;Level;Inicio Contrato;Contract End

const fs = require('fs');
const path = require('path');

function parseCSVToStudentArray(csvFilePath) {
    try {
        // Read the CSV file
        const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
        const lines = csvContent.split('\n');
        
        // Skip the header row
        const dataLines = lines.slice(1);
        
        const students = [];
        
        dataLines.forEach((line, index) => {
            // Skip empty lines
            if (!line.trim()) return;
            
            // Split by semicolon
            const fields = line.split(';');
            
            // Ensure we have at least 8 fields
            if (fields.length < 8) return;
            
            const [fullName, email, phone, course, totalLessons, level, inicioContrato, contractEnd] = fields;
            
            // Skip rows without both name and email
            if (!fullName?.trim() || !email?.trim()) {
                console.log(`Skipping row ${index + 2}: Missing name or email`);
                return;
            }
            
            // Parse lessons as number, default to 0 if invalid
            let lessons = parseInt(totalLessons?.trim()) || 0;
            
            // Clean and format the data
            const student = {
                name: fullName.trim(),
                email: email.trim(),
                phone: phone?.trim() || "",
                course: course?.trim() || "",
                lessons: lessons,
                level: level?.trim() || "",
                contractEnd: contractEnd?.trim() || ""
            };
            
            students.push(student);
        });
        
        return students;
    } catch (error) {
        console.error('Error reading CSV file:', error);
        return [];
    }
}

// Process the CSV file
const csvFilePath = '/Users/Raphael/Downloads/3.csv';
const students = parseCSVToStudentArray(csvFilePath);

console.log(`Successfully processed ${students.length} student records.`);
console.log('\nFirst 5 students as example:');
console.log(JSON.stringify(students.slice(0, 5), null, 2));

// Generate the complete JavaScript array code
const jsArrayCode = `// Auto-generated student data array from CSV
// Total students: ${students.length}
// Generated on: ${new Date().toISOString()}

const students = ${JSON.stringify(students, null, 2)};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = students;
}

// For browser usage
if (typeof window !== 'undefined') {
    window.students = students;
}`;

// Write the JavaScript array to a file
const outputPath = '/Users/Raphael/Desktop/mindset-lms/students-data.js';
fs.writeFileSync(outputPath, jsArrayCode, 'utf-8');

console.log(`\nJavaScript array written to: ${outputPath}`);
console.log(`\nTotal students processed: ${students.length}`);

// Display some statistics
const courseStats = {};
const levelStats = {};

students.forEach(student => {
    // Course statistics
    if (student.course) {
        courseStats[student.course] = (courseStats[student.course] || 0) + 1;
    }
    
    // Level statistics
    if (student.level) {
        levelStats[student.level] = (levelStats[student.level] || 0) + 1;
    }
});

console.log('\n--- Statistics ---');
console.log('Courses:', Object.keys(courseStats).length);
console.log('Course distribution:', courseStats);
console.log('\nLevels:', Object.keys(levelStats).length);
console.log('Level distribution:', levelStats);

// Show students with contract end dates
const studentsWithContracts = students.filter(s => s.contractEnd);
console.log(`\nStudents with contract end dates: ${studentsWithContracts.length}/${students.length}`);