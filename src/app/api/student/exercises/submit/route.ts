import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { exerciseId, answer, contentId } = await req.json()

    // Get exercise details
    const exercise = await prisma.$queryRaw`
      SELECT 
        id,
        type,
        "correctAnswer",
        points
      FROM "Exercise"
      WHERE id = ${exerciseId}
    ` as any[]

    if (exercise.length === 0) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
    }

    const ex = exercise[0]
    let isCorrect = false
    let score = 0

    // Check answer based on exercise type
    if (ex.type === 'MULTIPLE_CHOICE' || ex.type === 'TRUE_FALSE') {
      isCorrect = answer === ex.correctAnswer?.answer
      score = isCorrect ? ex.points : 0
    } else if (ex.type === 'GAP_FILL') {
      const correctAnswers = ex.correctAnswer?.answers || []
      isCorrect = JSON.stringify(answer) === JSON.stringify(correctAnswers)
      score = isCorrect ? ex.points : 0
    } else if (ex.type === 'ESSAY' || ex.type === 'AUDIO_RECORDING') {
      // These need teacher review
      score = 0 // Will be graded by teacher
    }

    // Check if submission already exists
    const existing = await prisma.$queryRaw`
      SELECT id FROM "Submission"
      WHERE "userId" = ${session.user.id}
      AND "exerciseId" = ${exerciseId}
    ` as any[]

    if (existing.length > 0) {
      // Update existing submission
      await prisma.$executeRaw`
        UPDATE "Submission"
        SET answer = ${JSON.stringify(answer)}::jsonb,
            score = ${score},
            feedback = ${isCorrect ? 'Correct!' : 'Review the correct answer'},
            "submittedAt" = CURRENT_TIMESTAMP
        WHERE "userId" = ${session.user.id}
        AND "exerciseId" = ${exerciseId}
      `
    } else {
      // Create new submission
      await prisma.$executeRaw`
        INSERT INTO "Submission" (
          id, "userId", "exerciseId", answer, 
          score, feedback, "submittedAt", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid()::text,
          ${session.user.id},
          ${exerciseId},
          ${JSON.stringify(answer)}::jsonb,
          ${score},
          ${isCorrect ? 'Correct!' : ex.type === 'ESSAY' || ex.type === 'AUDIO_RECORDING' ? 'Awaiting teacher review' : 'Review the correct answer'},
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
      `
    }

    return NextResponse.json({
      success: true,
      correct: isCorrect,
      score,
      needsReview: ex.type === 'ESSAY' || ex.type === 'AUDIO_RECORDING'
    })

  } catch (error: any) {
    console.error('Error submitting exercise:', error)
    return NextResponse.json(
      { error: 'Failed to submit exercise', details: error.message },
      { status: 500 }
    )
  }
}