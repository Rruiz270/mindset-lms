import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Check if admin user exists, if not create demo users
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@mindset.com' }
    })
    
    let createdUsers = 0
    
    if (!adminUser) {
      // Create demo users if they don't exist
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@mindset.com',
          password: hashedPassword,
          role: 'ADMIN',
          level: 'STARTER'
        }
      })
      createdUsers++
      
      // Create demo student
      const studentPassword = await bcrypt.hash('student123', 12)
      await prisma.user.create({
        data: {
          name: 'Demo Student',
          email: 'student1@mindset.com',
          password: studentPassword,
          role: 'STUDENT',
          level: 'STARTER'
        }
      })
      createdUsers++
      
      // Create demo teacher
      const teacherPassword = await bcrypt.hash('teacher123', 12)
      await prisma.user.create({
        data: {
          name: 'Demo Teacher',
          email: 'teacher1@mindset.com',
          password: teacherPassword,
          role: 'TEACHER',
          level: 'STARTER'
        }
      })
      createdUsers++
    }
    
    // Get all users for debugging
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        role: true,
        name: true,
        createdAt: true
      }
    })
    
    return NextResponse.json({ 
      status: 'healthy',
      database: 'connected',
      usersCreated: createdUsers,
      totalUsers: allUsers.length,
      users: allUsers
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}