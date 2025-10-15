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

    // Get content counts by type and phase
    const contentStats = await prisma.$queryRaw`
      SELECT 
        type, 
        phase, 
        COUNT(*) as count
      FROM "Content"
      WHERE level = 'starter'
      GROUP BY type, phase
      ORDER BY phase, type
    `

    // Get exercise count
    const exerciseCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "Exercise"
    `

    // Get sample content items that should have exercises
    const eligibleContent = await prisma.$queryRaw`
      SELECT 
        id, title, type, phase, "topicId"
      FROM "Content"
      WHERE level = 'starter'
      AND type IN ('reading', 'video', 'audio')
      AND phase IN ('pre_class', 'post_class')
      LIMIT 10
    `

    // Check if we're creating exercises correctly
    const testExerciseCreation = async () => {
      const sampleContent = (eligibleContent as any[])[0]
      if (!sampleContent) return { error: 'No eligible content found' }

      try {
        const result = await prisma.$queryRaw`
          INSERT INTO "Exercise" (
            "id", "topicId", "phase", "category", "type",
            "title", "instructions", "content", "correctAnswer",
            "points", "orderIndex", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid()::text,
            ${sampleContent.topicId},
            ${sampleContent.phase === 'pre_class' ? 'PRE_CLASS' : 'AFTER_CLASS'}::"Phase",
            'READING'::"ExerciseCategory",
            'MULTIPLE_CHOICE'::"ExerciseType",
            'Debug Test Exercise',
            'This is a debug test',
            ${JSON.stringify({ question: 'Test?' })}::jsonb,
            ${JSON.stringify({ answer: 'A' })}::jsonb,
            10,
            999,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          ) RETURNING id
        `
        return { success: true, id: (result as any[])[0].id }
      } catch (error: any) {
        return { error: error.message, code: error.code }
      }
    }

    const testResult = await testExerciseCreation()

    return NextResponse.json({
      contentStats,
      exerciseCount: Number((exerciseCount as any[])[0].count),
      eligibleContentCount: (eligibleContent as any[]).length,
      eligibleContentSample: eligibleContent,
      testExerciseCreation: testResult,
      analysis: {
        shouldHaveExercisesFor: ['reading in pre_class', 'video in pre_class', 'audio in pre_class', 'writing in post_class'],
        actualExerciseCount: Number((exerciseCount as any[])[0].count)
      }
    })

  } catch (error: any) {
    console.error('Error debugging exercise creation:', error)
    return NextResponse.json(
      { error: 'Failed to debug', details: error.message },
      { status: 500 }
    )
  }
}