import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { contentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get content details with topic information
    const content = await prisma.$queryRaw`
      SELECT 
        c.id,
        c.title,
        c.description,
        c.type,
        c.phase,
        c.duration,
        c."resourceUrl",
        t.name as "topicName"
      FROM "Content" c
      JOIN "Topic" t ON c."topicId" = t.id
      WHERE c.id = ${params.contentId}
    ` as any[]

    if (content.length === 0) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    return NextResponse.json(content[0])

  } catch (error: any) {
    console.error('Error fetching content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content', details: error.message },
      { status: 500 }
    )
  }
}