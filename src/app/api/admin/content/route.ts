import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const { title, description, type, phase, duration, resourceUrl, order, topicId, level } = data

    // Create content
    const content = await prisma.content.create({
      data: {
        title,
        description,
        type,
        phase,
        duration,
        resourceUrl,
        order,
        topicId,
        level
      }
    })

    return NextResponse.json({ success: true, content })
  } catch (error) {
    console.error('Error creating content:', error)
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const topicId = searchParams.get('topicId')
    const level = searchParams.get('level')

    // Use raw SQL to fetch content
    let contents: any[] = []
    
    if (topicId) {
      contents = await prisma.$queryRaw`
        SELECT * FROM "Content" 
        WHERE "topicId" = ${topicId}
        ORDER BY 
          CASE "phase"
            WHEN 'pre_class' THEN 1
            WHEN 'live_class' THEN 2
            WHEN 'post_class' THEN 3
          END,
          "order" ASC
      `
    } else if (level) {
      contents = await prisma.$queryRaw`
        SELECT * FROM "Content" 
        WHERE "level" = ${level}
        ORDER BY 
          CASE "phase"
            WHEN 'pre_class' THEN 1
            WHEN 'live_class' THEN 2
            WHEN 'post_class' THEN 3
          END,
          "order" ASC
      `
    } else {
      contents = await prisma.$queryRaw`
        SELECT * FROM "Content"
        ORDER BY 
          CASE "phase"
            WHEN 'pre_class' THEN 1
            WHEN 'live_class' THEN 2
            WHEN 'post_class' THEN 3
          END,
          "order" ASC
      `
    }

    return NextResponse.json(contents)
  } catch (error) {
    console.error('Error fetching contents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contents' },
      { status: 500 }
    )
  }
}