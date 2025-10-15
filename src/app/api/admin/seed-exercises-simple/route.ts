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

    // Get first starter topic
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

    // Clear existing exercises for this topic
    await prisma.$executeRaw`
      DELETE FROM "Submission" 
      WHERE "exerciseId" IN (
        SELECT id FROM "Exercise" WHERE "topicId" = ${topic.id}
      )
    `
    await prisma.$executeRaw`
      DELETE FROM "Exercise" WHERE "topicId" = ${topic.id}
    `

    // Create simple exercises
    const exercises = [
      {
        id: 'ex1',
        topicId: topic.id,
        phase: 'PRE_CLASS',
        category: 'READING',
        type: 'MULTIPLE_CHOICE',
        title: 'Reading Comprehension',
        instructions: 'Choose the best answer',
        content: {
          question: 'What is the main idea?',
          options: ['Option A', 'Option B', 'Option C', 'Option D']
        },
        correctAnswer: { answer: 'A' },
        points: 10,
        orderIndex: 1
      },
      {
        id: 'ex2',
        topicId: topic.id,
        phase: 'PRE_CLASS',
        category: 'GRAMMAR',
        type: 'GAP_FILL',
        title: 'Fill in the Gaps',
        instructions: 'Complete the sentence',
        content: {
          text: 'I ___ to work every day.',
          gaps: [{ position: 1, answer: 'go' }]
        },
        correctAnswer: { gaps: ['go'] },
        points: 15,
        orderIndex: 2
      },
      {
        id: 'ex3',
        topicId: topic.id,
        phase: 'AFTER_CLASS',
        category: 'WRITING',
        type: 'ESSAY',
        title: 'Essay Writing',
        instructions: 'Write about your experience',
        content: {
          prompt: 'Describe your daily routine',
          minWords: 100
        },
        correctAnswer: null,
        points: 20,
        orderIndex: 3
      }
    ]

    let created = 0
    const errors = []

    // Try each exercise individually
    for (const ex of exercises) {
      try {
        await prisma.$executeRaw`
          INSERT INTO "Exercise" (
            "id", "topicId", "phase", "category", "type",
            "title", "instructions", "content", "correctAnswer",
            "points", "orderIndex", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid()::text,
            ${ex.topicId},
            ${ex.phase}::"Phase",
            ${ex.category}::"ExerciseCategory",
            ${ex.type}::"ExerciseType",
            ${ex.title},
            ${ex.instructions},
            ${JSON.stringify(ex.content)}::jsonb,
            ${ex.correctAnswer ? JSON.stringify(ex.correctAnswer) : null}::jsonb,
            ${ex.points},
            ${ex.orderIndex},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
        `
        created++
      } catch (error: any) {
        errors.push({
          exercise: ex.title,
          error: error.message,
          code: error.code,
          detail: error.detail
        })
      }
    }

    // Get exercise count
    const count = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "Exercise" WHERE "topicId" = ${topic.id}
    `

    return NextResponse.json({
      topic: topic.name,
      attempted: exercises.length,
      created,
      failed: errors.length,
      totalExercises: Number((count as any[])[0].count),
      errors
    })

  } catch (error: any) {
    console.error('Error seeding exercises:', error)
    return NextResponse.json(
      { 
        error: 'Failed to seed exercises',
        details: error.message
      },
      { status: 500 }
    )
  }
}