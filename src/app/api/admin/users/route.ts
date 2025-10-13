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
      phone: user.phone,
      birthDate: user.birthDate?.toISOString(),
      gender: user.gender,
      address: user.address,
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