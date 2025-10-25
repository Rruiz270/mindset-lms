import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { contentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get content details with topic and exercise information
    const content = await prisma.$queryRaw`
      SELECT 
        c.id,
        c.title,
        c.description,
        c.type,
        c.phase,
        c.duration,
        c."resourceUrl",
        c."order",
        c.level,
        c."topicId",
        t.name as "topicName",
        t."orderIndex" as "topicOrderIndex",
        t.description as "topicDescription",
        t."lessonPlan",
        t.objectives,
        t.materials
      FROM "Content" c
      JOIN "Topic" t ON c."topicId" = t.id
      WHERE c.id = ${params.contentId}
    ` as any[]

    if (content.length === 0) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    const contentItem = content[0]

    // Get exercises for this content
    const exercises = await prisma.$queryRaw`
      SELECT 
        id,
        phase,
        category,
        type,
        title,
        instructions,
        content,
        points,
        "orderIndex"
      FROM "Exercise"
      WHERE "topicId" = ${contentItem.topicId}
      AND (
        (phase = 'PRE_CLASS' AND ${contentItem.phase} IN ('pre_class', 'live_class'))
        OR (phase = 'AFTER_CLASS' AND ${contentItem.phase} = 'post_class')
      )
      ORDER BY "orderIndex"
    `

    // Get slides for live class content
    let slides = []
    if (contentItem.phase === 'live_class') {
      slides = await prisma.$queryRaw`
        SELECT 
          id,
          "slideNumber",
          title,
          type,
          content,
          notes,
          "order"
        FROM "Slide"
        WHERE "topicId" = ${contentItem.topicId}
        ORDER BY "slideNumber"
      `
    }

    return NextResponse.json({
      ...contentItem,
      exercises,
      slides
    })

  } catch (error: any) {
    console.error('Error fetching teacher content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content', details: error.message },
      { status: 500 }
    )
  }
}