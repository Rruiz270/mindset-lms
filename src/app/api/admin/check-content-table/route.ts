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

    // Check if Content table exists and its structure
    const tableInfo = await prisma.$queryRaw`
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        udt_name
      FROM information_schema.columns 
      WHERE table_name = 'Content' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `
    
    // Check enums
    const enums = await prisma.$queryRaw`
      SELECT 
        pg_type.typname as enum_name,
        array_agg(pg_enum.enumlabel ORDER BY pg_enum.enumsortorder) as values
      FROM pg_type 
      JOIN pg_enum ON pg_enum.enumtypid = pg_type.oid
      WHERE pg_type.typname IN ('ContentType', 'ContentPhase')
      GROUP BY pg_type.typname
    `
    
    // Count content
    let contentCount = 0
    let contentByPhase = {}
    try {
      const count = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM "Content"
      `
      contentCount = Number((count as any[])[0].count)
      
      // Count by phase
      const phaseCount = await prisma.$queryRaw`
        SELECT phase, COUNT(*) as count 
        FROM "Content" 
        GROUP BY phase
      `
      contentByPhase = (phaseCount as any[]).reduce((acc, row) => {
        acc[row.phase] = Number(row.count)
        return acc
      }, {})
    } catch (e) {
      console.log('Error counting content:', e)
    }
    
    // Get sample content
    let sampleContent = []
    try {
      sampleContent = await prisma.$queryRaw`
        SELECT id, title, type, phase, "topicId" 
        FROM "Content" 
        LIMIT 5
      `
    } catch (e) {
      console.log('Error getting sample content:', e)
    }
    
    return NextResponse.json({
      tableExists: (tableInfo as any[]).length > 0,
      columns: tableInfo,
      enums: enums,
      contentCount,
      contentByPhase,
      sampleContent,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Error checking content table:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check content table',
        details: error.message
      },
      { status: 500 }
    )
  }
}