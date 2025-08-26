import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// This endpoint creates the database schema
export async function POST(request: NextRequest) {
  try {
    // Run prisma db push to create the schema
    const { stdout, stderr } = await execAsync('npx prisma db push --accept-data-loss')
    
    if (stderr && !stderr.includes('Warnings:')) {
      throw new Error(`Prisma error: ${stderr}`)
    }

    return NextResponse.json({
      message: 'Database schema created successfully!',
      output: stdout
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { message: 'Migration failed', error: error.message },
      { status: 500 }
    )
  }
}