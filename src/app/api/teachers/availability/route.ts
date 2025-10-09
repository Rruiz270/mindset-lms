import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const availabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  isActive: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    const where: any = {
      isActive: true,
    };

    if (session.user.role === 'TEACHER') {
      where.teacherId = session.user.id;
    } else if (teacherId) {
      where.teacherId = teacherId;
    }

    const availability = await prisma.availability.findMany({
      where,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return NextResponse.json(availability);
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = availabilitySchema.parse(body);

    // Check for overlapping availability
    const existing = await prisma.availability.findFirst({
      where: {
        teacherId: session.user.id,
        dayOfWeek: validatedData.dayOfWeek,
        isActive: true,
        OR: [
          {
            AND: [
              { startTime: { lte: validatedData.startTime } },
              { endTime: { gt: validatedData.startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: validatedData.endTime } },
              { endTime: { gte: validatedData.endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: validatedData.startTime } },
              { endTime: { lte: validatedData.endTime } },
            ],
          },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Time slot overlaps with existing availability' },
        { status: 400 }
      );
    }

    const availability = await prisma.availability.create({
      data: {
        teacherId: session.user.id,
        ...validatedData,
        isActive: validatedData.isActive ?? true,
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(availability, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating availability:', error);
    return NextResponse.json(
      { error: 'Failed to create availability' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Availability ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.availability.findUnique({
      where: { id },
    });

    if (!existing || existing.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const availability = await prisma.availability.update({
      where: { id },
      data: updateData,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(availability);
  } catch (error) {
    console.error('Error updating availability:', error);
    return NextResponse.json(
      { error: 'Failed to update availability' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Availability ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.availability.findUnique({
      where: { id },
    });

    if (!existing || existing.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.availability.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Availability deleted successfully' });
  } catch (error) {
    console.error('Error deleting availability:', error);
    return NextResponse.json(
      { error: 'Failed to delete availability' },
      { status: 500 }
    );
  }
}