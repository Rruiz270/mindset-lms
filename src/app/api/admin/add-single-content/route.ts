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

    // First check if Content table has enums
    const enumCheck = await prisma.$queryRaw`
      SELECT 
        pg_type.typname as enum_name,
        pg_enum.enumlabel as enum_value
      FROM pg_type 
      JOIN pg_enum ON pg_enum.enumtypid = pg_type.oid
      WHERE pg_type.typname IN ('ContentType', 'ContentPhase')
      ORDER BY pg_type.typname, pg_enum.enumsortorder
    `
    
    if ((enumCheck as any[]).length === 0) {
      // Create enums if they don't exist
      try {
        await prisma.$executeRaw`
          CREATE TYPE "ContentType" AS ENUM ('reading', 'video', 'audio', 'exercise', 'quiz', 'discussion')
        `
      } catch (e) {
        console.log('ContentType enum might already exist')
      }
      
      try {
        await prisma.$executeRaw`
          CREATE TYPE "ContentPhase" AS ENUM ('pre_class', 'live_class', 'post_class')
        `
      } catch (e) {
        console.log('ContentPhase enum might already exist')
      }
    }

    // Get the Travel topic
    const topics = await prisma.$queryRaw`
      SELECT id, name FROM "Topic" 
      WHERE name = 'Travel: Things to Do' 
      LIMIT 1
    `
    
    const topic = (topics as any[])[0]
    if (!topic) {
      return NextResponse.json({ 
        error: 'Travel topic not found',
        suggestion: 'Please run the setup-topics endpoint first' 
      }, { status: 404 })
    }

    // Try to insert a single content item
    try {
      const result = await prisma.$executeRaw`
        INSERT INTO "Content" (
          "id", 
          "title", 
          "description", 
          "type", 
          "phase", 
          "duration", 
          "resourceUrl", 
          "order", 
          "level", 
          "topicId",
          "createdAt", 
          "updatedAt"
        ) VALUES (
          gen_random_uuid()::text,
          'Test Content Item',
          'This is a test content item to verify database insertion',
          'reading'::"ContentType",
          'pre_class'::"ContentPhase",
          10,
          null,
          1,
          'starter',
          ${topic.id},
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
      `
      
      // Check if it was inserted
      const count = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM "Content" WHERE "topicId" = ${topic.id}
      `
      
      return NextResponse.json({
        success: true,
        message: 'Test content added successfully',
        topicId: topic.id,
        contentCount: Number((count as any[])[0].count)
      })
      
    } catch (insertError: any) {
      return NextResponse.json({
        error: 'Failed to insert content',
        details: insertError.message,
        code: insertError.code,
        hint: 'Check if Content table has proper structure and enums'
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Error in add-single-content:', error)
    return NextResponse.json(
      { 
        error: 'Failed to add content',
        details: error.message
      },
      { status: 500 }
    )
  }
}