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

    // Test creating a single content and exercise
    const topic = await prisma.$queryRaw`
      SELECT id, name FROM "Topic" 
      WHERE level = 'STARTER'::"Level"
      ORDER BY "orderIndex"
      LIMIT 1
    ` as any[]

    if (topic.length === 0) {
      return NextResponse.json({ error: 'No topics found' })
    }

    // Try to create one content item
    let contentId: string | null = null
    try {
      const contentResult = await prisma.$queryRaw`
        INSERT INTO "Content" (
          "id", "title", "description", "type", "phase", 
          "duration", "resourceUrl", "order", "level", "topicId",
          "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid()::text,
          'Debug Test Content',
          'This is a test',
          'video'::"ContentType",
          'pre_class'::"ContentPhase",
          10,
          null,
          999,
          'starter',
          ${topic[0].id},
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        ) RETURNING id
      ` as any[]
      
      contentId = contentResult[0].id
    } catch (error: any) {
      return NextResponse.json({
        step: 'content_creation',
        error: error.message,
        detail: error.detail,
        code: error.code
      })
    }

    // Try to create an exercise with detailed error catching
    try {
      const exerciseContent = {
        question: 'Test question?',
        options: ['A', 'B', 'C', 'D']
      }
      
      const correctAnswer = {
        answer: 'A'
      }
      
      await prisma.$executeRaw`
        INSERT INTO "Exercise" (
          "id", "topicId", "phase", "category", "type",
          "title", "instructions", "content", "correctAnswer",
          "points", "orderIndex", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid()::text,
          ${topic[0].id},
          'PRE_CLASS'::"Phase",
          'READING'::"ExerciseCategory",
          'MULTIPLE_CHOICE'::"ExerciseType",
          'Debug Exercise',
          'Test instructions',
          ${JSON.stringify(exerciseContent)}::jsonb,
          ${JSON.stringify(correctAnswer)}::jsonb,
          10,
          999,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
      `
      
      return NextResponse.json({
        success: true,
        topic: topic[0].name,
        contentId,
        message: 'Content and exercise created successfully'
      })
      
    } catch (error: any) {
      // Try to understand what's wrong
      const checkEnums = await prisma.$queryRaw`
        SELECT 
          enum_range(NULL::"Phase") as phases,
          enum_range(NULL::"ExerciseCategory") as categories,
          enum_range(NULL::"ExerciseType") as types
      ` as any[]
      
      return NextResponse.json({
        step: 'exercise_creation',
        error: error.message,
        detail: error.detail,
        code: error.code,
        stack: error.stack,
        availableEnums: checkEnums[0],
        contentId,
        topicId: topic[0].id
      })
    }

  } catch (error: any) {
    return NextResponse.json({
      step: 'general',
      error: error.message,
      detail: error.detail,
      stack: error.stack
    })
  }
}