import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user (default role is STUDENT)
    // Note: isActive field may not exist if schema hasn't been migrated yet
    const userData: any = {
      name,
      email,
      password: hashedPassword,
      role: UserRole.STUDENT,
    };

    // Only add isActive if the field exists in the schema
    try {
      userData.isActive = true;
      const user = await prisma.user.create({
        data: userData
      });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return NextResponse.json(
        { message: 'User created successfully', user: userWithoutPassword },
        { status: 201 }
      );
    } catch (schemaError: any) {
      // If error is about missing column, try without isActive
      if (schemaError.message?.includes('column') || schemaError.message?.includes('isActive')) {
        delete userData.isActive;
        const user = await prisma.user.create({
          data: userData
        });
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json(
          { message: 'User created successfully', user: userWithoutPassword },
          { status: 201 }
        );
      }
      throw schemaError;
    }
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}