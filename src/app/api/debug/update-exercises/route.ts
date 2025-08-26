import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ExerciseType } from '@prisma/client'

// Update existing exercises to use correct types for audio functionality
export async function POST(request: NextRequest) {
  try {
    console.log('Updating exercise types...')

    // Update the speaking exercise to use AUDIO_RECORDING type
    const speakingExercise = await prisma.exercise.findFirst({
      where: {
        category: 'SPEAKING',
        title: 'Best Response'
      }
    })

    if (speakingExercise) {
      await prisma.exercise.update({
        where: { id: speakingExercise.id },
        data: {
          type: ExerciseType.AUDIO_RECORDING,
          title: 'Interview Introduction Recording',
          instructions: 'Record yourself answering this common interview question.',
          content: {
            question: 'How would you introduce yourself in a job interview?',
            prompts: [
              'Hello, my name is [your name]',
              'I am very interested in this position because...',
              'My strongest skills are...',
              'I believe I would be a great fit for this role because...'
            ],
            timeLimit: 60
          }
        }
      })
      console.log('Updated speaking exercise to AUDIO_RECORDING type')
    }

    // Update the listening exercise to include better audio content
    const listeningExercise = await prisma.exercise.findFirst({
      where: {
        category: 'LISTENING',
        title: 'Job Interview Question'
      }
    })

    if (listeningExercise) {
      await prisma.exercise.update({
        where: { id: listeningExercise.id },
        data: {
          type: ExerciseType.AUDIO_QUIZ,
          title: 'Interview Dialogue Listening',
          instructions: 'Listen to the job interview dialogue and answer the question.',
          content: {
            transcript: 'Interviewer: Tell me about yourself and why you want this job. Candidate: Hello, I am a recent graduate with strong communication skills. I am very interested in this position because I enjoy helping customers and I want to learn more about retail.',
            question: 'What does the candidate say about their background?',
            options: [
              'I am a recent graduate with strong communication skills',
              'I have 10 years of experience',
              'I am currently a student',
              'I have worked in retail for many years'
            ]
          }
        }
      })
      console.log('Updated listening exercise content')
    }

    return NextResponse.json({
      success: true,
      message: 'Exercise types updated successfully',
      updated: {
        speaking: !!speakingExercise,
        listening: !!listeningExercise
      }
    })

  } catch (error) {
    console.error('Exercise update error:', error)
    return NextResponse.json(
      { error: 'Failed to update exercises', details: error.message },
      { status: 500 }
    )
  }
}