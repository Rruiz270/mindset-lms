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

    const formData = await request.formData()
    const exerciseId = formData.get('exerciseId') as string
    const audioFile = formData.get('audio') as File

    if (!exerciseId || !audioFile) {
      return NextResponse.json(
        { error: 'Exercise ID and audio file are required' },
        { status: 400 }
      )
    }

    // Get the exercise details
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

    // For now, we'll give partial credit for audio submissions
    // In a real system, you would integrate speech recognition and assessment
    const score = Math.round(exercise.points * 0.85) // 85% for completing the recording
    const feedback = '🎤 Audio recording submitted! Your teacher will review your pronunciation and speaking skills.'

    // Convert audio file to base64 for storage (in a real system, you'd use cloud storage)
    const audioBuffer = await audioFile.arrayBuffer()
    const audioBase64 = Buffer.from(audioBuffer).toString('base64')

    // Save submission with audio data
    const submission = await prisma.submission.create({
      data: {
        userId: session.user.id,
        exerciseId,
        answer: {
          type: 'audio',
          data: audioBase64.substring(0, 1000), // Truncate for demo (use cloud storage in production)
          filename: audioFile.name,
          size: audioFile.size
        },
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
      submittedAt: submission.submittedAt,
      type: 'audio'
    })
  } catch (error) {
    console.error('Error submitting audio exercise:', error)
    return NextResponse.json(
      { error: 'Failed to submit audio exercise' },
      { status: 500 }
    )
  }
}