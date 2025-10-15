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

    const { searchParams } = new URL(req.url)
    const level = searchParams.get('level') || 'STARTER'

    // Get exercises with their topics
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
        t.name as topic_name,
        t.level as topic_level
      FROM "Exercise" e
      JOIN "Topic" t ON e."topicId" = t.id
      WHERE t.level = ${level}::"Level"
      ORDER BY t."orderIndex", e.phase, e."orderIndex"
    `

    // Format the results
    const formattedExercises = (exercises as any[]).map(ex => ({
      id: ex.id,
      topicId: ex.topicId,
      phase: ex.phase,
      category: ex.category,
      type: ex.type,
      title: ex.title,
      instructions: ex.instructions,
      content: ex.content,
      correctAnswer: ex.correctAnswer,
      points: ex.points,
      orderIndex: ex.orderIndex,
      topic: {
        name: ex.topic_name,
        level: ex.topic_level
      }
    }))

    return NextResponse.json(formattedExercises)
  } catch (error: any) {
    console.error('Error fetching exercises:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exercises', details: error.message },
      { status: 500 }
    )
  }
}