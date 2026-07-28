import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Await params object for Next.js 15+ compatibility
    const { id } = await params;
    const { username, role, division, password, pin, securityPin } = await req.json();

    if (!securityPin) return NextResponse.json({ error: 'Security PIN is required' }, { status: 400 });
    const sessionUser = await prisma.user.findUnique({ where: { id: session.id } });
    if (!sessionUser || !(await bcrypt.compare(securityPin, sessionUser.pinHash))) {
      return NextResponse.json({ error: 'Invalid security PIN' }, { status: 403 });
    }

    const dataToUpdate: any = { username, role };
    
    if (role === 'SUPER_ADMIN') {
      dataToUpdate.division = null;
    } else if (division !== undefined) {
      dataToUpdate.division = division;
    }

    if (password) {
      dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
    }
    
    if (pin) {
      dataToUpdate.pinHash = await bcrypt.hash(pin, 10);
    }

    // Check for username collision if changed
    if (username) {
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing && existing.id !== id) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_USER',
        username: session.username,
        targetId: id,
        details: `Updated user ${updatedUser.username}`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Await params object for Next.js 15+ compatibility
    const { id } = await params;

    const { securityPin } = await req.json();
    if (!securityPin) return NextResponse.json({ error: 'Security PIN is required' }, { status: 400 });
    const sessionUser = await prisma.user.findUnique({ where: { id: session.id } });
    if (!sessionUser || !(await bcrypt.compare(securityPin, sessionUser.pinHash))) {
      return NextResponse.json({ error: 'Invalid security PIN' }, { status: 403 });
    }

    if (id === session.id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'DELETE_USER',
        username: session.username,
        targetId: id,
        details: `Deleted user ${targetUser.username}`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
