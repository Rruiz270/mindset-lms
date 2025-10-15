import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('🌱 Force seeding content...')

    // Get Starter level
    const starterLevel = await prisma.level.findFirst({
      where: { name: 'STARTER' }
    })

    if (!starterLevel) {
      return NextResponse.json({ error: 'Starter level not found' }, { status: 404 })
    }

    // Get all topics
    const topics = await prisma.topic.findMany({
      where: { levelId: starterLevel.id },
      orderBy: { orderIndex: 'asc' }
    })

    let totalContent = 0
    let totalExercises = 0

    // Define all content statically
    const jobTopic = topics.find(t => t.name === 'Getting a Job')
    if (jobTopic) {
      // Delete existing
      await prisma.exercise.deleteMany({ where: { topicId: jobTopic.id } })
      await prisma.content.deleteMany({ where: { topicId: jobTopic.id } })

      // Create content
      await prisma.content.createMany({
        data: [
          {
            id: 'job_cont_1_' + Date.now(),
            topicId: jobTopic.id,
            title: 'Pre-Class: Job Interview Basics',
            description: 'Learn essential vocabulary for job interviews',
            type: 'video',
            phase: 'pre_class',
            duration: 15,
            resourceUrl: 'https://www.youtube.com/watch?v=naIkpQ_cIt0',
            orderIndex: 1
          },
          {
            id: 'job_cont_2_' + Date.now(),
            topicId: jobTopic.id,
            title: 'Live Class: Interview Role-Play',
            description: 'Practice job interviews with your teacher',
            type: 'exercise',
            phase: 'live_class',
            duration: 60,
            orderIndex: 2
          },
          {
            id: 'job_cont_3_' + Date.now(),
            topicId: jobTopic.id,
            title: 'Post-Class: Write Your Resume',
            description: 'Create a professional resume',
            type: 'exercise',
            phase: 'post_class',
            duration: 30,
            orderIndex: 3
          }
        ]
      })
      totalContent += 3

      // Create exercises
      await prisma.exercise.createMany({
        data: [
          {
            id: 'job_ex_1_' + Date.now(),
            topicId: jobTopic.id,
            type: 'MULTIPLE_CHOICE',
            category: 'vocabulary',
            phase: 'PRE_CLASS',
            title: 'Job Vocabulary Quiz',
            instructions: 'Choose the correct definition',
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
            id: 'job_ex_2_' + Date.now() + '_2',
            topicId: jobTopic.id,
            type: 'GAP_FILL',
            category: 'grammar',
            phase: 'PRE_CLASS',
            title: 'Complete the Sentences',
            instructions: 'Fill in the blanks',
            content: {
              text: 'I ___ worked here ___ 2020.',
              gaps: ['have', 'since']
            },
            correctAnswer: { answers: ['have', 'since'] },
            points: 10,
            orderIndex: 2
          },
          {
            id: 'job_ex_3_' + Date.now() + '_3',
            topicId: jobTopic.id,
            type: 'ESSAY',
            category: 'writing',
            phase: 'AFTER_CLASS',
            title: 'Cover Letter Writing',
            instructions: 'Write a cover letter',
            content: {
              prompt: 'Write a cover letter (150 words) for a job you want.',
              minWords: 150
            },
            correctAnswer: null,
            points: 25,
            orderIndex: 3
          }
        ]
      })
      totalExercises += 3
    }

    // Shopping topic
    const shopTopic = topics.find(t => t.name === 'Shopping: How Much Is It?')
    if (shopTopic) {
      await prisma.exercise.deleteMany({ where: { topicId: shopTopic.id } })
      await prisma.content.deleteMany({ where: { topicId: shopTopic.id } })

      await prisma.content.createMany({
        data: [
          {
            id: 'shop_cont_1_' + Date.now(),
            topicId: shopTopic.id,
            title: 'Pre-Class: Shopping Vocabulary',
            description: 'Learn shopping words and phrases',
            type: 'video',
            phase: 'pre_class',
            duration: 12,
            resourceUrl: 'https://www.youtube.com/watch?v=R-gLOfr-uZI',
            orderIndex: 1
          },
          {
            id: 'shop_cont_2_' + Date.now(),
            topicId: shopTopic.id,
            title: 'Live Class: Shopping Dialogues',
            description: 'Practice shopping conversations',
            type: 'discussion',
            phase: 'live_class',
            duration: 60,
            orderIndex: 2
          },
          {
            id: 'shop_cont_3_' + Date.now(),
            topicId: shopTopic.id,
            title: 'Post-Class: Shopping List',
            description: 'Create a shopping list with prices',
            type: 'exercise',
            phase: 'post_class',
            duration: 20,
            orderIndex: 3
          }
        ]
      })
      totalContent += 3

      await prisma.exercise.createMany({
        data: [
          {
            id: 'shop_ex_1_' + Date.now(),
            topicId: shopTopic.id,
            type: 'MULTIPLE_CHOICE',
            category: 'vocabulary',
            phase: 'PRE_CLASS',
            title: 'Where to Shop',
            instructions: 'Choose the correct place',
            content: {
              question: 'Where do you buy bread?',
              options: ['Pharmacy', 'Bakery', 'Bank', 'Library']
            },
            correctAnswer: { answer: 'B' },
            points: 10,
            orderIndex: 1
          },
          {
            id: 'shop_ex_2_' + Date.now() + '_2',
            topicId: shopTopic.id,
            type: 'TRUE_FALSE',
            category: 'grammar',
            phase: 'PRE_CLASS',
            title: 'Shopping Phrases',
            instructions: 'True or False?',
            content: {
              statement: 'We say "How much does it cost?" to ask about price.'
            },
            correctAnswer: { answer: 'true' },
            points: 5,
            orderIndex: 2
          },
          {
            id: 'shop_ex_3_' + Date.now() + '_3',
            topicId: shopTopic.id,
            type: 'AUDIO_RECORDING',
            category: 'speaking',
            phase: 'AFTER_CLASS',
            title: 'Shopping Conversation',
            instructions: 'Record yourself shopping',
            content: {
              prompt: 'Record a conversation in a store (45 seconds).',
              minDuration: 45
            },
            correctAnswer: null,
            points: 20,
            orderIndex: 3
          }
        ]
      })
      totalExercises += 3
    }

    // Get final counts
    const contentCount = await prisma.content.count()
    const exerciseCount = await prisma.exercise.count()

    return NextResponse.json({
      success: true,
      message: 'Content seeded successfully',
      stats: {
        totalContent: contentCount,
        totalExercises: exerciseCount,
        newContent: totalContent,
        newExercises: totalExercises
      }
    })

  } catch (error: any) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Failed to seed content', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}