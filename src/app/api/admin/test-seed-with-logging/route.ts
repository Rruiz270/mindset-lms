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

    // Get first topic only for testing
    const topics = await prisma.$queryRaw`
      SELECT id, name, "orderIndex" 
      FROM "Topic" 
      WHERE level = ${level}::"Level"
      ORDER BY "orderIndex"
      LIMIT 1
    `

    if ((topics as any[]).length === 0) {
      return NextResponse.json({ error: 'No topics found for level ' + level }, { status: 404 })
    }

    const topic = (topics as any[])[0]
    const results = {
      topic: topic.name,
      content: { created: 0, failed: 0, errors: [] as any[] },
      exercises: { created: 0, failed: 0, errors: [] as any[] }
    }

    // Clear existing content for this topic
    await prisma.$executeRaw`
      DELETE FROM "Submission" 
      WHERE "exerciseId" IN (
        SELECT id FROM "Exercise" WHERE "topicId" = ${topic.id}
      )
    `
    await prisma.$executeRaw`DELETE FROM "Exercise" WHERE "topicId" = ${topic.id}`
    await prisma.$executeRaw`DELETE FROM "Content" WHERE "topicId" = ${topic.id}`

    // Create just 3 pieces of content for testing
    const testContent = [
      {
        title: `Introduction to ${topic.name}`,
        description: `Watch this video`,
        type: 'video',
        phase: 'pre_class',
        duration: 10,
        order: 1,
        resourceUrl: 'https://example.com/video'
      },
      {
        title: `${topic.name} - Key Concepts`,
        description: `Read the material`,
        type: 'reading',
        phase: 'pre_class',
        duration: 10,
        order: 2
      },
      {
        title: `Writing Assignment: ${topic.name}`,
        description: `Write an essay`,
        type: 'exercise',
        phase: 'post_class',
        duration: 15,
        order: 3
      }
    ]

    // Create content
    for (const content of testContent) {
      try {
        const result = await prisma.$queryRaw`
          INSERT INTO "Content" (
            "id", "title", "description", "type", "phase", 
            "duration", "resourceUrl", "order", "level", "topicId",
            "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid()::text,
            ${content.title},
            ${content.description},
            ${content.type}::"ContentType",
            ${content.phase}::"ContentPhase",
            ${content.duration},
            ${content.resourceUrl || null},
            ${content.order},
            ${level.toLowerCase()},
            ${topic.id},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          ) RETURNING id
        `
        const contentId = (result as any[])[0].id
        results.content.created++

        // Try to create exercise for this content
        if (content.type === 'video' && content.phase === 'pre_class') {
          try {
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
                'Watch and answer',
                '{"question": "What is the main topic?", "options": ["A", "B", "C", "D"]}'::jsonb,
                '{"answer": "A"}'::jsonb,
                10,
                1,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
              )
            `
            results.exercises.created++
          } catch (exError: any) {
            results.exercises.failed++
            results.exercises.errors.push({
              content: content.title,
              error: exError.message,
              detail: exError.detail || exError.code
            })
          }
        }

        if (content.type === 'reading' && content.phase === 'pre_class') {
          try {
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
                'MULTIPLE_CHOICE'::"ExerciseType",
                'Reading Comprehension',
                'Read and answer',
                '{"question": "What is the main idea?", "options": ["A", "B", "C", "D"]}'::jsonb,
                '{"answer": "A"}'::jsonb,
                10,
                2,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
              )
            `
            results.exercises.created++
          } catch (exError: any) {
            results.exercises.failed++
            results.exercises.errors.push({
              content: content.title,
              error: exError.message,
              detail: exError.detail || exError.code
            })
          }
        }

        if (content.title.includes('Writing') && content.phase === 'post_class') {
          try {
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
                'Essay Writing',
                'Write an essay',
                '{"prompt": "Write about the topic", "minWords": 100}'::jsonb,
                null::jsonb,
                25,
                3,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
              )
            `
            results.exercises.created++
          } catch (exError: any) {
            results.exercises.failed++
            results.exercises.errors.push({
              content: content.title,
              error: exError.message,
              detail: exError.detail || exError.code
            })
          }
        }
      } catch (error: any) {
        results.content.failed++
        results.content.errors.push({
          content: content.title,
          error: error.message,
          detail: error.detail || error.code
        })
      }
    }

    return NextResponse.json(results)

  } catch (error: any) {
    console.error('Test seed error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to test seed',
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    )
  }
}