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

    // Test 1: Check DATABASE_URL
    const hasDbUrl = !!process.env.DATABASE_URL
    const dbUrlPattern = process.env.DATABASE_URL ? 
      process.env.DATABASE_URL.includes('neon.tech') ? 'Neon URL detected' : 'Non-Neon URL' 
      : 'No URL'

    // Test 2: Try a simple query
    let connectionTest = 'Not tested'
    let connectionError = null
    try {
      const result = await prisma.$queryRaw`SELECT NOW() as current_time`
      connectionTest = 'Success'
    } catch (error: any) {
      connectionTest = 'Failed'
      connectionError = error.message
    }

    // Test 3: Get database name
    let dbName = null
    try {
      const result = await prisma.$queryRaw`SELECT current_database() as db_name`
      dbName = (result as any[])[0]?.db_name
    } catch (error) {
      // Ignore
    }

    // Test 4: Count tables
    let tableCount = 0
    let tables = []
    try {
      const result = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `
      tables = (result as any[]).map(r => r.table_name)
      tableCount = tables.length
    } catch (error) {
      // Ignore
    }

    return NextResponse.json({
      databaseUrl: {
        exists: hasDbUrl,
        type: dbUrlPattern
      },
      connection: {
        status: connectionTest,
        error: connectionError
      },
      database: {
        name: dbName,
        tableCount,
        tables: tables.slice(0, 10) // First 10 tables
      },
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}