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

    // Get student's progress including level and completed content
    const userProgress = await prisma.$queryRaw`
      SELECT 
        u.id,
        u.name,
        u.email,
        u."studentLevel" as level,
        COALESCE(
          (
            SELECT array_agg(DISTINCT p."contentId")
            FROM "Progress" p
            WHERE p."userId" = ${session.user.id}
            AND p."completedAt" IS NOT NULL
          ),
          ARRAY[]::text[]
        ) as "completedContent",
        COALESCE(
          (
            SELECT SUM(s.score)
            FROM "Submission" s
            JOIN "Exercise" e ON s."exerciseId" = e.id
            WHERE s."userId" = ${session.user.id}
          ),
          0
        ) as "totalPoints"
      FROM "User" u
      WHERE u.id = ${session.user.id}
    ` as any[]

    if (userProgress.length === 0) {
      return NextResponse.json({
        level: 'STARTER',
        completedContent: [],
        totalPoints: 0
      })
    }

    return NextResponse.json(userProgress[0])

  } catch (error: any) {
    console.error('Error fetching student progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress', details: error.message },
      { status: 500 }
    )
  }
}