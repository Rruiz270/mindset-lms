import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')

    if (!level) {
      return NextResponse.json(
        { message: 'Level parameter is required' },
        { status: 400 }
      )
    }

    const topics = await prisma.topic.findMany({
      where: {
        level: level as 'STARTER' | 'SURVIVOR' | 'EXPLORER' | 'EXPERT'
      },
      orderBy: {
        orderIndex: 'asc'
      },
      select: {
        id: true,
        name: true,
        description: true,
        orderIndex: true
      }
    })

    // Fetch contents separately using raw SQL
    for (const topic of topics) {
      const contents = await prisma.$queryRaw`
        SELECT * FROM "Content" 
        WHERE "topicId" = ${topic.id}
        ORDER BY 
          CASE "phase"
            WHEN 'pre_class' THEN 1
            WHEN 'live_class' THEN 2
            WHEN 'post_class' THEN 3
          END,
          "order" ASC
      `
      ;(topic as any).contents = contents
    }

    return NextResponse.json(topics)
  } catch (error) {
    console.error('Error fetching topics:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}