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
        // Clear existing content for this topic
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
                await createExercise(exercise, contentId, topic.id)
                totalExercises++
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
      "id", "title", "description", "type", "category", 
      "difficulty", "points", "timeLimit", "content",
      "correctAnswer", "options", "hints", "explanation",
      "orderIndex", "isActive", "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid()::text,
      ${exercise.title},
      ${exercise.description},
      ${exercise.type}::"ExerciseType",
      ${exercise.category}::"ExerciseCategory",
      ${exercise.difficulty}::"Difficulty",
      ${exercise.points},
      ${exercise.timeLimit || null},
      ${JSON.stringify(exercise.content)},
      ${exercise.correctAnswer || null},
      ${exercise.options ? JSON.stringify(exercise.options) : null},
      ${exercise.hints ? JSON.stringify(exercise.hints) : null},
      ${exercise.explanation || null},
      ${exercise.orderIndex},
      true,
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
  
  // Different exercise types based on content type and phase
  if (content.type === 'reading' && content.phase === 'pre_class') {
    exercises.push(
      {
        title: `${content.title} - Comprehension Check`,
        description: 'Test your understanding of the reading material',
        type: 'MULTIPLE_CHOICE',
        category: 'READING',
        difficulty: level === 'STARTER' ? 'EASY' : level === 'SURVIVOR' ? 'MEDIUM' : 'HARD',
        points: 10,
        content: {
          question: `What is the main topic discussed in the ${content.title} reading?`,
          text: 'Choose the best answer based on the reading material.'
        },
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option A',
        orderIndex: 1
      },
      {
        title: `${content.title} - True or False`,
        description: 'Determine if these statements are true or false',
        type: 'TRUE_FALSE',
        category: 'READING',
        difficulty: level === 'STARTER' ? 'EASY' : 'MEDIUM',
        points: 5,
        content: {
          statement: `The reading mentions specific examples of ${topicName.toLowerCase()}.`
        },
        correctAnswer: 'true',
        orderIndex: 2
      }
    )
  }
  
  if (content.type === 'exercise' && content.title.includes('Grammar')) {
    exercises.push(
      {
        title: `${topicName} - Fill in the Gaps`,
        description: 'Complete the sentences with the correct grammar form',
        type: 'GAP_FILL',
        category: 'GRAMMAR',
        difficulty: level === 'STARTER' ? 'EASY' : level === 'SURVIVOR' ? 'MEDIUM' : 'HARD',
        points: 15,
        content: {
          text: `I ___ (go) to the ${topicName.toLowerCase()} yesterday.`,
          gaps: ['went']
        },
        correctAnswer: 'went',
        hints: ['Think about the past tense'],
        orderIndex: 1
      },
      {
        title: `${topicName} - Sentence Construction`,
        description: 'Build grammatically correct sentences',
        type: 'MULTIPLE_CHOICE',
        category: 'GRAMMAR',
        difficulty: level === 'EXPERT' ? 'HARD' : 'MEDIUM',
        points: 10,
        content: {
          question: 'Choose the grammatically correct sentence:'
        },
        options: [
          'She go to shopping yesterday',
          'She went shopping yesterday',
          'She goes to shopping yesterday',
          'She going shopping yesterday'
        ],
        correctAnswer: 'She went shopping yesterday',
        explanation: 'Use simple past tense for completed actions',
        orderIndex: 2
      }
    )
  }
  
  if (content.type === 'exercise' && content.title.includes('Vocabulary')) {
    exercises.push(
      {
        title: `${topicName} - Word Matching`,
        description: 'Match words with their definitions',
        type: 'MATCHING',
        category: 'VOCABULARY',
        difficulty: level === 'STARTER' ? 'EASY' : 'MEDIUM',
        points: 10,
        content: {
          pairs: [
            { word: 'purchase', definition: 'to buy something' },
            { word: 'receipt', definition: 'proof of payment' },
            { word: 'discount', definition: 'reduced price' }
          ]
        },
        orderIndex: 1
      },
      {
        title: `${topicName} - Vocabulary in Context`,
        description: 'Choose the correct word for each sentence',
        type: 'GAP_FILL',
        category: 'VOCABULARY',
        difficulty: 'MEDIUM',
        points: 12,
        content: {
          text: 'I need to ___ some groceries from the store.',
          options: ['purchase', 'sell', 'return', 'exchange']
        },
        correctAnswer: 'purchase',
        orderIndex: 2
      }
    )
  }
  
  if (content.type === 'audio' && content.phase === 'post_class') {
    exercises.push(
      {
        title: `${topicName} - Speaking Assessment`,
        description: 'Record your response to the prompt',
        type: 'AUDIO_RECORDING',
        category: 'SPEAKING',
        difficulty: level === 'STARTER' ? 'EASY' : 'MEDIUM',
        points: 20,
        content: {
          prompt: `Describe your last experience with ${topicName.toLowerCase()}. Use at least 5 vocabulary words from today's lesson.`,
          timeLimit: 120
        },
        timeLimit: 120,
        orderIndex: 1
      }
    )
  }
  
  if (content.phase === 'post_class' && content.title.includes('Writing')) {
    exercises.push(
      {
        title: `${topicName} - Essay Writing`,
        description: 'Write a short essay on the given topic',
        type: 'ESSAY',
        category: 'WRITING',
        difficulty: level === 'EXPERT' ? 'HARD' : 'MEDIUM',
        points: 25,
        content: {
          prompt: `Write about your personal experience with ${topicName.toLowerCase()}. Include an introduction, body, and conclusion.`,
          minWords: level === 'STARTER' ? 100 : level === 'SURVIVOR' ? 150 : 200
        },
        orderIndex: 1
      }
    )
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