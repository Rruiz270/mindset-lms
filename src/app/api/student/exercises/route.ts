import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const topicId = searchParams.get('topicId')

    if (!topicId) {
      return NextResponse.json({ error: 'Topic ID required' }, { status: 400 })
    }

    // Get exercises for the topic, only PRE_CLASS and AFTER_CLASS phases
    const exercises = await prisma.$queryRaw`
      SELECT 
        e.id,
        e."topicId",
        e.phase,
        e.category,
        e.type,
        e.title,
        e.instructions,
        e.content,
        e."correctAnswer",
        e.points,
        e."orderIndex",
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM "Submission" s 
            WHERE s."exerciseId" = e.id 
            AND s."userId" = ${session.user.id}
          ) THEN true 
          ELSE false 
        END as completed
      FROM "Exercise" e
      WHERE e."topicId" = ${topicId}
      AND e.phase IN ('PRE_CLASS', 'AFTER_CLASS')
      ORDER BY e.phase, e."orderIndex"
    `

    return NextResponse.json(exercises)

  } catch (error: any) {
    console.error('Error fetching student exercises:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exercises', details: error.message },
      { status: 500 }
    )
  }
}