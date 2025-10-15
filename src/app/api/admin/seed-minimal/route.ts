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

    const { level = 'STARTER' } = await req.json()

    // Get all topics for the specified level
    const topics = await prisma.$queryRaw`
      SELECT id, name, "orderIndex" 
      FROM "Topic" 
      WHERE level = ${level}::"Level"
      ORDER BY "orderIndex"
    `

    if ((topics as any[]).length === 0) {
      return NextResponse.json({ error: 'No topics found for level ' + level }, { status: 404 })
    }

    let totalContent = 0
    let totalExercises = 0

    // For each topic, create minimal content
    for (const topic of topics as any[]) {
      // Clear existing content
      await prisma.$executeRaw`
        DELETE FROM "Submission" 
        WHERE "exerciseId" IN (
          SELECT id FROM "Exercise" WHERE "topicId" = ${topic.id}
        )
      `
      await prisma.$executeRaw`DELETE FROM "Exercise" WHERE "topicId" = ${topic.id}`
      await prisma.$executeRaw`DELETE FROM "Content" WHERE "topicId" = ${topic.id}`

      // Create minimal content structure
      const contentItems = [
        {
          title: `Introduction to ${topic.name}`,
          type: 'video',
          phase: 'pre_class'
        },
        {
          title: `${topic.name} Reading`,
          type: 'reading',
          phase: 'pre_class'
        },
        {
          title: `${topic.name} Discussion`,
          type: 'discussion',
          phase: 'live_class'
        },
        {
          title: `${topic.name} Writing`,
          type: 'exercise',
          phase: 'post_class'
        }
      ]

      let order = 1
      for (const content of contentItems) {
        try {
          // Create content
          const result = await prisma.$queryRaw`
            INSERT INTO "Content" (
              "id", "title", "description", "type", "phase", 
              "duration", "order", "level", "topicId",
              "createdAt", "updatedAt"
            ) VALUES (
              gen_random_uuid()::text,
              ${content.title},
              'Content description',
              ${content.type}::"ContentType",
              ${content.phase}::"ContentPhase",
              10,
              ${order++},
              ${level.toLowerCase()},
              ${topic.id},
              CURRENT_TIMESTAMP,
              CURRENT_TIMESTAMP
            ) RETURNING id
          `
          totalContent++
          const contentId = (result as any[])[0].id

          // Create one exercise per content type
          if (content.type === 'video' && content.phase === 'pre_class') {
            await prisma.$executeRaw`
              INSERT INTO "Exercise" (
                "id", "topicId", "phase", "category", "type",
                "title", "instructions", "content", "correctAnswer",
                "points", "orderIndex", "createdAt", "updatedAt"
              ) VALUES (
                gen_random_uuid()::text,
                ${topic.id},
                'PRE_CLASS'::"Phase",
                'LISTENING'::"ExerciseCategory",
                'MULTIPLE_CHOICE'::"ExerciseType",
                'Video Comprehension',
                'Answer the question',
                '{"question": "What is the main topic?", "options": ["Option A", "Option B", "Option C", "Option D"]}'::jsonb,
                '{"answer": "A"}'::jsonb,
                10,
                1,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
              )
            `
            totalExercises++
          }

          if (content.type === 'reading' && content.phase === 'pre_class') {
            await prisma.$executeRaw`
              INSERT INTO "Exercise" (
                "id", "topicId", "phase", "category", "type",
                "title", "instructions", "content", "correctAnswer",
                "points", "orderIndex", "createdAt", "updatedAt"
              ) VALUES (
                gen_random_uuid()::text,
                ${topic.id},
                'PRE_CLASS'::"Phase",
                'READING'::"ExerciseCategory",
                'TRUE_FALSE'::"ExerciseType",
                'Reading Check',
                'True or False',
                '{"statement": "The reading covered important concepts"}'::jsonb,
                '{"answer": true}'::jsonb,
                5,
                2,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
              )
            `
            totalExercises++
          }

          if (content.phase === 'post_class' && content.title.includes('Writing')) {
            await prisma.$executeRaw`
              INSERT INTO "Exercise" (
                "id", "topicId", "phase", "category", "type",
                "title", "instructions", "content", "correctAnswer",
                "points", "orderIndex", "createdAt", "updatedAt"
              ) VALUES (
                gen_random_uuid()::text,
                ${topic.id},
                'AFTER_CLASS'::"Phase",
                'WRITING'::"ExerciseCategory",
                'ESSAY'::"ExerciseType",
                'Writing Assignment',
                'Write a short essay',
                '{"prompt": "Write about what you learned", "minWords": 50}'::jsonb,
                null::jsonb,
                20,
                3,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
              )
            `
            totalExercises++
          }
        } catch (error: any) {
          console.error('Error creating content/exercise:', error.message)
        }
      }
    }

    return NextResponse.json({
      success: true,
      level,
      stats: {
        topicsProcessed: (topics as any[]).length,
        contentCreated: totalContent,
        exercisesCreated: totalExercises
      }
    })

  } catch (error: any) {
    console.error('Error in minimal seed:', error)
    return NextResponse.json(
      { 
        error: 'Failed to seed content',
        details: error.message
      },
      { status: 500 }
    )
  }
}