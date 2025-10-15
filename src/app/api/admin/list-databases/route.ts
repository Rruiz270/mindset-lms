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

    // List all databases
    const databases = await prisma.$queryRaw`
      SELECT datname as name 
      FROM pg_database 
      WHERE datistemplate = false 
      AND datname NOT IN ('postgres', 'template0', 'template1')
      ORDER BY datname
    `

    // Get current database
    const currentDb = await prisma.$queryRaw`
      SELECT current_database() as name
    `

    // Check if mindset_lms exists
    const checkMindsetDb = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM pg_database 
      WHERE datname = 'mindset_lms'
    `

    return NextResponse.json({
      current: (currentDb as any[])[0].name,
      databases: databases,
      mindsetLmsExists: Number((checkMindsetDb as any[])[0].count) > 0,
      connectionString: process.env.DATABASE_URL?.split('@')[1]?.split('/')[1]?.split('?')[0] || 'unknown'
    })

  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Failed to list databases',
        details: error.message
      },
      { status: 500 }
    )
  }
}