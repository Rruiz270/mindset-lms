import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the student's active package
    const packageInfo = await prisma.package.findFirst({
      where: {
        userId: session.user.id,
        validUntil: {
          gte: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!packageInfo) {
      return NextResponse.json({
        totalLessons: 0,
        usedLessons: 0,
        remainingLessons: 0,
        validUntil: null
      })
    }

    // Calculate remaining lessons
    const remainingLessons = packageInfo.totalLessons - packageInfo.usedLessons

    return NextResponse.json({
      totalLessons: packageInfo.totalLessons,
      usedLessons: packageInfo.usedLessons,
      remainingLessons,
      validUntil: packageInfo.validUntil
    })
  } catch (error) {
    console.error('Error fetching package info:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}