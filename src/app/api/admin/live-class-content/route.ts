import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const topics = await prisma.topic.findMany({
      include: {
        liveClassSlides: {
          include: {
            exercises: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        orderIndex: 'asc'
      }
    });

    return NextResponse.json(topics);
  } catch (error) {
    console.error('Error fetching live class content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topicId, slides, lessonPlan, objectives, materials } = await request.json();

    // Update topic
    const updatedTopic = await prisma.topic.update({
      where: { id: topicId },
      data: {
        lessonPlan,
        objectives,
        materials
      }
    });

    // Update slides
    for (const slide of slides) {
      await prisma.slide.upsert({
        where: { id: slide.id },
        update: {
          title: slide.title,
          type: slide.type,
          content: slide.content,
          notes: slide.notes,
          slideNumber: slide.slideNumber || 1
        },
        create: {
          id: slide.id,
          topicId: topicId,
          title: slide.title,
          type: slide.type,
          content: slide.content,
          notes: slide.notes,
          order: slide.order || 0,
          slideNumber: slide.slideNumber || 1
        }
      });

      // Update exercises for this slide
      if (slide.content.exercises) {
        // Delete existing exercises
        await prisma.slideExercise.deleteMany({
          where: { slideId: slide.id }
        });

        // Create new exercises
        for (const exercise of slide.content.exercises) {
          await prisma.slideExercise.create({
            data: {
              id: exercise.id,
              slideId: slide.id,
              type: exercise.type,
              content: exercise.content,
              options: exercise.options || [],
              correctAnswer: exercise.correctAnswer
            }
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving live class content:', error);
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 });
  }
}