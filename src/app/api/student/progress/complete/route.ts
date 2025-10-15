import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { contentId, timeSpent } = await req.json()

    // Check if progress already exists
    const existing = await prisma.$queryRaw`
      SELECT id FROM "Progress"
      WHERE "userId" = ${session.user.id}
      AND "contentId" = ${contentId}
    ` as any[]

    if (existing.length > 0) {
      // Update existing progress
      await prisma.$executeRaw`
        UPDATE "Progress"
        SET "completedAt" = CURRENT_TIMESTAMP,
            "timeSpent" = ${timeSpent || 0},
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE "userId" = ${session.user.id}
        AND "contentId" = ${contentId}
      `
    } else {
      // Create new progress record
      await prisma.$executeRaw`
        INSERT INTO "Progress" (
          id, "userId", "contentId", "completedAt", 
          "timeSpent", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid()::text,
          ${session.user.id},
          ${contentId},
          CURRENT_TIMESTAMP,
          ${timeSpent || 0},
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
      `
    }

    return NextResponse.json({
      success: true,
      message: 'Progress saved successfully'
    })

  } catch (error: any) {
    console.error('Error saving progress:', error)
    return NextResponse.json(
      { error: 'Failed to save progress', details: error.message },
      { status: 500 }
    )
  }
}