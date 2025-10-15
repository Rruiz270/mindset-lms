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

    // Test basic query first
    try {
      const topics = await prisma.$queryRaw`
        SELECT id, name, "orderIndex" 
        FROM "Topic" 
        WHERE level = ${level}::"Level"
        ORDER BY "orderIndex"
        LIMIT 1
      `
      console.log('Topics found:', topics)
      
      if ((topics as any[]).length === 0) {
        return NextResponse.json({ 
          error: 'No topics found',
          details: 'Query returned no results',
          level 
        })
      }

      const topic = (topics as any[])[0]
      
      // Test content creation
      try {
        const testContent = await prisma.$queryRaw`
          INSERT INTO "Content" (
            "id", "title", "description", "type", "phase", 
            "duration", "order", "level", "topicId",
            "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid()::text,
            'Test Content',
            'Test Description',
            'video'::"ContentType",
            'pre_class'::"ContentPhase",
            10,
            999,
            ${level.toLowerCase()},
            ${topic.id},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          ) RETURNING id
        `
        
        const contentId = (testContent as any[])[0].id
        
        // Test exercise creation
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
              'Test Exercise',
              'Test instructions',
              '{"question": "Test?"}'::jsonb,
              '{"answer": "A"}'::jsonb,
              10,
              999,
              CURRENT_TIMESTAMP,
              CURRENT_TIMESTAMP
            )
          `
          
          // Clean up test data
          await prisma.$executeRaw`DELETE FROM "Exercise" WHERE "orderIndex" = 999`
          await prisma.$executeRaw`DELETE FROM "Content" WHERE "order" = 999`
          
          return NextResponse.json({
            success: true,
            message: 'All tests passed - database operations working correctly',
            topic: topic.name
          })
          
        } catch (exError: any) {
          return NextResponse.json({
            error: 'Exercise creation failed',
            details: exError.message,
            code: exError.code,
            hint: exError.hint || 'Check enum values and foreign key constraints'
          })
        }
        
      } catch (contentError: any) {
        return NextResponse.json({
          error: 'Content creation failed',
          details: contentError.message,
          code: contentError.code
        })
      }
      
    } catch (queryError: any) {
      return NextResponse.json({
        error: 'Topic query failed',
        details: queryError.message,
        code: queryError.code
      })
    }

  } catch (error: any) {
    console.error('Test seed error:', error)
    return NextResponse.json({
      error: 'General error',
      details: error.message,
      stack: error.stack
    })
  }
}