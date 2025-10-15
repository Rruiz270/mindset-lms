import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding content and exercises...')

  try {
    // Get Starter level ID
    const starterLevel = await prisma.level.findFirst({
      where: { name: 'STARTER' }
    })

    if (!starterLevel) {
      console.error('Starter level not found!')
      return
    }

    // Get all starter topics
    const topics = await prisma.topic.findMany({
      where: { levelId: starterLevel.id },
      orderBy: { orderIndex: 'asc' }
    })

    console.log(`Found ${topics.length} topics in Starter level`)

    // Content and exercises for each topic
    const topicData = {
      'Getting a Job': {
        content: [
          {
            id: 'cont_job_1',
            title: 'Pre-Class: Job Interview Vocabulary',
            description: 'Learn essential vocabulary for job interviews',
            type: 'video',
            phase: 'pre_class',
            duration: 15,
            resourceUrl: 'https://www.youtube.com/watch?v=naIkpQ_cIt0',
            orderIndex: 1
          },
          {
            id: 'cont_job_2',
            title: 'Live Class: Interview Role-Play',
            description: 'Practice job interviews with your teacher',
            type: 'exercise',
            phase: 'live_class',
            duration: 60,
            resourceUrl: null,
            orderIndex: 2
          },
          {
            id: 'cont_job_3',
            title: 'Post-Class: Write Your Resume',
            description: 'Create a professional resume',
            type: 'exercise',
            phase: 'post_class',
            duration: 30,
            resourceUrl: null,
            orderIndex: 3
          }
        ],
        exercises: [
          {
            id: 'ex_job_1',
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
            id: 'ex_job_2',
            type: 'GAP_FILL',
            category: 'grammar',
            phase: 'PRE_CLASS',
            title: 'Present Perfect Practice',
            instructions: 'Fill in the blanks with the correct form',
            content: {
              text: 'I ___ worked in sales ___ 5 years.',
              gaps: ['have', 'for']
            },
            correctAnswer: { answers: ['have', 'for'] },
            points: 10,
            orderIndex: 2
          },
          {
            id: 'ex_job_3',
            type: 'ESSAY',
            category: 'writing',
            phase: 'AFTER_CLASS',
            title: 'Cover Letter Writing',
            instructions: 'Write a cover letter for your dream job',
            content: {
              prompt: 'Write a cover letter (150-200 words) applying for a position at a company you admire.',
              minWords: 150
            },
            correctAnswer: null,
            points: 25,
            orderIndex: 3
          }
        ]
      },
      'Shopping: How Much Is It?': {
        content: [
          {
            id: 'cont_shop_1',
            title: 'Pre-Class: Shopping Vocabulary',
            description: 'Learn words and phrases for shopping',
            type: 'video',
            phase: 'pre_class',
            duration: 12,
            resourceUrl: 'https://www.youtube.com/watch?v=R-gLOfr-uZI',
            orderIndex: 1
          },
          {
            id: 'cont_shop_2',
            title: 'Live Class: Shopping Dialogues',
            description: 'Practice shopping conversations',
            type: 'discussion',
            phase: 'live_class',
            duration: 60,
            resourceUrl: null,
            orderIndex: 2
          },
          {
            id: 'cont_shop_3',
            title: 'Post-Class: Create a Shopping List',
            description: 'Make a shopping list with prices',
            type: 'exercise',
            phase: 'post_class',
            duration: 20,
            resourceUrl: null,
            orderIndex: 3
          }
        ],
        exercises: [
          {
            id: 'ex_shop_1',
            type: 'MULTIPLE_CHOICE',
            category: 'vocabulary',
            phase: 'PRE_CLASS',
            title: 'Shopping Places',
            instructions: 'Where can you buy these items?',
            content: {
              question: 'Where do you buy fresh bread?',
              options: ['Pharmacy', 'Bakery', 'Hardware store', 'Gas station']
            },
            correctAnswer: { answer: 'B' },
            points: 10,
            orderIndex: 1
          },
          {
            id: 'ex_shop_2',
            type: 'TRUE_FALSE',
            category: 'listening',
            phase: 'PRE_CLASS',
            title: 'Price Expressions',
            instructions: 'Are these expressions correct?',
            content: {
              statement: '"How much does it cost?" is a polite way to ask for the price.'
            },
            correctAnswer: { answer: 'true' },
            points: 5,
            orderIndex: 2
          },
          {
            id: 'ex_shop_3',
            type: 'AUDIO_RECORDING',
            category: 'speaking',
            phase: 'AFTER_CLASS',
            title: 'At the Store',
            instructions: 'Record a shopping conversation',
            content: {
              prompt: 'Record yourself having a conversation in a store asking for prices and buying items.',
              minDuration: 45
            },
            correctAnswer: null,
            points: 20,
            orderIndex: 3
          }
        ]
      },
      'Daily Commute': {
        content: [
          {
            id: 'cont_comm_1',
            title: 'Pre-Class: Transportation Types',
            description: 'Learn about different ways to travel',
            type: 'reading',
            phase: 'pre_class',
            duration: 10,
            resourceUrl: null,
            orderIndex: 1
          },
          {
            id: 'cont_comm_2',
            title: 'Live Class: Giving Directions',
            description: 'Practice giving and following directions',
            type: 'exercise',
            phase: 'live_class',
            duration: 60,
            resourceUrl: null,
            orderIndex: 2
          },
          {
            id: 'cont_comm_3',
            title: 'Post-Class: Describe Your Route',
            description: 'Write about how you get to work',
            type: 'exercise',
            phase: 'post_class',
            duration: 25,
            resourceUrl: null,
            orderIndex: 3
          }
        ],
        exercises: [
          {
            id: 'ex_comm_1',
            type: 'MATCHING',
            category: 'vocabulary',
            phase: 'PRE_CLASS',
            title: 'Match Transportation',
            instructions: 'Match the transportation with its description',
            content: {
              pairs: [
                { term: 'Subway', definition: 'Underground train system' },
                { term: 'Bus', definition: 'Public road transport' },
                { term: 'Bicycle', definition: 'Two-wheeled personal transport' }
              ]
            },
            correctAnswer: null,
            points: 10,
            orderIndex: 1
          },
          {
            id: 'ex_comm_2',
            type: 'MULTIPLE_CHOICE',
            category: 'grammar',
            phase: 'PRE_CLASS',
            title: 'Direction Prepositions',
            instructions: 'Choose the correct word',
            content: {
              question: 'Turn ___ at the traffic light to reach the station.',
              options: ['left', 'leave', 'lift', 'live']
            },
            correctAnswer: { answer: 'A' },
            points: 10,
            orderIndex: 2
          },
          {
            id: 'ex_comm_3',
            type: 'ESSAY',
            category: 'writing',
            phase: 'AFTER_CLASS',
            title: 'My Commute Story',
            instructions: 'Describe your daily journey',
            content: {
              prompt: 'Write about your daily commute to work or school. Include what transportation you use, how long it takes, and what you see along the way.',
              minWords: 100
            },
            correctAnswer: null,
            points: 20,
            orderIndex: 3
          }
        ]
      },
      'Leisure Time': {
        content: [
          {
            id: 'cont_leisure_1',
            title: 'Pre-Class: Hobbies Vocabulary',
            description: 'Learn to talk about free time activities',
            type: 'video',
            phase: 'pre_class',
            duration: 15,
            resourceUrl: 'https://www.youtube.com/watch?v=QjDuJkO6n6Y',
            orderIndex: 1
          },
          {
            id: 'cont_leisure_2',
            title: 'Live Class: Discussing Hobbies',
            description: 'Share and discuss your favorite activities',
            type: 'discussion',
            phase: 'live_class',
            duration: 60,
            resourceUrl: null,
            orderIndex: 2
          },
          {
            id: 'cont_leisure_3',
            title: 'Post-Class: Weekend Plans',
            description: 'Plan your perfect weekend',
            type: 'exercise',
            phase: 'post_class',
            duration: 20,
            resourceUrl: null,
            orderIndex: 3
          }
        ],
        exercises: [
          {
            id: 'ex_leisure_1',
            type: 'MULTIPLE_CHOICE',
            category: 'vocabulary',
            phase: 'PRE_CLASS',
            title: 'Hobby Vocabulary',
            instructions: 'Choose the correct activity',
            content: {
              question: 'Which activity involves watching movies or series at home?',
              options: ['Streaming', 'Jogging', 'Painting', 'Cooking']
            },
            correctAnswer: { answer: 'A' },
            points: 10,
            orderIndex: 1
          },
          {
            id: 'ex_leisure_2',
            type: 'GAP_FILL',
            category: 'grammar',
            phase: 'PRE_CLASS',
            title: 'Present Simple Habits',
            instructions: 'Complete the sentence',
            content: {
              text: 'On weekends, I usually ___ hiking with my friends.',
              gaps: ['go']
            },
            correctAnswer: { answers: ['go'] },
            points: 10,
            orderIndex: 2
          },
          {
            id: 'ex_leisure_3',
            type: 'AUDIO_RECORDING',
            category: 'speaking',
            phase: 'AFTER_CLASS',
            title: 'My Favorite Hobby',
            instructions: 'Talk about what you love to do',
            content: {
              prompt: 'Record yourself talking about your favorite hobby. Explain what it is, why you enjoy it, and how often you do it.',
              minDuration: 60
            },
            correctAnswer: null,
            points: 20,
            orderIndex: 3
          }
        ]
      }
    }

    // Process each topic
    for (const topic of topics) {
      const data = topicData[topic.name as keyof typeof topicData]
      if (!data) {
        console.log(`⚠️  No data for topic: ${topic.name}`)
        continue
      }

      console.log(`\n📚 Processing ${topic.name}...`)

      // Delete existing content and exercises for this topic
      await prisma.exercise.deleteMany({ where: { topicId: topic.id } })
      await prisma.content.deleteMany({ where: { topicId: topic.id } })

      // Create content
      for (const content of data.content) {
        await prisma.content.create({
          data: {
            id: content.id,
            topicId: topic.id,
            title: content.title,
            description: content.description,
            type: content.type,
            phase: content.phase,
            duration: content.duration,
            resourceUrl: content.resourceUrl,
            orderIndex: content.orderIndex
          }
        })
        console.log(`  ✅ Created content: ${content.title}`)
      }

      // Create exercises
      for (const exercise of data.exercises) {
        await prisma.exercise.create({
          data: {
            id: exercise.id,
            topicId: topic.id,
            type: exercise.type,
            category: exercise.category,
            phase: exercise.phase,
            title: exercise.title,
            instructions: exercise.instructions,
            content: exercise.content,
            correctAnswer: exercise.correctAnswer,
            points: exercise.points,
            orderIndex: exercise.orderIndex
          }
        })
        console.log(`  ✅ Created exercise: ${exercise.title}`)
      }
    }

    // Get final counts
    const contentCount = await prisma.content.count()
    const exerciseCount = await prisma.exercise.count()

    console.log(`\n✨ Seeding complete!`)
    console.log(`📊 Total content: ${contentCount}`)
    console.log(`📊 Total exercises: ${exerciseCount}`)

  } catch (error) {
    console.error('Error seeding content:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })