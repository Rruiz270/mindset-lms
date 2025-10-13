import { NextRequest, NextResponse } from 'next/server';

function parseCSV(text: string): any[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows = [];
  
  // Column mapping for Portuguese/English
  const columnMap: Record<string, string> = {
    'Nome': 'Full Name',
    'Student Name': 'Full Name',
    'Name': 'Full Name',
    'E-mail': 'Email',
    'Email': 'Email',
    'Telefone': 'Phone',
    'Phone': 'Phone',
    'Nível': 'CEFR Level',
    'Level': 'CEFR Level',
    'CEFR Level': 'CEFR Level',
    'Aulas': 'Total Lessons',
    'Lessons': 'Total Lessons',
    'Total Lessons': 'Total Lessons',
    'Classes': 'Total Lessons',
    'Fim de Contrato': 'Contract End',
    'Contract End': 'Contract End',
    'Data Fim': 'Contract End',
    'End Date': 'Contract End'
  };
  
  for (let i = 1; i < Math.min(lines.length, 6); i++) { // Only first 5 rows for testing
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    const row: any = {};
    
    headers.forEach((header, index) => {
      const mappedHeader = columnMap[header] || header;
      row[mappedHeader] = values[index] || '';
    });
    
    rows.push(row);
  }
  
  return rows;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' });
    }

    const text = await file.text();
    const lines = text.trim().split('\n');
    const headers = lines[0] ? lines[0].split(',').map(h => h.trim().replace(/"/g, '')) : [];
    const students = parseCSV(text);
    
    return NextResponse.json({
      success: true,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type
      },
      csvInfo: {
        totalLines: lines.length,
        headers: headers,
        firstFewRows: students.slice(0, 3)
      },
      rawText: text.substring(0, 500) + '...' // First 500 chars
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}