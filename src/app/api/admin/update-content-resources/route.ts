import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Educational YouTube videos for different topics
const videoResources: Record<string, string> = {
  // Work: Getting a Job
  'work-getting-a-job': 'https://www.youtube.com/embed/JZK1VfVxO5M',
  // Shopping: How Much Is It?
  'shopping-how-much-is-it': 'https://www.youtube.com/embed/SKhEW4h1T2s',
  // Talking About Yourself
  'talking-about-yourself': 'https://www.youtube.com/embed/JzJNzydJXqo',
  // Communication Skills
  'communication-skills': 'https://www.youtube.com/embed/HAnw168huqA',
  // Daily Routines
  'daily-routines': 'https://www.youtube.com/embed/qD1pnquN_DM',
  // Family and Relationships
  'family-and-relationships': 'https://www.youtube.com/embed/x_ewT_6Xbzg',
  // Food and Dining
  'food-and-dining': 'https://www.youtube.com/embed/AD0KhI_Uq64',
  // Health and Wellness
  'health-and-wellness': 'https://www.youtube.com/embed/SEfs5TJZ6Nk',
  // Travel and Transportation
  'travel-and-transportation': 'https://www.youtube.com/embed/n7xoqt0-MfA',
  // Weather and Seasons
  'weather-and-seasons': 'https://www.youtube.com/embed/rD6FRDd9Hew',
  // Default
  'default': 'https://www.youtube.com/embed/hFDOuCNosG0'
}

// Free stock images for different content types
const imageResources: Record<string, string> = {
  'work': 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800',
  'shopping': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
  'communication': 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=800',
  'daily': 'https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?w=800',
  'family': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800',
  'food': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
  'health': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
  'travel': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
  'weather': 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800',
  'default': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800'
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all topics
    const topics = await prisma.$queryRaw`
      SELECT id, name FROM "Topic" WHERE level = 'STARTER'::"Level"
    ` as any[]

    let updatedCount = 0

    for (const topic of topics) {
      const topicKey = topic.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      
      // Get all content for this topic
      const contents = await prisma.$queryRaw`
        SELECT id, title, type, phase FROM "Content" 
        WHERE "topicId" = ${topic.id}
      ` as any[]

      for (const content of contents) {
        let resourceUrl = ''
        
        // Assign appropriate resources based on content type
        if (content.type === 'video') {
          // Use topic-specific video or default
          resourceUrl = videoResources[topicKey] || videoResources['default']
        } else if (content.type === 'reading') {
          // Create a Google Docs-like URL (placeholder)
          resourceUrl = `https://docs.google.com/document/d/demo-${content.id}/view`
        } else if (content.type === 'audio') {
          // Use a free audio resource
          if (content.phase === 'pre_class') {
            resourceUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
          } else {
            resourceUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
          }
        }

        if (resourceUrl) {
          await prisma.$executeRaw`
            UPDATE "Content" 
            SET "resourceUrl" = ${resourceUrl}
            WHERE id = ${content.id}
          `
          updatedCount++
        }
      }
    }

    // Also update content descriptions with more detailed information
    await prisma.$executeRaw`
      UPDATE "Content" 
      SET description = CASE
        WHEN type = 'video' AND phase = 'pre_class' THEN 
          'Watch this engaging video to prepare for your lesson. Take notes on key vocabulary and phrases you hear.'
        WHEN type = 'reading' AND phase = 'pre_class' THEN 
          'Read through this material carefully. Look up any unfamiliar words and write down questions for class.'
        WHEN type = 'audio' AND phase = 'pre_class' THEN 
          'Listen to this conversation multiple times. Focus on pronunciation and intonation patterns.'
        WHEN type = 'exercise' AND phase = 'post_class' THEN 
          'Practice what you learned in class. Take your time and review the lesson material if needed.'
        WHEN type = 'discussion' AND phase = 'live_class' THEN 
          'Engage in meaningful conversation with your teacher and classmates. Dont be afraid to make mistakes!'
        WHEN type = 'quiz' THEN 
          'Test your understanding of the material. You can retake this quiz to improve your score.'
        ELSE description
      END
      WHERE "topicId" IN (SELECT id FROM "Topic" WHERE level = 'STARTER'::"Level")
    `

    return NextResponse.json({
      success: true,
      message: 'Content resources updated successfully',
      updatedItems: updatedCount
    })

  } catch (error: any) {
    console.error('Error updating content resources:', error)
    return NextResponse.json(
      { error: 'Failed to update resources', details: error.message },
      { status: 500 }
    )
  }
}