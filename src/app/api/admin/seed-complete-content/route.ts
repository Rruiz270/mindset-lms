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

            // Create exercises for appropriate content types
            const exercisesToCreate = getExercisesForContent(content, topic.name)
            
            for (const exerciseData of exercisesToCreate) {
              try {
                await createExercise(exerciseData, contentId, topic.id)
                totalExercises++
              } catch (exerciseError: any) {
                console.error(`Failed to create ${exerciseData.type} exercise:`, exerciseError.message)
                errors.push({
                  content: content.title,
                  exercise: exerciseData.title,
                  error: exerciseError.message
                })
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
      ${JSON.stringify(exercise.content)}::jsonb,
      ${exercise.correctAnswer ? JSON.stringify(exercise.correctAnswer) : null}::jsonb,
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

function getExercisesForContent(content: any, topicName: string) {
  const exercises = []
  
  // Pre-class comprehension exercises
  if (content.phase === 'pre_class') {
    if (content.type === 'reading') {
      exercises.push({
        title: 'Reading Comprehension',
        instructions: 'Answer the questions based on the reading material',
        type: 'MULTIPLE_CHOICE',
        category: 'READING',
        phase: 'PRE_CLASS',
        points: 10,
        content: {
          question: 'What is the main idea of the text?',
          options: [
            'Understanding basic concepts',
            'Learning advanced techniques',
            'Practicing conversation skills',
            'Memorizing vocabulary'
          ]
        },
        correctAnswer: { answer: 'A' },
        orderIndex: 1
      })
      
      exercises.push({
        title: 'Vocabulary Check',
        instructions: 'Select the correct meaning of the highlighted words',
        type: 'MULTIPLE_CHOICE',
        category: 'VOCABULARY',
        phase: 'PRE_CLASS',
        points: 5,
        content: {
          question: 'Choose the correct definition for the vocabulary term',
          options: ['Definition A', 'Definition B', 'Definition C', 'Definition D']
        },
        correctAnswer: { answer: 'B' },
        orderIndex: 2
      })
    }
    
    if (content.type === 'video') {
      exercises.push({
        title: 'Video Comprehension',
        instructions: 'Watch the video and answer the questions',
        type: 'MULTIPLE_CHOICE',
        category: 'LISTENING',
        phase: 'PRE_CLASS',
        points: 10,
        content: {
          question: 'What was the speaker\'s main point?',
          options: [
            'The importance of practice',
            'The history of the topic',
            'Common mistakes to avoid',
            'Advanced techniques'
          ]
        },
        correctAnswer: { answer: 'A' },
        orderIndex: 1
      })
      
      exercises.push({
        title: 'True or False',
        instructions: 'Based on the video, determine if these statements are true or false',
        type: 'TRUE_FALSE',
        category: 'LISTENING',
        phase: 'PRE_CLASS',
        points: 5,
        content: {
          statement: 'The video mentioned three key points about the topic'
        },
        correctAnswer: { answer: true },
        orderIndex: 2
      })
    }
    
    if (content.type === 'audio') {
      exercises.push({
        title: 'Listening Comprehension',
        instructions: 'Listen to the audio and answer the questions',
        type: 'MULTIPLE_CHOICE',
        category: 'LISTENING',
        phase: 'PRE_CLASS',
        points: 10,
        content: {
          question: 'What was the conversation about?',
          options: [
            `Introduction to ${topicName}`,
            'Review of previous lesson',
            'Practice exercises',
            'Homework assignment'
          ]
        },
        correctAnswer: { answer: 'A' },
        orderIndex: 1
      })
    }
  }
  
  // Live class exercises (during class activities)
  if (content.phase === 'live_class' && content.type === 'exercise') {
    if (content.title.includes('Grammar')) {
      exercises.push({
        title: 'Grammar Practice',
        instructions: 'Fill in the blanks with the correct form',
        type: 'GAP_FILL',
        category: 'GRAMMAR',
        phase: 'PRE_CLASS',
        points: 15,
        content: {
          text: 'I ___ (go) to the store yesterday and ___ (buy) some groceries.',
          gaps: ['went', 'bought']
        },
        correctAnswer: { answers: ['went', 'bought'] },
        orderIndex: 1
      })
    }
    
    if (content.title.includes('Vocabulary')) {
      exercises.push({
        title: 'Word Matching',
        instructions: 'Match the words with their definitions',
        type: 'MATCHING',
        category: 'VOCABULARY',
        phase: 'PRE_CLASS',
        points: 10,
        content: {
          pairs: [
            { term: 'Word 1', definition: 'Definition 1' },
            { term: 'Word 2', definition: 'Definition 2' },
            { term: 'Word 3', definition: 'Definition 3' },
            { term: 'Word 4', definition: 'Definition 4' }
          ]
        },
        correctAnswer: {
          matches: [
            { term: 'Word 1', definition: 'Definition 1' },
            { term: 'Word 2', definition: 'Definition 2' },
            { term: 'Word 3', definition: 'Definition 3' },
            { term: 'Word 4', definition: 'Definition 4' }
          ]
        },
        orderIndex: 1
      })
    }
  }
  
  // Post-class exercises
  if (content.phase === 'post_class') {
    if (content.title.includes('Writing')) {
      exercises.push({
        title: 'Essay Writing',
        instructions: `Write a short essay (100-150 words) about ${topicName}`,
        type: 'ESSAY',
        category: 'WRITING',
        phase: 'AFTER_CLASS',
        points: 25,
        content: {
          prompt: `Describe your thoughts on ${topicName} and how it relates to your daily life.`,
          minWords: 100,
          maxWords: 150
        },
        correctAnswer: null,
        orderIndex: 1
      })
    }
    
    if (content.type === 'quiz' && content.title.includes('Grammar')) {
      exercises.push({
        title: 'Grammar Review Quiz',
        instructions: 'Complete the grammar review questions',
        type: 'MULTIPLE_CHOICE',
        category: 'GRAMMAR',
        phase: 'AFTER_CLASS',
        points: 10,
        content: {
          question: 'Which sentence uses the correct grammar structure?',
          options: [
            'I have went to the store',
            'I have gone to the store',
            'I has gone to the store',
            'I have going to the store'
          ]
        },
        correctAnswer: { answer: 'B' },
        orderIndex: 1
      })
      
      exercises.push({
        title: 'Sentence Transformation',
        instructions: 'Transform these sentences as instructed',
        type: 'GAP_FILL',
        category: 'GRAMMAR',
        phase: 'AFTER_CLASS',
        points: 15,
        content: {
          text: 'Change to past tense: She speaks English. → She ___ English.',
          gaps: ['spoke']
        },
        correctAnswer: { answers: ['spoke'] },
        orderIndex: 2
      })
    }
    
    if (content.type === 'audio' && content.title.includes('Speaking')) {
      exercises.push({
        title: 'Speaking Practice',
        instructions: `Record yourself speaking about ${topicName} for 1-2 minutes`,
        type: 'AUDIO_RECORDING',
        category: 'SPEAKING',
        phase: 'AFTER_CLASS',
        points: 20,
        content: {
          prompt: `Talk about ${topicName} using at least 5 new vocabulary words from today's lesson.`,
          minDuration: 60,
          maxDuration: 120
        },
        correctAnswer: null,
        orderIndex: 1
      })
    }
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