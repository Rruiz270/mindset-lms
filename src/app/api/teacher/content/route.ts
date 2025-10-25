import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const topicId = searchParams.get('topicId')
    const level = searchParams.get('level')
    const phase = searchParams.get('phase')

    // Build query conditions
    let whereClause = 'WHERE 1=1'
    const params: any[] = []

    if (topicId) {
      whereClause += ' AND c."topicId" = $' + (params.length + 1)
      params.push(topicId)
    }

    if (level) {
      whereClause += ' AND c.level = $' + (params.length + 1)
      params.push(level)
    }

    if (phase) {
      whereClause += ' AND c.phase = $' + (params.length + 1)
      params.push(phase)
    }

    // Get content with topic information for teachers
    const content = await prisma.$queryRawUnsafe(`
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
      ${whereClause}
      ORDER BY 
        t."orderIndex",
        CASE c.phase
          WHEN 'pre_class' THEN 1
          WHEN 'live_class' THEN 2
          WHEN 'post_class' THEN 3
        END,
        c."order"
    `, ...params)

    // Also get exercises for each content phase
    const contentWithExercises = []
    for (const item of content as any[]) {
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
        WHERE "topicId" = ${item.topicId}
        AND (
          (phase = 'PRE_CLASS' AND ${item.phase} IN ('pre_class', 'live_class'))
          OR (phase = 'AFTER_CLASS' AND ${item.phase} = 'post_class')
        )
        ORDER BY "orderIndex"
      `

      contentWithExercises.push({
        ...item,
        exercises
      })
    }

    return NextResponse.json(contentWithExercises)

  } catch (error: any) {
    console.error('Error fetching teacher content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content', details: error.message },
      { status: 500 }
    )
  }
}