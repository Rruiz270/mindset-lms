import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('Attempting login for:', email)
    
    // Check database connection
    await prisma.$connect()
    console.log('Database connected successfully')
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.log('User not found:', email)
      
      // Let's check what users exist
      const allUsers = await prisma.user.findMany({
        select: { email: true, role: true }
      })
      console.log('Available users:', allUsers)
      
      return NextResponse.json({ 
        error: 'User not found',
        availableUsers: allUsers 
      }, { status: 401 })
    }
    
    console.log('User found:', user.email, 'Role:', user.role)
    
    if (!user.password) {
      console.log('User has no password set')
      return NextResponse.json({ error: 'No password set' }, { status: 401 })
    }
    
    // Check password
    const isValid = await bcrypt.compare(password, user.password)
    console.log('Password valid:', isValid)
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        level: user.level
      }
    })
    
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}