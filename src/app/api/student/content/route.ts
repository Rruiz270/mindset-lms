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

    // Get content for the topic, only pre-class and post-class
    const content = await prisma.$queryRaw`
      SELECT 
        id,
        title,
        description,
        type,
        phase,
        duration,
        "resourceUrl",
        "order",
        level
      FROM "Content"
      WHERE "topicId" = ${topicId}
      AND phase IN ('pre_class', 'post_class')
      ORDER BY phase, "order"
    `

    return NextResponse.json(content)

  } catch (error: any) {
    console.error('Error fetching student content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content', details: error.message },
      { status: 500 }
    )
  }
}