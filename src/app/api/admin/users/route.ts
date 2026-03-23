import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        packages: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: [
        { role: 'asc' },
        { createdAt: 'desc' }
      ],
    });

    // Format the response
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      level: user.level,
      studentId: user.studentId,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      packages: user.packages.map(pkg => ({
        id: pkg.id,
        totalLessons: pkg.totalLessons,
        usedLessons: pkg.usedLessons,
        remainingLessons: pkg.remainingLessons,
        validFrom: pkg.validFrom.toISOString(),
        validUntil: pkg.validUntil.toISOString(),
      }))
    }));

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      stats: {
        total: users.length,
        students: users.filter(u => u.role === 'STUDENT').length,
        teachers: users.filter(u => u.role === 'TEACHER').length,
        admins: users.filter(u => u.role === 'ADMIN').length,
        active: users.filter(u => u.isActive).length
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, action, level, totalLessons, validMonths } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'userId and action required' }, { status: 400 });
    }

    if (action === 'updateLevel') {
      const validLevels = ['STARTER', 'SURVIVOR', 'EXPLORER', 'EXPERT'];
      if (!validLevels.includes(level)) {
        return NextResponse.json({ error: 'Invalid level' }, { status: 400 });
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: { level },
      });

      return NextResponse.json({ success: true, user: { id: user.id, level: user.level } });
    }

    if (action === 'addPackage') {
      const lessons = totalLessons || 20;
      const months = validMonths || 6;
      const now = new Date();
      const validUntil = new Date(now);
      validUntil.setMonth(validUntil.getMonth() + months);

      const pkg = await prisma.package.create({
        data: {
          userId,
          totalLessons: lessons,
          usedLessons: 0,
          remainingLessons: lessons,
          validFrom: now,
          validUntil,
        },
      });

      return NextResponse.json({ success: true, package: pkg });
    }

    if (action === 'toggleActive') {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { isActive: !user.isActive },
      });

      return NextResponse.json({ success: true, isActive: updated.isActive });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}