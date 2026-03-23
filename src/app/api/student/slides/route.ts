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

    const slides = await prisma.slide.findMany({
      where: { topicId },
      orderBy: { slideNumber: 'asc' },
      select: {
        id: true,
        slideNumber: true,
        title: true,
        type: true,
        content: true,
        notes: true,
      },
    })

    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      select: { name: true, level: true },
    })

    return NextResponse.json({ slides, topic })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error fetching slides:', message)
    return NextResponse.json(
      { error: 'Failed to fetch slides', details: message },
      { status: 500 }
    )
  }
}
