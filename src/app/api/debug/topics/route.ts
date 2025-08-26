import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Debug endpoint to check topics without authentication (temporary)
export async function GET(request: NextRequest) {
  try {
    const topics = await prisma.topic.findMany({
      orderBy: { orderIndex: 'asc' },
      select: {
        id: true,
        name: true,
        level: true,
        orderIndex: true
      }
    })

    const exerciseCounts = await Promise.all(
      topics.map(async (topic) => {
        const count = await prisma.exercise.count({
          where: { topicId: topic.id }
        })
        return { ...topic, exerciseCount: count }
      })
    )

    return NextResponse.json({
      total: topics.length,
      topics: exerciseCounts
    })
  } catch (error) {
    console.error('Debug topics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch topics', details: error.message },
      { status: 500 }
    )
  }
}