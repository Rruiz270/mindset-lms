import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedStarterContent() {
  console.log('🌱 Seeding starter level content...')
  
  try {
    // Find the first starter topic
    const starterTopic = await prisma.topic.findFirst({
      where: {
        level: 'STARTER',
        name: 'Travel: Things to Do'
      }
    })

    if (!starterTopic) {
      console.error('❌ Starter topic not found. Please run topic seed first.')
      return
    }

    console.log(`📚 Adding content for topic: ${starterTopic.name}`)

    // Clear existing content for this topic
    await prisma.content.deleteMany({
      where: { topicId: starterTopic.id }
    })

    // Pre-class content (30 minutes total)
    const preClassContent = [
      {
        title: 'Introduction to Travel Activities',
        description: 'Watch this short video to learn common vocabulary for travel activities and destinations.',
        type: 'video' as const,
        phase: 'pre_class' as const,
        duration: 10,
        resourceUrl: 'https://example.com/travel-intro-video',
        order: 1,
        level: 'starter',
        topicId: starterTopic.id
      },
      {
        title: 'Travel Vocabulary Reading',
        description: 'Read about popular tourist activities around the world. Learn key phrases like "go sightseeing", "visit museums", "take photos".',
        type: 'reading' as const,
        phase: 'pre_class' as const,
        duration: 10,
        resourceUrl: 'https://example.com/travel-vocabulary-pdf',
        order: 2,
        level: 'starter',
        topicId: starterTopic.id
      },
      {
        title: 'Listening Practice: Tourist Information',
        description: 'Listen to a conversation at a tourist information center. Practice understanding common questions and directions.',
        type: 'audio' as const,
        phase: 'pre_class' as const,
        duration: 10,
        resourceUrl: 'https://example.com/tourist-info-audio',
        order: 3,
        level: 'starter',
        topicId: starterTopic.id
      }
    ]

    // Live class content (60 minutes total)
    const liveClassContent = [
      {
        title: 'Warm-up: Travel Experiences',
        description: 'Share your favorite travel memories and activities with the class. Practice using past tense.',
        type: 'discussion' as const,
        phase: 'live_class' as const,
        duration: 10,
        order: 1,
        level: 'starter',
        topicId: starterTopic.id
      },
      {
        title: 'Grammar Focus: Present Continuous for Future Plans',
        description: 'Learn how to talk about future travel plans using "I am going to..." and "I am planning to..."',
        type: 'exercise' as const,
        phase: 'live_class' as const,
        duration: 15,
        order: 2,
        level: 'starter',
        topicId: starterTopic.id
      },
      {
        title: 'Role-Play: Planning a Trip',
        description: 'Work in pairs to plan a weekend trip. Practice making suggestions and agreeing/disagreeing politely.',
        type: 'discussion' as const,
        phase: 'live_class' as const,
        duration: 20,
        order: 3,
        level: 'starter',
        topicId: starterTopic.id
      },
      {
        title: 'Vocabulary Game: Travel Activities Charades',
        description: 'Act out different travel activities while classmates guess. Practice new vocabulary in a fun way.',
        type: 'exercise' as const,
        phase: 'live_class' as const,
        duration: 10,
        order: 4,
        level: 'starter',
        topicId: starterTopic.id
      },
      {
        title: 'Wrap-up: Travel Tips Exchange',
        description: 'Share one travel tip with the class. Practice giving advice using "You should..." and "Don\'t forget to..."',
        type: 'discussion' as const,
        phase: 'live_class' as const,
        duration: 5,
        order: 5,
        level: 'starter',
        topicId: starterTopic.id
      }
    ]

    // Post-class content (30 minutes total)
    const postClassContent = [
      {
        title: 'Travel Blog Writing',
        description: 'Write a short blog post (100-150 words) about your dream vacation. Use the vocabulary and grammar from today\'s lesson.',
        type: 'exercise' as const,
        phase: 'post_class' as const,
        duration: 15,
        order: 1,
        level: 'starter',
        topicId: starterTopic.id
      },
      {
        title: 'Grammar Quiz: Future Plans',
        description: 'Complete this short quiz to test your understanding of present continuous for future plans.',
        type: 'quiz' as const,
        phase: 'post_class' as const,
        duration: 10,
        resourceUrl: 'https://example.com/future-plans-quiz',
        order: 2,
        level: 'starter',
        topicId: starterTopic.id
      },
      {
        title: 'Speaking Practice: Record Your Travel Plans',
        description: 'Record a 2-minute audio describing your next vacation plans. Use at least 5 new vocabulary words from today.',
        type: 'audio' as const,
        phase: 'post_class' as const,
        duration: 5,
        order: 3,
        level: 'starter',
        topicId: starterTopic.id
      }
    ]

    // Insert all content
    const allContent = [...preClassContent, ...liveClassContent, ...postClassContent]
    
    for (const content of allContent) {
      await prisma.content.create({ data: content })
    }

    console.log('✅ Successfully seeded content for Travel: Things to Do')
    console.log(`📊 Added ${preClassContent.length} pre-class items`)
    console.log(`📊 Added ${liveClassContent.length} live class items`)
    console.log(`📊 Added ${postClassContent.length} post-class items`)
    
  } catch (error) {
    console.error('❌ Error seeding content:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function
seedStarterContent()