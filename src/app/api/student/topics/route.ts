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
    const level = searchParams.get('level') || 'STARTER'

    // Get topics for the specified level
    const topics = await prisma.$queryRaw`
      SELECT 
        id,
        name,
        level,
        description,
        "orderIndex"
      FROM "Topic"
      WHERE level = ${level}::"Level"
      ORDER BY "orderIndex"
    `

    return NextResponse.json(topics)

  } catch (error: any) {
    console.error('Error fetching student topics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch topics', details: error.message },
      { status: 500 }
    )
  }
}