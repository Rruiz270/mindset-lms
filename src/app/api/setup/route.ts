import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { UserRole, Level } from '@prisma/client'

// This is a one-time setup endpoint to initialize the database
export async function POST(request: NextRequest) {
  try {
    // Check if already initialized
    const existingUser = await prisma.user.findFirst()
    if (existingUser) {
      return NextResponse.json({ message: 'Database already initialized' })
    }

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.create({
      data: {
        email: 'admin@mindset.com',
        password: adminPassword,
        name: 'Admin User',
        role: UserRole.ADMIN,
      },
    })

    // Create sample teachers
    const teacherPassword = await bcrypt.hash('teacher123', 10)
    const teachers = await Promise.all([
      prisma.user.create({
        data: {
          email: 'teacher1@mindset.com',
          password: teacherPassword,
          name: 'Maria Silva',
          role: UserRole.TEACHER,
        },
      }),
      prisma.user.create({
        data: {
          email: 'teacher2@mindset.com',
          password: teacherPassword,
          name: 'John Smith',
          role: UserRole.TEACHER,
        },
      }),
    ])

    // Create sample students
    const studentPassword = await bcrypt.hash('student123', 10)
    const students = await Promise.all([
      prisma.user.create({
        data: {
          email: 'student1@mindset.com',
          password: studentPassword,
          name: 'Carlos Oliveira',
          role: UserRole.STUDENT,
          level: Level.STARTER,
        },
      }),
      prisma.user.create({
        data: {
          email: 'student2@mindset.com',
          password: studentPassword,
          name: 'Julia Santos',
          role: UserRole.STUDENT,
          level: Level.SURVIVOR,
        },
      }),
    ])

    // Create packages for students
    const currentDate = new Date()
    for (const student of students) {
      await prisma.package.create({
        data: {
          userId: student.id,
          totalLessons: 80,
          usedLessons: 0,
          remainingLessons: 80,
          validFrom: currentDate,
          validUntil: new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate()),
        },
      })
    }

    // Create sample topics (just a few to test)
    const sampleTopics = [
      { name: "Work: Getting a Job", level: Level.STARTER, orderIndex: 1 },
      { name: "Teacher of the Year", level: Level.SURVIVOR, orderIndex: 1 },
      { name: "Yes, We Can!", level: Level.EXPLORER, orderIndex: 1 },
      { name: "Girl Power", level: Level.EXPERT, orderIndex: 1 },
    ]

    for (const topic of sampleTopics) {
      await prisma.topic.create({
        data: {
          name: topic.name,
          level: topic.level,
          orderIndex: topic.orderIndex,
          description: `Learn about ${topic.name.toLowerCase()} in this interactive lesson.`,
        },
      })
    }

    return NextResponse.json({
      message: 'Database initialized successfully!',
      users: {
        admin: admin.email,
        teachers: teachers.map(t => t.email),
        students: students.map(s => s.email)
      }
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { message: 'Setup failed', error: error.message },
      { status: 500 }
    )
  }
}