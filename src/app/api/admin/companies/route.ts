import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// We'll need to add a Company model to the Prisma schema
// For now, let's create a simple structure

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['companyName', 'contactPerson', 'email', 'phone'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // For now, we'll store company information in a simple JSON structure
    // In a full implementation, we'd have a proper Company model
    const companyData = {
      name: data.companyName,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      address: data.address || '',
      industry: data.industry || '',
      employeeCount: data.employeeCount || 0,
      contractType: data.contractType || '',
      notes: data.notes || '',
      registeredAt: new Date(),
      registeredBy: session.user.id
    };

    // TODO: In a real implementation, create a Company model in Prisma
    // For now, we'll just log the data and return success
    console.log('Company registration data:', companyData);

    // In production, you would:
    // const company = await prisma.company.create({ data: companyData });

    return NextResponse.json({ 
      success: true, 
      message: 'Company registered successfully',
      companyData // Temporary - remove in production
    });

  } catch (error) {
    console.error('Error registering company:', error);
    return NextResponse.json({ error: 'Failed to register company' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Fetch companies from database
    // For now, return empty array
    const companies: any[] = [];

    return NextResponse.json(companies);

  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}