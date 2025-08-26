import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { topicId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const phase = searchParams.get('phase') as 'PRE_CLASS' | 'AFTER_CLASS' | null
    const category = searchParams.get('category')

    const whereClause: any = {
      topicId: params.topicId,
    }

    if (phase) {
      whereClause.phase = phase
    }

    if (category) {
      whereClause.category = category
    }

    const exercises = await prisma.exercise.findMany({
      where: whereClause,
      orderBy: { orderIndex: 'asc' },
      select: {
        id: true,
        title: true,
        instructions: true,
        content: true,
        correctAnswer: true,
        category: true,
        type: true,
        phase: true,
        points: true,
        orderIndex: true
      }
    })

    return NextResponse.json(exercises)
  } catch (error) {
    console.error('Error fetching exercises:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    )
  }
}