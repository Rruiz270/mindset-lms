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

    // Create the Content table if it doesn't exist
    try {
      // First check if table exists
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'Content'
        );
      `

      if ((tableExists as any)[0]?.exists) {
        return NextResponse.json({ 
          success: true, 
          message: 'Content table already exists' 
        })
      }

      // Create enums first
      await prisma.$executeRaw`
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ContentType') THEN
            CREATE TYPE "ContentType" AS ENUM ('reading', 'video', 'audio', 'exercise', 'quiz', 'discussion');
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ContentPhase') THEN
            CREATE TYPE "ContentPhase" AS ENUM ('pre_class', 'live_class', 'post_class');
          END IF;
        END $$;
      `

      // Create Content table
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "Content" (
          "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
          "title" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "type" "ContentType" NOT NULL,
          "phase" "ContentPhase" NOT NULL,
          "duration" INTEGER NOT NULL DEFAULT 15,
          "resourceUrl" TEXT,
          "order" INTEGER NOT NULL DEFAULT 1,
          "level" TEXT NOT NULL,
          "topicId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "Content_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "Content_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE
        );
      `

      // Create indexes
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "Content_topicId_idx" ON "Content"("topicId");
        CREATE INDEX IF NOT EXISTS "Content_level_idx" ON "Content"("level");
        CREATE INDEX IF NOT EXISTS "Content_topicId_phase_idx" ON "Content"("topicId", "phase");
      `

      return NextResponse.json({ 
        success: true, 
        message: 'Content table created successfully' 
      })
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      return NextResponse.json({ 
        success: false, 
        error: dbError.message,
        details: 'Failed to create Content table'
      })
    }
  } catch (error) {
    console.error('Error creating content table:', error)
    return NextResponse.json(
      { error: 'Failed to create content table' },
      { status: 500 }
    )
  }
}