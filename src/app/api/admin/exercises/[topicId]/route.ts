import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { topicId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const exercises = await prisma.$queryRaw`
      SELECT 
        id,
        "topicId",
        phase,
        category,
        type,
        title,
        instructions,
        content,
        "correctAnswer",
        points,
        "orderIndex"
      FROM "Exercise"
      WHERE "topicId" = ${params.topicId}
      ORDER BY phase, "orderIndex"
    `

    return NextResponse.json(exercises)
  } catch (error: any) {
    console.error('Error fetching exercises for topic:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exercises', details: error.message },
      { status: 500 }
    )
  }
}