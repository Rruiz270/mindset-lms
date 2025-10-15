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

    // Get all topics organized by level
    const topics = await prisma.$queryRaw`
      SELECT 
        t.id,
        t.name,
        t."orderIndex",
        l.name as "levelName"
      FROM "Topic" t
      JOIN "Level" l ON t."levelId" = l.id
      ORDER BY l."orderIndex", t."orderIndex"
    ` as any[]

    let totalExercises = 0
    let totalContent = 0
    const processedLevels = new Set<string>()

    // Define exercise templates for different categories
    const exerciseTemplates = {
      vocabulary: [
        {
          type: 'MULTIPLE_CHOICE',
          phase: 'PRE_CLASS',
          title: 'Vocabulary Recognition',
          instructions: 'Choose the correct definition',
          points: 10,
          generator: (topic: string) => ({
            content: {
              question: `What does the word related to "${topic}" mean in this context?`,
              options: [
                'Option A: Common meaning',
                'Option B: Correct meaning',
                'Option C: Similar but wrong',
                'Option D: Unrelated meaning'
              ]
            },
            correctAnswer: { answer: 'B' }
          })
        },
        {
          type: 'MATCHING',
          phase: 'PRE_CLASS',
          title: 'Word Matching',
          instructions: 'Match the words with their definitions',
          points: 15,
          generator: (topic: string) => ({
            content: {
              pairs: [
                { term: 'Term 1', definition: 'Definition 1' },
                { term: 'Term 2', definition: 'Definition 2' },
                { term: 'Term 3', definition: 'Definition 3' }
              ]
            },
            correctAnswer: null
          })
        }
      ],
      grammar: [
        {
          type: 'GAP_FILL',
          phase: 'PRE_CLASS',
          title: 'Complete the Sentence',
          instructions: 'Fill in the blanks with the correct form',
          points: 10,
          generator: (topic: string) => ({
            content: {
              text: 'I ___ working on this project ___ last month.',
              gaps: ['have been', 'since']
            },
            correctAnswer: { answers: ['have been', 'since'] }
          })
        },
        {
          type: 'TRUE_FALSE',
          phase: 'PRE_CLASS',
          title: 'Grammar Check',
          instructions: 'Is this sentence grammatically correct?',
          points: 5,
          generator: (topic: string) => ({
            content: {
              statement: 'This sentence demonstrates correct grammar usage.'
            },
            correctAnswer: { answer: 'true' }
          })
        }
      ],
      listening: [
        {
          type: 'MULTIPLE_CHOICE',
          phase: 'PRE_CLASS',
          title: 'Listening Comprehension',
          instructions: 'Listen to the audio and answer the question',
          points: 15,
          generator: (topic: string) => ({
            content: {
              audioUrl: 'https://example.com/audio.mp3',
              question: 'What was the main topic discussed?',
              options: [
                'The speaker\'s experience',
                'General information',
                'Future plans',
                'Past events'
              ]
            },
            correctAnswer: { answer: 'A' }
          })
        }
      ],
      writing: [
        {
          type: 'ESSAY',
          phase: 'AFTER_CLASS',
          title: 'Short Essay',
          instructions: 'Write a short essay on the given topic',
          points: 25,
          generator: (topic: string) => ({
            content: {
              prompt: `Write about your experience with ${topic}. Include specific examples and personal reflections.`,
              minWords: 150
            },
            correctAnswer: null
          })
        }
      ],
      speaking: [
        {
          type: 'AUDIO_RECORDING',
          phase: 'AFTER_CLASS',
          title: 'Speaking Practice',
          instructions: 'Record yourself speaking about the topic',
          points: 20,
          generator: (topic: string) => ({
            content: {
              prompt: `Talk about ${topic} for 1-2 minutes. Include your personal experience and opinion.`,
              minDuration: 60
            },
            correctAnswer: null
          })
        }
      ]
    }

    // Process each topic
    for (const topic of topics) {
      processedLevels.add(topic.levelName)
      
      // Create content items
      const contentItems = [
        {
          id: crypto.randomUUID(),
          topicId: topic.id,
          title: `Pre-Class: Introduction to ${topic.name}`,
          description: `Watch the introductory video and complete the vocabulary exercises`,
          type: 'video',
          phase: 'pre_class',
          duration: 15,
          resourceUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          orderIndex: 1
        },
        {
          id: crypto.randomUUID(),
          topicId: topic.id,
          title: `Live Class: ${topic.name} Activities`,
          description: 'Interactive activities for the live class session',
          type: 'exercise',
          phase: 'live_class',
          duration: 60,
          orderIndex: 2
        },
        {
          id: crypto.randomUUID(),
          topicId: topic.id,
          title: `Post-Class: ${topic.name} Practice`,
          description: 'Complete the writing and speaking assignments',
          type: 'exercise',
          phase: 'post_class',
          duration: 30,
          orderIndex: 3
        }
      ]

      // Insert content
      for (const content of contentItems) {
        try {
          await prisma.$executeRaw`
            INSERT INTO "Content" (
              id, "topicId", title, description, type, 
              phase, duration, "resourceUrl", "orderIndex", 
              "createdAt", "updatedAt"
            ) VALUES (
              ${content.id}, ${content.topicId}, ${content.title}, 
              ${content.description}, ${content.type}, ${content.phase}, 
              ${content.duration}, ${content.resourceUrl}, ${content.orderIndex},
              CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
          `
          totalContent++
        } catch (err) {
          console.error(`Error creating content for ${topic.name}:`, err)
        }
      }

      // Create exercises for each category
      let exerciseOrder = 1
      
      // Add exercises based on level
      const categories = topic.levelName === 'STARTER' 
        ? ['vocabulary', 'grammar', 'listening']
        : topic.levelName === 'SURVIVOR'
        ? ['vocabulary', 'grammar', 'listening', 'writing']
        : ['vocabulary', 'grammar', 'listening', 'writing', 'speaking']

      for (const category of categories) {
        const templates = exerciseTemplates[category as keyof typeof exerciseTemplates] || []
        
        for (const template of templates) {
          const generated = template.generator(topic.name)
          
          try {
            await prisma.$executeRaw`
              INSERT INTO "Exercise" (
                id, "topicId", type, category, phase, title, 
                instructions, content, "correctAnswer", points, 
                "orderIndex", "createdAt", "updatedAt"
              ) VALUES (
                ${crypto.randomUUID()}, ${topic.id}, 
                ${template.type}::"ExerciseType", ${category}, 
                ${template.phase}::"ExercisePhase", ${template.title}, 
                ${template.instructions}, ${JSON.stringify(generated.content)}::jsonb,
                ${generated.correctAnswer ? JSON.stringify(generated.correctAnswer) : null}::jsonb,
                ${template.points}, ${exerciseOrder},
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
              )
            `
            totalExercises++
            exerciseOrder++
          } catch (err) {
            console.error(`Error creating ${template.type} exercise for ${topic.name}:`, err)
          }
        }
      }
    }

    // Get final stats
    const finalStats = await prisma.$queryRaw`
      SELECT 
        COUNT(DISTINCT l.id) as levels,
        COUNT(DISTINCT t.id) as topics,
        COUNT(DISTINCT e.id) as exercises,
        COUNT(DISTINCT c.id) as content
      FROM "Level" l
      LEFT JOIN "Topic" t ON t."levelId" = l.id
      LEFT JOIN "Exercise" e ON e."topicId" = t.id
      LEFT JOIN "Content" c ON c."topicId" = t.id
    ` as any[]

    return NextResponse.json({
      success: true,
      message: 'Successfully populated all content',
      stats: {
        levels: processedLevels.size,
        topics: topics.length,
        exercises: totalExercises,
        content: totalContent,
        totalInDB: finalStats[0]
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