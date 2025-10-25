import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Track progress for individual content items
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { contentId, completed, timeSpent } = await req.json()

    if (!contentId) {
      return NextResponse.json({ error: 'Content ID required' }, { status: 400 })
    }

    // Get content details
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: { topic: true }
    })

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    // Create or update progress record for the topic
    const progress = await prisma.progress.upsert({
      where: {
        userId_topicId: {
          userId: session.user.id,
          topicId: content.topicId
        }
      },
      update: {
        ...(content.phase === 'pre_class' && completed ? { preClassComplete: true } : {}),
        ...(content.phase === 'post_class' && completed ? { afterClassComplete: true } : {}),
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        topicId: content.topicId,
        preClassComplete: content.phase === 'pre_class' && completed,
        liveClassAttended: false,
        afterClassComplete: content.phase === 'post_class' && completed
      }
    })

    // Log the content view/completion
    await prisma.$executeRaw`
      INSERT INTO "ContentProgress" (
        "userId", "contentId", "completed", "timeSpent", "completedAt"
      ) VALUES (
        ${session.user.id}, ${contentId}, ${completed}, ${timeSpent || 0}, ${completed ? new Date() : null}
      )
      ON CONFLICT ("userId", "contentId") DO UPDATE SET
        completed = ${completed},
        "timeSpent" = "ContentProgress"."timeSpent" + ${timeSpent || 0},
        "completedAt" = ${completed ? new Date() : null}
    `

    return NextResponse.json({ 
      success: true, 
      progress,
      message: completed ? 'Content marked as complete' : 'Progress updated'
    })

  } catch (error: any) {
    console.error('Error tracking content progress:', error)
    return NextResponse.json(
      { error: 'Failed to track progress', details: error.message },
      { status: 500 }
    )
  }
}

// Get progress for content items
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const topicId = searchParams.get('topicId')
    const contentId = searchParams.get('contentId')

    if (contentId) {
      // Get progress for a specific content
      const progress = await prisma.$queryRaw`
        SELECT 
          cp."contentId",
          cp.completed,
          cp."timeSpent",
          cp."completedAt",
          c.title,
          c.phase,
          c.type
        FROM "ContentProgress" cp
        JOIN "Content" c ON cp."contentId" = c.id
        WHERE cp."userId" = ${session.user.id}
        AND cp."contentId" = ${contentId}
      `

      return NextResponse.json(progress[0] || { completed: false, timeSpent: 0 })
    }

    if (topicId) {
      // Get all content progress for a topic
      const contents = await prisma.$queryRaw`
        SELECT 
          c.id,
          c.title,
          c.description,
          c.type,
          c.phase,
          c.duration,
          c."order",
          COALESCE(cp.completed, false) as completed,
          COALESCE(cp."timeSpent", 0) as "timeSpent",
          cp."completedAt"
        FROM "Content" c
        LEFT JOIN "ContentProgress" cp ON c.id = cp."contentId" AND cp."userId" = ${session.user.id}
        WHERE c."topicId" = ${topicId}
        AND c.phase IN ('pre_class', 'post_class')
        ORDER BY 
          CASE c.phase
            WHEN 'pre_class' THEN 1
            WHEN 'post_class' THEN 2
          END,
          c."order"
      `

      // Get topic progress
      const topicProgress = await prisma.progress.findUnique({
        where: {
          userId_topicId: {
            userId: session.user.id,
            topicId: topicId
          }
        }
      })

      return NextResponse.json({
        contents,
        topicProgress,
        stats: {
          totalContents: contents.length,
          completedContents: contents.filter((c: any) => c.completed).length,
          totalDuration: contents.reduce((sum: number, c: any) => sum + c.duration, 0),
          totalTimeSpent: contents.reduce((sum: number, c: any) => sum + c.timeSpent, 0)
        }
      })
    }

    // Get all content progress for the student
    const allProgress = await prisma.$queryRaw`
      SELECT 
        t.id as "topicId",
        t.name as "topicName",
        t."orderIndex",
        COUNT(DISTINCT c.id) as "totalContents",
        COUNT(DISTINCT CASE WHEN cp.completed THEN c.id END) as "completedContents",
        SUM(c.duration) as "totalDuration",
        COALESCE(SUM(cp."timeSpent"), 0) as "totalTimeSpent",
        p."preClassComplete",
        p."liveClassAttended",
        p."afterClassComplete"
      FROM "Topic" t
      LEFT JOIN "Content" c ON t.id = c."topicId" AND c.phase IN ('pre_class', 'post_class')
      LEFT JOIN "ContentProgress" cp ON c.id = cp."contentId" AND cp."userId" = ${session.user.id}
      LEFT JOIN "Progress" p ON t.id = p."topicId" AND p."userId" = ${session.user.id}
      GROUP BY t.id, t.name, t."orderIndex", p."preClassComplete", p."liveClassAttended", p."afterClassComplete"
      ORDER BY t."orderIndex"
    `

    return NextResponse.json(allProgress)

  } catch (error: any) {
    console.error('Error fetching content progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress', details: error.message },
      { status: 500 }
    )
  }
}