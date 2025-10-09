import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teachers = await prisma.user.findMany({
      where: {
        role: 'TEACHER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        teacherAvailability: {
          where: {
            isActive: true,
          },
          select: {
            dayOfWeek: true,
            startTime: true,
            endTime: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teachers' },
      { status: 500 }
    );
  }
}