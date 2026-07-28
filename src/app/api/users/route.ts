import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        division: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { username, password, pin, role, division, securityPin } = await req.json();

    if (!username || !password || !pin || !role || !securityPin) {
      return NextResponse.json({ error: 'Missing required fields including security PIN' }, { status: 400 });
    }

    const sessionUser = await prisma.user.findUnique({ where: { id: session.id } });
    if (!sessionUser || !(await bcrypt.compare(securityPin, sessionUser.pinHash))) {
      return NextResponse.json({ error: 'Invalid security PIN' }, { status: 403 });
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const pinHash = await bcrypt.hash(pin, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        passwordHash,
        pinHash,
        role,
        division: role === 'SUPER_ADMIN' ? null : division,
      }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_USER',
        username: session.username,
        targetId: newUser.id,
        details: `Created user ${username} with role ${role}`
      }
    });

    return NextResponse.json({ success: true, userId: newUser.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
