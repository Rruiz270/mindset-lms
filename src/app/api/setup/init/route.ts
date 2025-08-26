import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { UserRole, Level } from '@prisma/client'

// This endpoint initializes the database with sample data
// It will automatically create tables if they don't exist (thanks to Prisma)
export async function POST(request: NextRequest) {
  try {
    // First, let's try to create a simple user to test database connection
    // This will trigger Prisma to create the tables if they don't exist
    
    console.log('Starting database initialization...')
    
    // Check if database is already initialized
    try {
      const existingUser = await prisma.user.findFirst()
      if (existingUser) {
        return NextResponse.json({ message: 'Database already initialized', users: await prisma.user.count() })
      }
    } catch (error) {
      console.log('Tables don\'t exist yet, will be created automatically')
    }

    console.log('Creating admin user...')
    // Create admin user - this should trigger table creation
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.create({
      data: {
        email: 'admin@mindset.com',
        password: adminPassword,
        name: 'Admin User',
        role: UserRole.ADMIN,
      },
    })
    console.log('Admin user created:', admin.email)

    // Create sample teachers
    console.log('Creating teachers...')
    const teacherPassword = await bcrypt.hash('teacher123', 10)
    const teacher1 = await prisma.user.create({
      data: {
        email: 'teacher1@mindset.com',
        password: teacherPassword,
        name: 'Maria Silva',
        role: UserRole.TEACHER,
      },
    })

    const teacher2 = await prisma.user.create({
      data: {
        email: 'teacher2@mindset.com',
        password: teacherPassword,
        name: 'John Smith',
        role: UserRole.TEACHER,
      },
    })

    // Create sample students
    console.log('Creating students...')
    const studentPassword = await bcrypt.hash('student123', 10)
    const student1 = await prisma.user.create({
      data: {
        email: 'student1@mindset.com',
        password: studentPassword,
        name: 'Carlos Oliveira',
        role: UserRole.STUDENT,
        level: Level.STARTER,
      },
    })

    const student2 = await prisma.user.create({
      data: {
        email: 'student2@mindset.com',
        password: studentPassword,
        name: 'Julia Santos',
        role: UserRole.STUDENT,
        level: Level.SURVIVOR,
      },
    })

    const student3 = await prisma.user.create({
      data: {
        email: 'student3@mindset.com',
        password: studentPassword,
        name: 'Pedro Costa',
        role: UserRole.STUDENT,
        level: Level.EXPLORER,
      },
    })

    const student4 = await prisma.user.create({
      data: {
        email: 'student4@mindset.com',
        password: studentPassword,
        name: 'Isabella Rodriguez',
        role: UserRole.STUDENT,
        level: Level.EXPERT,
      },
    })

    // Create packages for students
    console.log('Creating student packages...')
    const currentDate = new Date()
    const students = [student1, student2, student3, student4]
    
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

    // Create some sample topics
    console.log('Creating sample topics...')
    const sampleTopics = [
      { name: "Work: Getting a Job", level: Level.STARTER, orderIndex: 1 },
      { name: "Work: Getting to Work", level: Level.STARTER, orderIndex: 2 },
      { name: "Work: Calling in Sick", level: Level.STARTER, orderIndex: 3 },
      { name: "Teacher of the Year", level: Level.SURVIVOR, orderIndex: 1 },
      { name: "On the Job", level: Level.SURVIVOR, orderIndex: 2 },
      { name: "Living a Healthy Life", level: Level.SURVIVOR, orderIndex: 3 },
      { name: "Yes, We Can!", level: Level.EXPLORER, orderIndex: 1 },
      { name: "You Are What You Eat", level: Level.EXPLORER, orderIndex: 2 },
      { name: "Let's Take a Selfie!", level: Level.EXPLORER, orderIndex: 3 },
      { name: "Girl Power", level: Level.EXPERT, orderIndex: 1 },
      { name: "Make Up Your Mind", level: Level.EXPERT, orderIndex: 2 },
      { name: "Child Labor", level: Level.EXPERT, orderIndex: 3 },
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

    console.log('Database initialization completed!')

    return NextResponse.json({
      message: 'Database initialized successfully! 🎉',
      created: {
        admin: 1,
        teachers: 2,
        students: 4,
        packages: 4,
        topics: 12
      },
      loginAccounts: {
        admin: 'admin@mindset.com / admin123',
        teacher: 'teacher1@mindset.com / teacher123',
        students: [
          'student1@mindset.com / student123 (STARTER)',
          'student2@mindset.com / student123 (SURVIVOR)',
          'student3@mindset.com / student123 (EXPLORER)',
          'student4@mindset.com / student123 (EXPERT)'
        ]
      }
    })
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      { message: 'Database initialization failed', error: error.message },
      { status: 500 }
    )
  }
}