import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check Exercise table structure
    const columns = await prisma.$queryRaw`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        udt_name
      FROM information_schema.columns 
      WHERE table_name = 'Exercise' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `

    // Check enums for Exercise table
    const enums = await prisma.$queryRaw`
      SELECT 
        pg_type.typname as enum_name,
        array_agg(pg_enum.enumlabel ORDER BY pg_enum.enumsortorder) as values
      FROM pg_type 
      JOIN pg_enum ON pg_enum.enumtypid = pg_type.oid
      WHERE pg_type.typname IN ('Phase', 'ExerciseType', 'ExerciseCategory')
      GROUP BY pg_type.typname
    `

    // Get a sample topic
    const topics = await prisma.$queryRaw`
      SELECT id, name FROM "Topic" 
      WHERE level = 'STARTER' 
      LIMIT 1
    `
    const topic = (topics as any[])[0]

    // Try to create a simple test exercise
    let testResult = { success: false, error: null, exerciseId: null }
    if (topic) {
      try {
        const result = await prisma.$queryRaw`
          INSERT INTO "Exercise" (
            "id", "topicId", "phase", "category", "type",
            "title", "instructions", "content", "correctAnswer",
            "points", "orderIndex", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid()::text,
            ${topic.id},
            'PRE_CLASS'::\"Phase\",
            'READING'::\"ExerciseCategory\",
            'MULTIPLE_CHOICE'::\"ExerciseType\",
            'Test Exercise',
            'This is a test exercise',
            ${JSON.stringify({ question: 'Test question', options: ['A', 'B', 'C', 'D'] })},
            ${JSON.stringify({ answer: 'A' })},
            10,
            1,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          ) RETURNING id
        `
        testResult = { 
          success: true, 
          error: null, 
          exerciseId: (result as any[])[0].id 
        }
      } catch (error: any) {
        testResult = { 
          success: false, 
          error: {
            message: error.message,
            code: error.code,
            detail: error.detail
          }, 
          exerciseId: null 
        }
      }
    }

    // Count existing exercises
    const exerciseCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "Exercise"
    `

    return NextResponse.json({
      tableStructure: {
        columns: columns,
        enums: enums
      },
      testTopic: topic,
      testExerciseCreation: testResult,
      currentExerciseCount: Number((exerciseCount as any[])[0].count),
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Error testing exercise creation:', error)
    return NextResponse.json(
      { 
        error: 'Failed to test exercise creation',
        details: error.message
      },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Clear all exercises first
    await prisma.$executeRaw`
      DELETE FROM "Exercise"
    `

    // Get first topic
    const topics = await prisma.$queryRaw`
      SELECT id, name FROM "Topic" 
      WHERE level = 'STARTER' 
      ORDER BY "orderIndex" 
      LIMIT 1
    `
    const topic = (topics as any[])[0]

    if (!topic) {
      return NextResponse.json({ error: 'No starter topic found' }, { status: 404 })
    }

    // Create a variety of test exercises
    const exercises = [
      {
        topicId: topic.id,
        phase: 'PRE_CLASS',
        category: 'READING',
        type: 'MULTIPLE_CHOICE',
        title: 'Reading Comprehension Test',
        instructions: 'Choose the best answer',
        content: {
          question: 'What is the main topic?',
          options: ['Option A', 'Option B', 'Option C', 'Option D']
        },
        correctAnswer: { answer: 'A' },
        points: 10,
        orderIndex: 1
      },
      {
        topicId: topic.id,
        phase: 'PRE_CLASS',
        category: 'GRAMMAR',
        type: 'GAP_FILL',
        title: 'Grammar Fill in the Gaps',
        instructions: 'Complete the sentence',
        content: {
          text: 'I ___ to the store yesterday.',
          gaps: [{ position: 1, answer: 'went' }]
        },
        correctAnswer: { gaps: ['went'] },
        points: 15,
        orderIndex: 2
      },
      {
        topicId: topic.id,
        phase: 'AFTER_CLASS',
        category: 'WRITING',
        type: 'ESSAY',
        title: 'Essay Writing Practice',
        instructions: 'Write a short essay',
        content: {
          prompt: 'Write about your experience',
          minWords: 100
        },
        correctAnswer: null,
        points: 25,
        orderIndex: 3
      }
    ]

    let successCount = 0
    const errors = []

    for (const exercise of exercises) {
      try {
        await prisma.$executeRaw`
          INSERT INTO "Exercise" (
            "id", "topicId", "phase", "category", "type",
            "title", "instructions", "content", "correctAnswer",
            "points", "orderIndex", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid()::text,
            ${exercise.topicId},
            ${exercise.phase}::"Phase",
            ${exercise.category}::"ExerciseCategory",
            ${exercise.type}::"ExerciseType",
            ${exercise.title},
            ${exercise.instructions},
            ${JSON.stringify(exercise.content)},
            ${exercise.correctAnswer ? JSON.stringify(exercise.correctAnswer) : null},
            ${exercise.points},
            ${exercise.orderIndex},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
        `
        successCount++
      } catch (error: any) {
        errors.push({
          exercise: exercise.title,
          error: error.message,
          code: error.code
        })
      }
    }

    return NextResponse.json({
      success: true,
      topic: topic.name,
      attempted: exercises.length,
      created: successCount,
      failed: errors.length,
      errors: errors
    })

  } catch (error: any) {
    console.error('Error creating test exercises:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create test exercises',
        details: error.message
      },
      { status: 500 }
    )
  }
}