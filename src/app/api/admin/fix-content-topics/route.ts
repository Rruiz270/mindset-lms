import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all topics
    const topics = await prisma.$queryRaw`
      SELECT id, name, level, "orderIndex" 
      FROM "Topic" 
      ORDER BY level, "orderIndex"
    `
    
    // Get all content with their topic IDs
    const contents = await prisma.$queryRaw`
      SELECT id, title, "topicId", phase 
      FROM "Content"
      ORDER BY "topicId", phase, "order"
    `
    
    // Find Travel topic
    const travelTopic = (topics as any[]).find(t => t.name === 'Travel: Things to Do')
    
    return NextResponse.json({
      topics: topics,
      travelTopic: travelTopic,
      contents: contents,
      contentCount: (contents as any[]).length,
      uniqueTopicIds: [...new Set((contents as any[]).map(c => c.topicId))]
    })

  } catch (error: any) {
    console.error('Error checking content topics:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check content topics',
        details: error.message
      },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the Travel topic
    const topics = await prisma.$queryRaw`
      SELECT id, name FROM "Topic" 
      WHERE name = 'Travel: Things to Do' 
      LIMIT 1
    `
    
    const travelTopic = (topics as any[])[0]
    if (!travelTopic) {
      return NextResponse.json({ error: 'Travel topic not found' }, { status: 404 })
    }
    
    // Get the wrong topic ID from existing content
    const existingContent = await prisma.$queryRaw`
      SELECT DISTINCT "topicId" 
      FROM "Content" 
      LIMIT 1
    `
    
    const wrongTopicId = (existingContent as any[])[0]?.topicId
    
    if (!wrongTopicId) {
      return NextResponse.json({ error: 'No content found to fix' }, { status: 404 })
    }
    
    // Update all content to use the correct Travel topic ID
    const updateResult = await prisma.$executeRaw`
      UPDATE "Content" 
      SET "topicId" = ${travelTopic.id}
      WHERE "topicId" = ${wrongTopicId}
    `
    
    // Verify the fix
    const updatedContent = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Content" 
      WHERE "topicId" = ${travelTopic.id}
    `
    
    return NextResponse.json({
      success: true,
      message: 'Fixed content topic IDs',
      correctTopicId: travelTopic.id,
      wrongTopicId: wrongTopicId,
      updatedRows: updateResult,
      verifiedCount: Number((updatedContent as any[])[0].count)
    })

  } catch (error: any) {
    console.error('Error fixing content topics:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fix content topics',
        details: error.message
      },
      { status: 500 }
    )
  }
}