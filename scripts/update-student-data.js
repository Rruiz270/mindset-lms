const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Read and parse the Fix up.csv file
function parseCSV(filePath) {
  try {
    const csvContent = fs.readFileSync(filePath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    const students = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const columns = line.split(';');
      
      if (columns.length >= 15) {
        const email = columns[2]?.trim().toLowerCase();
        const phone = columns[3]?.trim();
        const comments = columns[12]?.trim();
        const remainingHours = parseInt(columns[14]?.trim()) || 0;
        
        if (email && email !== 'email') { // Skip header if exists
          students.push({
            email,
            phone: phone || null,
            comments: comments || null,
            remainingHours
          });
        }
      }
    }
    
    return students;
  } catch (error) {
    console.error('Error reading CSV file:', error);
    return [];
  }
}

async function updateStudentData() {
  try {
    console.log('Reading Fix up.csv file...');
    const csvPath = '/Users/Raphael/Downloads/Fix up.csv';
    const studentsData = parseCSV(csvPath);
    
    console.log(`Found ${studentsData.length} students in CSV`);
    
    let updated = 0;
    let notFound = 0;
    let errors = 0;
    
    for (const studentData of studentsData) {
      try {
        const result = await prisma.user.updateMany({
          where: {
            email: studentData.email,
            role: 'STUDENT'
          },
          data: {
            phone: studentData.phone,
            comments: studentData.comments,
            remainingHours: studentData.remainingHours
          }
        });
        
        if (result.count > 0) {
          updated++;
          console.log(`✅ Updated ${studentData.email} - ${studentData.remainingHours} hours`);
        } else {
          notFound++;
          console.log(`❌ Student not found: ${studentData.email}`);
        }
        
      } catch (error) {
        errors++;
        console.error(`Error updating ${studentData.email}:`, error.message);
      }
    }
    
    console.log('\n=== SUMMARY ===');
    console.log(`Total students in CSV: ${studentsData.length}`);
    console.log(`Successfully updated: ${updated}`);
    console.log(`Not found in database: ${notFound}`);
    console.log(`Errors: ${errors}`);
    
  } catch (error) {
    console.error('Script error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  updateStudentData();
}

module.exports = { updateStudentData };