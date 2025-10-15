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

    if (!topicId) {
      return NextResponse.json({ error: 'Topic ID required' }, { status: 400 })
    }

    // Get content for the topic - all phases for teacher view
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
      ORDER BY 
        CASE phase
          WHEN 'pre_class' THEN 1
          WHEN 'live_class' THEN 2
          WHEN 'post_class' THEN 3
        END,
        "order"
    `

    return NextResponse.json(content)

  } catch (error: any) {
    console.error('Error fetching class content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content', details: error.message },
      { status: 500 }
    )
  }
}