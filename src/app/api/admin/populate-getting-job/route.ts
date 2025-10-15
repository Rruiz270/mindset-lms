import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the "Getting a Job" topic in Starter level
    const topic = await prisma.$queryRaw`
      SELECT id, name, "levelId", "orderIndex" 
      FROM "Topic" 
      WHERE name = 'Getting a Job' 
      AND "levelId" = (SELECT id FROM "Level" WHERE name = 'STARTER')
      LIMIT 1
    ` as any[]

    if (topic.length === 0) {
      return NextResponse.json({ error: 'Topic "Getting a Job" not found' }, { status: 404 })
    }

    const topicId = topic[0].id
    console.log('Found topic:', topic[0])

    // Create content items for pre-class, live-class, and post-class
    const contentItems = [
      // Pre-class content
      {
        id: uuidv4(),
        title: 'Pre-Class: Introduction to Job Applications',
        description: 'Watch this video about job interviews and complete the vocabulary exercises',
        type: 'video',
        phase: 'pre_class',
        duration: 15,
        resourceUrl: 'https://www.youtube.com/watch?v=naIkpQ_cIt0',
        orderIndex: 1
      },
      {
        id: uuidv4(),
        title: 'Pre-Class: Job Vocabulary Reading',
        description: 'Read about essential vocabulary for job applications',
        type: 'reading',
        phase: 'pre_class',
        duration: 10,
        orderIndex: 2
      },
      // Live class content
      {
        id: uuidv4(),
        title: 'Live Class: Interactive Activities',
        description: 'Teacher-led activities including discussions, grammar practice, and role-play',
        type: 'exercise',
        phase: 'live_class',
        duration: 60,
        orderIndex: 3
      },
      // Post-class content
      {
        id: uuidv4(),
        title: 'Post-Class: Write Your Cover Letter',
        description: 'Practice writing a cover letter for a job application',
        type: 'exercise',
        phase: 'post_class',
        duration: 20,
        orderIndex: 4
      },
      {
        id: uuidv4(),
        title: 'Post-Class: Interview Practice Recording',
        description: 'Record yourself answering common interview questions',
        type: 'audio',
        phase: 'post_class',
        duration: 15,
        orderIndex: 5
      }
    ]

    // Insert content items
    for (const content of contentItems) {
      await prisma.$executeRaw`
        INSERT INTO "Content" (
          id, "topicId", title, description, type, 
          phase, duration, "resourceUrl", "orderIndex", 
          "createdAt", "updatedAt"
        ) VALUES (
          ${content.id}, ${topicId}, ${content.title}, ${content.description},
          ${content.type}, ${content.phase}, ${content.duration}, 
          ${content.resourceUrl}, ${content.orderIndex},
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `
    }

    // Create exercises
    const exercises = [
      // Pre-class exercises
      {
        id: uuidv4(),
        type: 'MULTIPLE_CHOICE',
        category: 'vocabulary',
        phase: 'PRE_CLASS',
        title: 'Job Vocabulary Quiz',
        instructions: 'Choose the correct definition for each word',
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
        id: uuidv4(),
        type: 'TRUE_FALSE',
        category: 'grammar',
        phase: 'PRE_CLASS',
        title: 'Present Perfect Usage',
        instructions: 'Is this sentence correct?',
        content: {
          statement: '"I have worked here since 2020" is the correct way to talk about ongoing employment.'
        },
        correctAnswer: { answer: 'true' },
        points: 5,
        orderIndex: 2
      },
      {
        id: uuidv4(),
        type: 'GAP_FILL',
        category: 'grammar',
        phase: 'PRE_CLASS',
        title: 'Complete the Sentences',
        instructions: 'Fill in the blanks with the correct words',
        content: {
          text: 'I ___ been working as a teacher ___ five years.',
          gaps: ['have', 'for']
        },
        correctAnswer: { answers: ['have', 'for'] },
        points: 10,
        orderIndex: 3
      },
      // Post-class exercises
      {
        id: uuidv4(),
        type: 'ESSAY',
        category: 'writing',
        phase: 'AFTER_CLASS',
        title: 'Write a Cover Letter',
        instructions: 'Write a cover letter for a job you would like to apply for',
        content: {
          prompt: 'Write a cover letter (minimum 150 words) for a position at a company you admire. Include: why you want the job, your relevant experience, and what you can offer the company.',
          minWords: 150
        },
        correctAnswer: null,
        points: 30,
        orderIndex: 4
      },
      {
        id: uuidv4(),
        type: 'AUDIO_RECORDING',
        category: 'speaking',
        phase: 'AFTER_CLASS',
        title: 'Interview Response',
        instructions: 'Record your answer to this interview question',
        content: {
          prompt: 'Tell me about yourself and why you are interested in this position.',
          minDuration: 60
        },
        correctAnswer: null,
        points: 20,
        orderIndex: 5
      },
      {
        id: uuidv4(),
        type: 'MULTIPLE_CHOICE',
        category: 'vocabulary',
        phase: 'AFTER_CLASS',
        title: 'Interview Vocabulary Review',
        instructions: 'Choose the best response',
        content: {
          question: 'When an interviewer asks "What are your strengths?", you should:',
          options: [
            'Say you don\'t have any weaknesses',
            'List skills relevant to the job with examples',
            'Talk about your personal life',
            'Ask about the salary'
          ]
        },
        correctAnswer: { answer: 'B' },
        points: 10,
        orderIndex: 6
      }
    ]

    // Insert exercises
    for (const exercise of exercises) {
      await prisma.$executeRaw`
        INSERT INTO "Exercise" (
          id, "topicId", type, category, phase, title, 
          instructions, content, "correctAnswer", points, 
          "orderIndex", "createdAt", "updatedAt"
        ) VALUES (
          ${exercise.id}, ${topicId}, ${exercise.type}::"ExerciseType", 
          ${exercise.category}, ${exercise.phase}::"ExercisePhase",
          ${exercise.title}, ${exercise.instructions}, 
          ${JSON.stringify(exercise.content)}::jsonb,
          ${exercise.correctAnswer ? JSON.stringify(exercise.correctAnswer) : null}::jsonb,
          ${exercise.points}, ${exercise.orderIndex},
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `
    }

    // Get counts
    const contentCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "Content" WHERE "topicId" = ${topicId}
    ` as any[]
    
    const exerciseCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "Exercise" WHERE "topicId" = ${topicId}
    ` as any[]

    return NextResponse.json({
      success: true,
      message: 'Successfully populated "Getting a Job" topic',
      stats: {
        contentCreated: contentItems.length,
        exercisesCreated: exercises.length,
        totalContent: parseInt(contentCount[0].count),
        totalExercises: parseInt(exerciseCount[0].count)
      }
    })

  } catch (error: any) {
    console.error('Error populating content:', error)
    return NextResponse.json(
      { error: 'Failed to populate content', details: error.message },
      { status: 500 }
    )
  }
}