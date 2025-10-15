import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Test 1: Check if table exists
    let tableExists = false
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Content'
      `
      tableExists = (tables as any[]).length > 0
    } catch (e: any) {
      return NextResponse.json({ 
        test: 'table_check',
        error: e.message 
      })
    }

    // Test 2: Check enums
    let enumsExist = { ContentType: false, ContentPhase: false }
    try {
      const types = await prisma.$queryRaw`
        SELECT typname 
        FROM pg_type 
        WHERE typname IN ('ContentType', 'ContentPhase')
      `
      for (const type of types as any[]) {
        enumsExist[type.typname as keyof typeof enumsExist] = true
      }
    } catch (e: any) {
      return NextResponse.json({ 
        test: 'enum_check',
        error: e.message 
      })
    }

    // Test 3: Try to select from Content
    let contentCount = 0
    let selectError = null
    try {
      const result = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM "Content"
      `
      contentCount = Number((result as any[])[0].count)
    } catch (e: any) {
      selectError = e.message
    }

    // Test 4: Get a sample topic
    let sampleTopic = null
    try {
      const topics = await prisma.$queryRaw`
        SELECT id, name FROM "Topic" 
        WHERE name = 'Travel: Things to Do' 
        LIMIT 1
      `
      sampleTopic = (topics as any[])[0]
    } catch (e: any) {
      return NextResponse.json({ 
        test: 'topic_check',
        error: e.message 
      })
    }

    // Test 5: Try a simple insert
    let insertResult = null
    let insertError = null
    if (tableExists && sampleTopic) {
      try {
        await prisma.$executeRaw`
          INSERT INTO "Content" (
            "id", "title", "description", "type", "phase", 
            "duration", "order", "level", "topicId",
            "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid()::text,
            'Test Content',
            'Test Description',
            'reading'::"ContentType",
            'pre_class'::"ContentPhase",
            10,
            999,
            'starter',
            ${sampleTopic.id},
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          )
        `
        insertResult = 'Success'
        
        // Delete the test content
        await prisma.$executeRaw`
          DELETE FROM "Content" WHERE "title" = 'Test Content'
        `
      } catch (e: any) {
        insertError = {
          message: e.message,
          code: e.code,
          detail: e.meta
        }
      }
    }

    return NextResponse.json({
      tableExists,
      enumsExist,
      contentCount,
      selectError,
      sampleTopic,
      insertResult,
      insertError,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
    })
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: error.message
      },
      { status: 500 }
    )
  }
}