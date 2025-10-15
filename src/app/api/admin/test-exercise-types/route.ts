import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First get a topic to work with
    const topics = await prisma.$queryRaw`
      SELECT id, name FROM "Topic" 
      WHERE level = 'STARTER'::\"Level\"
      ORDER BY "orderIndex"
      LIMIT 1
    `
    
    if ((topics as any[]).length === 0) {
      return NextResponse.json({ error: 'No topics found' }, { status: 404 })
    }

    const topic = (topics as any[])[0]
    const errors = []
    const successes = []

    // Test each exercise type
    const testExercises = [
      {
        type: 'MULTIPLE_CHOICE',
        category: 'READING',
        phase: 'PRE_CLASS',
        title: 'Test Multiple Choice',
        instructions: 'Choose the correct answer',
        content: { question: 'Test?', options: ['A', 'B', 'C', 'D'] },
        correctAnswer: { answer: 'A' },
        points: 10
      },
      {
        type: 'TRUE_FALSE',
        category: 'READING',
        phase: 'PRE_CLASS',
        title: 'Test True/False',
        instructions: 'Is this statement true or false?',
        content: { statement: 'This is a test' },
        correctAnswer: { answer: true },
        points: 5
      },
      {
        type: 'GAP_FILL',
        category: 'GRAMMAR',
        phase: 'PRE_CLASS',
        title: 'Test Gap Fill',
        instructions: 'Fill in the blanks',
        content: { text: 'This ___ a test.', gaps: ['is'] },
        correctAnswer: { answers: ['is'] },
        points: 10
      },
      {
        type: 'ESSAY',
        category: 'WRITING',
        phase: 'AFTER_CLASS',
        title: 'Test Essay',
        instructions: 'Write an essay',
        content: { prompt: 'Write about testing', minWords: 50 },
        correctAnswer: null,
        points: 25
      },
      {
        type: 'AUDIO_RECORDING',
        category: 'SPEAKING',
        phase: 'AFTER_CLASS',
        title: 'Test Audio',
        instructions: 'Record yourself',
        content: { prompt: 'Speak for 30 seconds', minDuration: 30 },
        correctAnswer: null,
        points: 20
      },
      {
        type: 'MATCHING',
        category: 'VOCABULARY',
        phase: 'PRE_CLASS',
        title: 'Test Matching',
        instructions: 'Match the pairs',
        content: {
          pairs: [
            { term: 'A', definition: '1' },
            { term: 'B', definition: '2' }
          ]
        },
        correctAnswer: {
          matches: [
            { term: 'A', definition: '1' },
            { term: 'B', definition: '2' }
          ]
        },
        points: 10
      }
    ]

    // Clear existing test exercises
    await prisma.$executeRaw`
      DELETE FROM "Exercise" WHERE title LIKE 'Test %'
    `

    // Try creating each exercise
    for (const [index, exercise] of testExercises.entries()) {
      try {
        await prisma.$executeRaw`
          INSERT INTO "Exercise" (
            "id", "topicId", "phase", "category", "type",
            "title", "instructions", "content", "correctAnswer",
            "points", "orderIndex", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid()::text,
            ${topic.id},
            ${exercise.phase}::"Phase",
            ${exercise.category}::"ExerciseCategory",
            ${exercise.type}::"ExerciseType",
            ${exercise.title},
            ${exercise.instructions},
            ${JSON.stringify(exercise.content)}::jsonb,
            ${exercise.correctAnswer ? JSON.stringify(exercise.correctAnswer) : null}::jsonb,
            ${exercise.points},
            ${index + 1},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
        `
        successes.push({
          type: exercise.type,
          category: exercise.category,
          phase: exercise.phase
        })
      } catch (error: any) {
        errors.push({
          exercise: exercise.type,
          error: error.message,
          detail: error.detail || error.code
        })
      }
    }

    return NextResponse.json({
      success: true,
      topic: topic.name,
      created: successes.length,
      failed: errors.length,
      successes,
      errors
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to test exercise types', details: error.message },
      { status: 500 }
    )
  }
}