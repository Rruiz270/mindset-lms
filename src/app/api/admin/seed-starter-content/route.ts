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

    // Find the first starter topic using raw SQL
    const topicResult = await prisma.$queryRaw`
      SELECT id, name FROM "Topic" 
      WHERE level = 'STARTER' 
      AND name = 'Travel: Things to Do'
      LIMIT 1
    `

    const starterTopic = (topicResult as any[])[0]
    
    if (!starterTopic) {
      return NextResponse.json(
        { 
          error: 'Topic not found',
          details: 'Travel: Things to Do topic must exist first'
        },
        { status: 404 }
      )
    }

    // First check if Content table exists
    try {
      const tableCheck = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Content'
      `
      
      if ((tableCheck as any[]).length === 0) {
        return NextResponse.json(
          { 
            error: 'Content table does not exist',
            details: 'Please run database initialization first'
          },
          { status: 400 }
        )
      }
    } catch (checkError) {
      console.error('Error checking table:', checkError)
    }

    // Clear existing content for this topic using raw SQL
    try {
      await prisma.$executeRaw`
        DELETE FROM "Content" WHERE "topicId" = ${starterTopic.id}
      `
    } catch (deleteError) {
      // Table might be empty, continue
      console.log('No existing content to delete')
    }

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

    // Insert all content using raw SQL
    const allContent = [...preClassContent, ...liveClassContent, ...postClassContent]
    let insertedCount = 0
    
    for (const content of allContent) {
      try {
        await prisma.$executeRaw`
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
            ${content.level},
            ${content.topicId},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
        `
        insertedCount++
      } catch (insertError: any) {
        console.error('Error inserting content item:', {
          title: content.title,
          error: insertError.message,
          code: insertError.code
        })
        throw insertError
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully seeded content for Travel: Things to Do',
      stats: {
        preClass: preClassContent.length,
        liveClass: liveClassContent.length,
        postClass: postClassContent.length,
        total: allContent.length
      }
    })
    
  } catch (error: any) {
    console.error('Error seeding content:', error)
    return NextResponse.json(
      { 
        error: 'Failed to seed content',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    )
  }
}