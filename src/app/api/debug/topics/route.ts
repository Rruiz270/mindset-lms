import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Debug endpoint to check topics without authentication (temporary)
export async function GET(request: NextRequest) {
  try {
    const topics = await prisma.topic.findMany({
      orderBy: { level: 'asc', orderIndex: 'asc' },
      select: {
        id: true,
        name: true,
        level: true,
        orderIndex: true,
        _count: {
          select: {
            exercises: true
          }
        }
      }
    })

    return NextResponse.json({
      total: topics.length,
      topics: topics.map(topic => ({
        id: topic.id,
        name: topic.name,
        level: topic.level,
        orderIndex: topic.orderIndex,
        exerciseCount: topic._count.exercises
      }))
    })
  } catch (error) {
    console.error('Debug topics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch topics', details: error.message },
      { status: 500 }
    )
  }
}