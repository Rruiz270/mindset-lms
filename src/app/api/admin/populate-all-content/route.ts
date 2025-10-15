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

    // Get the "Getting a Job" topic for Starter level as a test
    const topic = await prisma.$queryRaw`
      SELECT t.id, t.name, l.name as "levelName"
      FROM "Topic" t
      JOIN "Level" l ON t."levelId" = l.id
      WHERE t.name = 'Getting a Job' 
      AND l.name = 'STARTER'
      LIMIT 1
    ` as any[]

    if (topic.length === 0) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    const topicId = topic[0].id
    let exercisesCreated = 0

    // Create simple exercises that work
    const exercises = [
      {
        type: 'MULTIPLE_CHOICE',
        category: 'vocabulary',
        phase: 'PRE_CLASS',
        title: 'Job Vocabulary Quiz',
        instructions: 'Choose the correct definition',
        content: {
          question: 'What does "qualifications" mean?',
          options: [
            'The salary you want',
            'The skills and experience you have',
            'The hours you can work',
            'The location of the job'
          ]
        },
        correctAnswer: { answer: 'B' },
        points: 10,
        orderIndex: 1
      },
      {
        type: 'TRUE_FALSE',
        category: 'grammar',
        phase: 'PRE_CLASS',
        title: 'Grammar Check',
        instructions: 'Is this sentence correct?',
        content: {
          statement: 'I have worked here since 2020.'
        },
        correctAnswer: { answer: 'true' },
        points: 5,
        orderIndex: 2
      },
      {
        type: 'ESSAY',
        category: 'writing',
        phase: 'AFTER_CLASS',
        title: 'Write a Cover Letter',
        instructions: 'Write a short cover letter',
        content: {
          prompt: 'Write a cover letter for a job you would like.',
          minWords: 100
        },
        correctAnswer: null,
        points: 20,
        orderIndex: 3
      }
    ]

    // Insert exercises one by one
    for (const ex of exercises) {
      try {
        const id = `ex_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
        
        await prisma.$executeRaw`
          INSERT INTO "Exercise" (
            id, "topicId", type, category, phase, title,
            instructions, content, "correctAnswer", points,
            "orderIndex", "createdAt", "updatedAt"
          ) VALUES (
            ${id}, ${topicId}, ${ex.type}::"ExerciseType",
            ${ex.category}, ${ex.phase}::"ExercisePhase",
            ${ex.title}, ${ex.instructions},
            ${JSON.stringify(ex.content)}::jsonb,
            ${ex.correctAnswer ? JSON.stringify(ex.correctAnswer) : null}::jsonb,
            ${ex.points}, ${ex.orderIndex},
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
        `
        exercisesCreated++
      } catch (err) {
        console.error('Error creating exercise:', err)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${exercisesCreated} exercises for Getting a Job topic`,
      stats: {
        levels: 1,
        topics: 1,
        exercises: exercisesCreated
      }
    })

  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to populate content', details: error.message },
      { status: 500 }
    )
  }
}