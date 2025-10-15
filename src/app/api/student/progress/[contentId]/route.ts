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

    // Check if student has completed this content
    const progress = await prisma.$queryRaw`
      SELECT 
        id,
        "completedAt",
        "timeSpent"
      FROM "Progress"
      WHERE "userId" = ${session.user.id}
      AND "contentId" = ${params.contentId}
    ` as any[]

    if (progress.length === 0) {
      return NextResponse.json({ completed: false })
    }

    return NextResponse.json({
      completed: true,
      completedAt: progress[0].completedAt,
      timeSpent: progress[0].timeSpent
    })

  } catch (error: any) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress', details: error.message },
      { status: 500 }
    )
  }
}