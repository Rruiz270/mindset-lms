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
    
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For "Getting a Job" topic, return specific exercises
    // First, let's get the content and topic info
    const content = await prisma.$queryRaw`
      SELECT 
        c.id,
        c.title,
        c."topicId",
        t.name as "topicName"
      FROM "Content" c
      JOIN "Topic" t ON c."topicId" = t.id
      WHERE c.id = ${params.contentId}
    ` as any[]

    if (content.length === 0) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    // Get exercises for this topic and phase
    const exercises = await prisma.$queryRaw`
      SELECT 
        e.id,
        e.type,
        e.category,
        e.phase,
        e.title,
        e.instructions,
        e.content,
        e.points,
        e."correctAnswer",
        e."orderIndex"
      FROM "Exercise" e
      WHERE e."topicId" = ${content[0].topicId}
      AND (
        (${content[0].title} LIKE '%Pre-Class%' AND e.phase = 'PRE_CLASS') OR
        (${content[0].title} LIKE '%Post-Class%' AND e.phase = 'AFTER_CLASS')
      )
      ORDER BY e."orderIndex"
    ` as any[]

    return NextResponse.json({
      content: content[0],
      exercises
    })

  } catch (error: any) {
    console.error('Error fetching exercises:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exercises', details: error.message },
      { status: 500 }
    )
  }
}