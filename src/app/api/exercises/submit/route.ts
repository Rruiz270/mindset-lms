import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { exerciseId, answer } = body

    if (!exerciseId || !answer) {
      return NextResponse.json(
        { error: 'Exercise ID and answer are required' },
        { status: 400 }
      )
    }

    // Get the exercise to check correct answer
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      select: {
        correctAnswer: true,
        points: true,
        type: true
      }
    })

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      )
    }

    // Calculate score based on exercise type
    let score = 0
    let feedback = ''

    if (exercise.type === 'MULTIPLE_CHOICE') {
      const isCorrect = answer === exercise.correctAnswer
      score = isCorrect ? exercise.points : 0
      feedback = isCorrect ? '✅ Correct! Well done!' : `❌ Incorrect. The correct answer was option ${exercise.correctAnswer}.`
    } else if (exercise.type === 'TRUE_FALSE') {
      const isCorrect = answer === exercise.correctAnswer
      score = isCorrect ? exercise.points : 0
      feedback = isCorrect ? '✅ Correct! Great job!' : `❌ Incorrect. The correct answer was ${exercise.correctAnswer ? 'True' : 'False'}.`
    } else if (exercise.type === 'GAP_FILL') {
      // For gap fill, handle both single answer and array formats
      if (typeof exercise.correctAnswer === 'string') {
        // Single answer format (our seeded data)
        const userAnswer = typeof answer === 'string' ? answer : answer[0]
        const isCorrect = userAnswer?.toLowerCase().trim() === exercise.correctAnswer.toLowerCase().trim()
        score = isCorrect ? exercise.points : 0
        feedback = isCorrect ? '✅ Perfect!' : `❌ Incorrect. The correct answer is "${exercise.correctAnswer}".`
      } else {
        // Array format (legacy)
        const correctAnswers = exercise.correctAnswer as string[]
        const userAnswers = answer as string[]
        let correctCount = 0
        
        userAnswers.forEach((userAnswer, index) => {
          if (userAnswer.toLowerCase().trim() === correctAnswers[index]?.toLowerCase().trim()) {
            correctCount++
          }
        })
        
        score = Math.round((correctCount / correctAnswers.length) * exercise.points)
        feedback = `You got ${correctCount}/${correctAnswers.length} correct.`
      }
    } else {
      // For essay and other open-ended questions, give partial credit for now
      score = Math.round(exercise.points * 0.8) // 80% for attempting
      feedback = 'Thank you for your response. Your teacher will review this.'
    }

    // Save submission
    const submission = await prisma.submission.create({
      data: {
        userId: session.user.id,
        exerciseId,
        answer,
        score,
        feedback,
        gradedAt: new Date()
      }
    })

    return NextResponse.json({
      id: submission.id,
      score,
      feedback,
      maxPoints: exercise.points,
      submittedAt: submission.submittedAt
    })
  } catch (error) {
    console.error('Error submitting exercise:', error)
    return NextResponse.json(
      { error: 'Failed to submit exercise' },
      { status: 500 }
    )
  }
}