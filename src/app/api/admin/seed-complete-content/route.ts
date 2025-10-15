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
    const errors = []

    // For each topic, create comprehensive content
    for (const topic of topics as any[]) {
      try {
        // Clear existing submissions, exercises, and content for this topic
        // First delete submissions that reference exercises for this topic
        await prisma.$executeRaw`
          DELETE FROM "Submission" 
          WHERE "exerciseId" IN (
            SELECT id FROM "Exercise" WHERE "topicId" = ${topic.id}
          )
        `
        await prisma.$executeRaw`
          DELETE FROM "Exercise" WHERE "topicId" = ${topic.id}
        `
        await prisma.$executeRaw`
          DELETE FROM "Content" WHERE "topicId" = ${topic.id}
        `

        // Define content structure based on topic type
        const contentStructure = getContentStructure(topic.name, level)
        
        // Create content items
        for (const content of contentStructure) {
          try {
            const contentId = await createContentItem(content, topic.id, level)
            totalContent++

            // Create associated exercises for appropriate content types
            if (['reading', 'video', 'audio', 'exercise'].includes(content.type)) {
              const exercises = getExercisesForContent(content, topic.name, level)
              for (const exercise of exercises) {
                try {
                  await createExercise(exercise, contentId, topic.id)
                  totalExercises++
                } catch (exerciseError: any) {
                  console.error('Failed to create exercise:', exercise.title, exerciseError.message)
                }
              }
            }
          } catch (error: any) {
            errors.push({
              content: content.title,
              error: error.message
            })
          }
        }
      } catch (error: any) {
        errors.push({
          topic: topic.name,
          error: error.message
        })
      }
    }

    return NextResponse.json({
      success: true,
      level,
      stats: {
        topicsProcessed: (topics as any[]).length,
        contentCreated: totalContent,
        exercisesCreated: totalExercises
      },
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error: any) {
    console.error('Error seeding complete content:', error)
    return NextResponse.json(
      { 
        error: 'Failed to seed content',
        details: error.message
      },
      { status: 500 }
    )
  }
}

async function createContentItem(content: any, topicId: string, level: string) {
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
      ${topicId},
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    ) RETURNING id
  `
  return (result as any[])[0].id
}

async function createExercise(exercise: any, contentId: string, topicId: string) {
  await prisma.$executeRaw`
    INSERT INTO "Exercise" (
      "id", "topicId", "phase", "category", "type",
      "title", "instructions", "content", "correctAnswer",
      "points", "orderIndex", "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid()::text,
      ${topicId},
      ${exercise.phase}::"Phase",
      ${exercise.category}::"ExerciseCategory",
      ${exercise.type}::"ExerciseType",
      ${exercise.title},
      ${exercise.instructions},
      ${JSON.stringify(exercise.content)},
      ${exercise.correctAnswer ? JSON.stringify(exercise.correctAnswer) : null},
      ${exercise.points},
      ${exercise.orderIndex},
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
  `
}

function getContentStructure(topicName: string, level: string) {
  // Base structure that applies to all topics
  const baseStructure = [
    // Pre-class content (30 minutes)
    {
      title: `Introduction to ${topicName}`,
      description: `Watch this introductory video to understand the basics of ${topicName.toLowerCase()}.`,
      type: 'video',
      phase: 'pre_class',
      duration: 10,
      order: 1,
      resourceUrl: `https://example.com/videos/${topicName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-intro`
    },
    {
      title: `${topicName} - Key Concepts`,
      description: `Read about the fundamental concepts and vocabulary related to ${topicName.toLowerCase()}.`,
      type: 'reading',
      phase: 'pre_class',
      duration: 10,
      order: 2
    },
    {
      title: `Listening Practice: ${topicName}`,
      description: `Listen to native speakers using vocabulary and phrases related to ${topicName.toLowerCase()}.`,
      type: 'audio',
      phase: 'pre_class',
      duration: 10,
      order: 3
    },
    // Live class content (60 minutes)
    {
      title: `Warm-up Discussion: ${topicName}`,
      description: `Share your experiences and thoughts about ${topicName.toLowerCase()} with your classmates.`,
      type: 'discussion',
      phase: 'live_class',
      duration: 10,
      order: 1
    },
    {
      title: `Grammar Focus: ${topicName} Structures`,
      description: `Learn and practice grammatical structures commonly used when discussing ${topicName.toLowerCase()}.`,
      type: 'exercise',
      phase: 'live_class',
      duration: 15,
      order: 2
    },
    {
      title: `Vocabulary Building: ${topicName}`,
      description: `Expand your vocabulary with words and phrases essential for ${topicName.toLowerCase()}.`,
      type: 'exercise',
      phase: 'live_class',
      duration: 15,
      order: 3
    },
    {
      title: `Role-Play: ${topicName} Scenarios`,
      description: `Practice real-life situations related to ${topicName.toLowerCase()} through interactive role-play.`,
      type: 'discussion',
      phase: 'live_class',
      duration: 15,
      order: 4
    },
    {
      title: `Wrap-up Quiz: ${topicName}`,
      description: `Test your understanding of today's lesson with a quick quiz.`,
      type: 'quiz',
      phase: 'live_class',
      duration: 5,
      order: 5
    },
    // Post-class content (30 minutes)
    {
      title: `Writing Assignment: ${topicName}`,
      description: `Write a short essay or blog post about your perspective on ${topicName.toLowerCase()}.`,
      type: 'exercise',
      phase: 'post_class',
      duration: 15,
      order: 1
    },
    {
      title: `Grammar Review: ${topicName}`,
      description: `Complete exercises to reinforce the grammar structures learned in class.`,
      type: 'quiz',
      phase: 'post_class',
      duration: 10,
      order: 2
    },
    {
      title: `Speaking Practice: ${topicName}`,
      description: `Record yourself discussing ${topicName.toLowerCase()} using the vocabulary and structures from today's lesson.`,
      type: 'audio',
      phase: 'post_class',
      duration: 5,
      order: 3
    }
  ]

  return baseStructure
}

function getExercisesForContent(content: any, topicName: string, level: string) {
  const exercises = []
  
  // Only create exercises for pre_class and post_class content
  if (content.phase === 'live_class') {
    return exercises // No exercises for live class
  }
  
  // Map content phase to exercise phase
  const getPhase = (contentPhase: string) => {
    return contentPhase === 'pre_class' ? 'PRE_CLASS' : 'AFTER_CLASS'
  }
  
  // Different exercise types based on content type and phase
  if (content.type === 'reading' && content.phase === 'pre_class') {
    exercises.push(
      {
        title: `Comprehension Check`,
        instructions: 'Test your understanding of the reading material. Choose the best answer.',
        type: 'MULTIPLE_CHOICE',
        category: 'READING',
        phase: getPhase(content.phase),
        points: 10,
        content: {
          question: `What is the main topic discussed in "${content.title}"?`,
          options: [
            'Option A: Main concept of the reading',
            'Option B: A different topic', 
            'Option C: Another unrelated topic',
            'Option D: Yet another topic'
          ]
        },
        correctAnswer: { answer: 'A', text: 'Option A: Main concept of the reading' },
        orderIndex: 1
      },
      {
        title: `True or False Question`,
        instructions: 'Determine if this statement is true or false based on the reading.',
        type: 'TRUE_FALSE',
        category: 'READING', 
        phase: getPhase(content.phase),
        points: 5,
        content: {
          statement: `The reading mentions specific examples of ${topicName.toLowerCase()}.`
        },
        correctAnswer: { answer: true },
        orderIndex: 2
      }
    )
  }
  
  // For video content - listening comprehension
  if (content.type === 'video' && content.phase === 'pre_class') {
    exercises.push({
      title: 'Video Comprehension',
      instructions: 'Answer questions about the video',
      type: 'MULTIPLE_CHOICE',
      category: 'LISTENING',
      phase: 'PRE_CLASS',
      points: 10,
      content: {
        question: 'What was the main topic discussed in the video?',
        options: ['Option A', 'Option B', 'Option C', 'Option D']
      },
      correctAnswer: { answer: 'A' },
      orderIndex: 1
    })
  }
  
  // For audio content - listening exercises
  if (content.type === 'audio' && content.phase === 'pre_class') {
    exercises.push({
      title: 'Listening Comprehension',
      instructions: 'Answer questions about the audio',
      type: 'MULTIPLE_CHOICE',
      category: 'LISTENING',
      phase: 'PRE_CLASS',
      points: 10,
      content: {
        question: 'What was the main topic discussed?',
        options: ['Option A', 'Option B', 'Option C', 'Option D']
      },
      correctAnswer: { answer: 'A' },
      orderIndex: 1
    })
  }
  
  // For post-class writing assignments
  if (content.phase === 'post_class' && content.title.includes('Writing')) {
    exercises.push({
      title: 'Essay Writing',
      instructions: 'Write a short essay on the topic',
      type: 'ESSAY',
      category: 'WRITING',
      phase: 'AFTER_CLASS',
      points: 25,
      content: {
        prompt: `Write about ${topicName.toLowerCase()}`,
        minWords: 100
      },
      correctAnswer: null,
      orderIndex: 1
    })
  }
  
  return exercises
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get counts for all levels
    const stats = await prisma.$queryRaw`
      SELECT 
        level,
        COUNT(DISTINCT "Content"."topicId") as topics,
        COUNT(DISTINCT "Content".id) as content_items,
        COUNT(DISTINCT "Exercise".id) as exercises
      FROM "Content"
      LEFT JOIN "Exercise" ON "Exercise".content::jsonb->>'contentId' = "Content".id
      GROUP BY level
      ORDER BY level
    `

    return NextResponse.json({
      currentStats: stats,
      levels: ['STARTER', 'SURVIVOR', 'EXPLORER', 'EXPERT']
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to get content stats', details: error.message },
      { status: 500 }
    )
  }
}