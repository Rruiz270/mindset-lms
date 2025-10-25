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

    // Run the migration to create ContentProgress table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "ContentProgress" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
          "userId" TEXT NOT NULL,
          "contentId" TEXT NOT NULL,
          "completed" BOOLEAN NOT NULL DEFAULT false,
          "timeSpent" INTEGER NOT NULL DEFAULT 0,
          "completedAt" TIMESTAMP(3),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "ContentProgress_pkey" PRIMARY KEY ("id")
      )
    `

    // Add unique constraint
    await prisma.$executeRaw`
      ALTER TABLE "ContentProgress" 
      ADD CONSTRAINT "ContentProgress_userId_contentId_key" 
      UNIQUE ("userId", "contentId")
    `.catch(() => {
      // Constraint may already exist
    })

    // Add foreign keys
    await prisma.$executeRaw`
      ALTER TABLE "ContentProgress" 
      ADD CONSTRAINT "ContentProgress_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "User"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE
    `.catch(() => {
      // Constraint may already exist
    })

    await prisma.$executeRaw`
      ALTER TABLE "ContentProgress" 
      ADD CONSTRAINT "ContentProgress_contentId_fkey" 
      FOREIGN KEY ("contentId") REFERENCES "Content"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE
    `.catch(() => {
      // Constraint may already exist
    })

    // Create indexes
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "ContentProgress_userId_idx" 
      ON "ContentProgress"("userId")
    `

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "ContentProgress_contentId_idx" 
      ON "ContentProgress"("contentId")
    `

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "ContentProgress_userId_completed_idx" 
      ON "ContentProgress"("userId", "completed")
    `

    return NextResponse.json({ 
      success: true,
      message: 'ContentProgress table created successfully'
    })

  } catch (error: any) {
    console.error('Error creating ContentProgress table:', error)
    return NextResponse.json(
      { error: 'Failed to create table', details: error.message },
      { status: 500 }
    )
  }
}