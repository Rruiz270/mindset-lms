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

    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId');
    const phase = searchParams.get('phase');
    const category = searchParams.get('category');

    const where: any = {};

    if (topicId) {
      where.topicId = topicId;
    }

    if (phase) {
      where.phase = phase;
    }

    if (category) {
      where.category = category;
    }

    const exercises = await prisma.exercise.findMany({
      where,
      include: {
        topic: {
          select: {
            name: true,
            level: true,
          },
        },
        submissions: session.user.role === 'STUDENT' ? {
          where: {
            userId: session.user.id,
          },
          select: {
            id: true,
            score: true,
            submittedAt: true,
            feedback: true,
          },
          orderBy: {
            submittedAt: 'desc',
          },
          take: 1,
        } : false,
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });

    return NextResponse.json(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      topicId,
      phase,
      category,
      type,
      title,
      instructions,
      content,
      correctAnswer,
      points,
      orderIndex,
    } = body;

    const exercise = await prisma.exercise.create({
      data: {
        topicId,
        phase,
        category,
        type,
        title,
        instructions,
        content,
        correctAnswer,
        points: points || 10,
        orderIndex,
      },
      include: {
        topic: {
          select: {
            name: true,
            level: true,
          },
        },
      },
    });

    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error('Error creating exercise:', error);
    return NextResponse.json(
      { error: 'Failed to create exercise' },
      { status: 500 }
    );
  }
}