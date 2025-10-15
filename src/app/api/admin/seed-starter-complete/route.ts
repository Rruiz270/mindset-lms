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

    // Get all Starter level topics
    const topics = await prisma.$queryRaw`
      SELECT t.id, t.name, t."orderIndex" 
      FROM "Topic" t
      JOIN "Level" l ON t."levelId" = l.id
      WHERE l.name = 'STARTER'
      ORDER BY t."orderIndex"
    ` as any[]

    let totalContent = 0
    let totalExercises = 0

    // Define content and exercises for each Starter topic
    const topicContent: Record<string, any> = {
      'Getting a Job': {
        content: [
          {
            title: 'Pre-Class: Job Interview Basics',
            description: 'Watch this video about job interviews and learn key vocabulary',
            type: 'video',
            phase: 'pre_class',
            duration: 15,
            resourceUrl: 'https://www.youtube.com/watch?v=naIkpQ_cIt0',
            orderIndex: 1
          },
          {
            title: 'Live Class: Interview Practice',
            description: 'Role-play job interviews and practice key phrases',
            type: 'exercise',
            phase: 'live_class',
            duration: 60,
            orderIndex: 2
          },
          {
            title: 'Post-Class: Write Your Resume',
            description: 'Create a simple resume and cover letter',
            type: 'exercise',
            phase: 'post_class',
            duration: 30,
            orderIndex: 3
          }
        ],
        exercises: [
          {
            type: 'MULTIPLE_CHOICE',
            category: 'vocabulary',
            phase: 'PRE_CLASS',
            title: 'Job Vocabulary',
            instructions: 'Choose the correct meaning',
            content: { 
              question: 'What does "experience" mean?',
              options: ['Your age', 'Your past work', 'Your education', 'Your salary']
            },
            correctAnswer: { answer: 'B' },
            points: 10
          },
          {
            type: 'GAP_FILL',
            category: 'grammar',
            phase: 'PRE_CLASS',
            title: 'Complete the Sentence',
            instructions: 'Fill in the blanks',
            content: { 
              text: 'I ___ worked here ___ 2020.',
              gaps: ['have', 'since']
            },
            correctAnswer: { answers: ['have', 'since'] },
            points: 10
          },
          {
            type: 'ESSAY',
            category: 'writing',
            phase: 'AFTER_CLASS',
            title: 'Describe Your Skills',
            instructions: 'Write about your job skills',
            content: { 
              prompt: 'Write 100 words about your skills and experience.',
              minWords: 100
            },
            correctAnswer: null,
            points: 20
          }
        ]
      },
      'Shopping: How Much Is It?': {
        content: [
          {
            title: 'Pre-Class: Shopping Vocabulary',
            description: 'Learn words for shopping and prices',
            type: 'video',
            phase: 'pre_class',
            duration: 15,
            resourceUrl: 'https://www.youtube.com/watch?v=R-gLOfr-uZI',
            orderIndex: 1
          },
          {
            title: 'Live Class: Shopping Dialogues',
            description: 'Practice asking for prices and buying items',
            type: 'exercise',
            phase: 'live_class',
            duration: 60,
            orderIndex: 2
          },
          {
            title: 'Post-Class: Shopping List Activity',
            description: 'Create and discuss a shopping list with prices',
            type: 'exercise',
            phase: 'post_class',
            duration: 20,
            orderIndex: 3
          }
        ],
        exercises: [
          {
            type: 'MULTIPLE_CHOICE',
            category: 'vocabulary',
            phase: 'PRE_CLASS',
            title: 'Shopping Words',
            instructions: 'Choose the correct answer',
            content: { 
              question: 'Where do you buy bread?',
              options: ['Pharmacy', 'Bakery', 'Bank', 'Library']
            },
            correctAnswer: { answer: 'B' },
            points: 10
          },
          {
            type: 'TRUE_FALSE',
            category: 'listening',
            phase: 'PRE_CLASS',
            title: 'Price Check',
            instructions: 'Is this statement correct?',
            content: { 
              statement: 'The phrase "How much does it cost?" is used to ask about price.'
            },
            correctAnswer: { answer: 'true' },
            points: 5
          },
          {
            type: 'AUDIO_RECORDING',
            category: 'speaking',
            phase: 'AFTER_CLASS',
            title: 'Shopping Dialogue',
            instructions: 'Record a shopping conversation',
            content: { 
              prompt: 'Record yourself asking for prices in a store.',
              minDuration: 30
            },
            correctAnswer: null,
            points: 15
          }
        ]
      },
      'Daily Commute': {
        content: [
          {
            title: 'Pre-Class: Transportation Vocabulary',
            description: 'Learn about different types of transportation',
            type: 'reading',
            phase: 'pre_class',
            duration: 10,
            orderIndex: 1
          },
          {
            title: 'Live Class: Giving Directions',
            description: 'Practice giving and following directions',
            type: 'exercise',
            phase: 'live_class',
            duration: 60,
            orderIndex: 2
          },
          {
            title: 'Post-Class: Describe Your Route',
            description: 'Write about your daily commute',
            type: 'exercise',
            phase: 'post_class',
            duration: 25,
            orderIndex: 3
          }
        ],
        exercises: [
          {
            type: 'MATCHING',
            category: 'vocabulary',
            phase: 'PRE_CLASS',
            title: 'Match Transportation',
            instructions: 'Match the words with their meanings',
            content: { 
              pairs: [
                { term: 'Bus', definition: 'Public road transport' },
                { term: 'Subway', definition: 'Underground train' },
                { term: 'Taxi', definition: 'Private hired car' }
              ]
            },
            correctAnswer: null,
            points: 10
          },
          {
            type: 'MULTIPLE_CHOICE',
            category: 'grammar',
            phase: 'PRE_CLASS',
            title: 'Direction Prepositions',
            instructions: 'Choose the correct preposition',
            content: { 
              question: 'Turn ___ at the traffic light.',
              options: ['left', 'leave', 'lift', 'live']
            },
            correctAnswer: { answer: 'A' },
            points: 10
          },
          {
            type: 'ESSAY',
            category: 'writing',
            phase: 'AFTER_CLASS',
            title: 'My Daily Journey',
            instructions: 'Describe how you travel to work or school',
            content: { 
              prompt: 'Write about your daily commute. Include the transportation you use and how long it takes.',
              minWords: 80
            },
            correctAnswer: null,
            points: 20
          }
        ]
      },
      'Leisure Time': {
        content: [
          {
            title: 'Pre-Class: Hobbies and Activities',
            description: 'Learn vocabulary for leisure activities',
            type: 'video',
            phase: 'pre_class',
            duration: 12,
            resourceUrl: 'https://www.youtube.com/watch?v=M-gBBxpKkMI',
            orderIndex: 1
          },
          {
            title: 'Live Class: Discussing Free Time',
            description: 'Talk about what you do in your free time',
            type: 'discussion',
            phase: 'live_class',
            duration: 60,
            orderIndex: 2
          },
          {
            title: 'Post-Class: Weekend Plans',
            description: 'Plan and describe your ideal weekend',
            type: 'exercise',
            phase: 'post_class',
            duration: 20,
            orderIndex: 3
          }
        ],
        exercises: [
          {
            type: 'MULTIPLE_CHOICE',
            category: 'vocabulary',
            phase: 'PRE_CLASS',
            title: 'Leisure Activities',
            instructions: 'What activity is this?',
            content: { 
              question: 'An activity where you watch movies at home:',
              options: ['Swimming', 'Streaming', 'Shopping', 'Sleeping']
            },
            correctAnswer: { answer: 'B' },
            points: 10
          },
          {
            type: 'GAP_FILL',
            category: 'grammar',
            phase: 'PRE_CLASS',
            title: 'Present Simple for Habits',
            instructions: 'Complete with the correct form',
            content: { 
              text: 'I usually ___ tennis on Saturdays.',
              gaps: ['play']
            },
            correctAnswer: { answers: ['play'] },
            points: 10
          },
          {
            type: 'AUDIO_RECORDING',
            category: 'speaking',
            phase: 'AFTER_CLASS',
            title: 'My Favorite Hobby',
            instructions: 'Talk about your favorite leisure activity',
            content: { 
              prompt: 'Record yourself talking about your favorite hobby for 1 minute.',
              minDuration: 60
            },
            correctAnswer: null,
            points: 20
          }
        ]
      }
    }

    // Process each topic
    for (const topic of topics) {
      const topicData = topicContent[topic.name]
      if (!topicData) continue

      // Insert content
      for (const content of topicData.content) {
        const contentId = `cont_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
        
        try {
          await prisma.$executeRaw`
            INSERT INTO "Content" (
              id, "topicId", title, description, type, phase, 
              duration, "resourceUrl", "orderIndex", "createdAt", "updatedAt"
            ) VALUES (
              ${contentId}, ${topic.id}, ${content.title}, ${content.description},
              ${content.type}, ${content.phase}, ${content.duration}, 
              ${content.resourceUrl || null}, ${content.orderIndex},
              CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
          `
          totalContent++
        } catch (err) {
          console.error(`Error creating content for ${topic.name}:`, err)
        }
      }

      // Insert exercises
      let exerciseOrder = 1
      for (const exercise of topicData.exercises) {
        const exerciseId = `ex_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
        
        try {
          await prisma.$executeRaw`
            INSERT INTO "Exercise" (
              id, "topicId", type, category, phase, title,
              instructions, content, "correctAnswer", points,
              "orderIndex", "createdAt", "updatedAt"
            ) VALUES (
              ${exerciseId}, ${topic.id}, ${exercise.type}::"ExerciseType",
              ${exercise.category}, ${exercise.phase}::"ExercisePhase",
              ${exercise.title}, ${exercise.instructions},
              ${JSON.stringify(exercise.content)}::jsonb,
              ${exercise.correctAnswer ? JSON.stringify(exercise.correctAnswer) : null}::jsonb,
              ${exercise.points}, ${exerciseOrder},
              CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
          `
          totalExercises++
          exerciseOrder++
        } catch (err) {
          console.error(`Error creating exercise for ${topic.name}:`, err)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully populated all Starter content',
      stats: {
        topics: topics.length,
        contentCreated: totalContent,
        exercisesCreated: totalExercises
      }
    })

  } catch (error: any) {
    console.error('Error populating Starter content:', error)
    return NextResponse.json(
      { error: 'Failed to populate Starter content', details: error.message },
      { status: 500 }
    )
  }
}