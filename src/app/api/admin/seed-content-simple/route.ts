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

    // Get the Travel topic
    const topics = await prisma.$queryRaw`
      SELECT id, name FROM "Topic" 
      WHERE name = 'Travel: Things to Do' 
      LIMIT 1
    `
    
    const topic = (topics as any[])[0]
    if (!topic) {
      return NextResponse.json({ error: 'Travel topic not found' }, { status: 404 })
    }

    // Clear existing content
    await prisma.$executeRaw`
      DELETE FROM "Content" WHERE "topicId" = ${topic.id}
    `

    // Insert one simple content item at a time
    const contents = [
      {
        title: 'Introduction to Travel Activities',
        description: 'Watch this short video to learn common vocabulary for travel activities.',
        type: 'video',
        phase: 'pre_class',
        duration: 10,
        order: 1
      },
      {
        title: 'Travel Vocabulary Reading',
        description: 'Read about popular tourist activities around the world.',
        type: 'reading',
        phase: 'pre_class',
        duration: 10,
        order: 2
      },
      {
        title: 'Listening Practice',
        description: 'Listen to a conversation at a tourist information center.',
        type: 'audio',
        phase: 'pre_class',
        duration: 10,
        order: 3
      },
      {
        title: 'Warm-up Discussion',
        description: 'Share your favorite travel memories with the class.',
        type: 'discussion',
        phase: 'live_class',
        duration: 10,
        order: 1
      },
      {
        title: 'Grammar Focus',
        description: 'Learn how to talk about future travel plans.',
        type: 'exercise',
        phase: 'live_class',
        duration: 15,
        order: 2
      },
      {
        title: 'Travel Blog Writing',
        description: 'Write a short blog post about your dream vacation.',
        type: 'exercise',
        phase: 'post_class',
        duration: 15,
        order: 1
      },
      {
        title: 'Grammar Quiz',
        description: 'Test your understanding of future plans grammar.',
        type: 'quiz',
        phase: 'post_class',
        duration: 10,
        order: 2
      }
    ]

    let successCount = 0
    const errors = []

    for (const content of contents) {
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
            null,
            ${content.order},
            'starter',
            ${topic.id},
            NOW(),
            NOW()
          )
        `
        successCount++
      } catch (error: any) {
        errors.push({
          content: content.title,
          error: error.message
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Added ${successCount} content items`,
      errors: errors.length > 0 ? errors : undefined,
      topicId: topic.id
    })

  } catch (error: any) {
    console.error('Error in seed-content-simple:', error)
    return NextResponse.json(
      { 
        error: 'Failed to seed content',
        details: error.message
      },
      { status: 500 }
    )
  }
}