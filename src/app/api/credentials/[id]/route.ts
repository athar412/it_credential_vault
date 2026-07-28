import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { encryptPassword } from '@/lib/crypto';
import bcrypt from 'bcryptjs';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const { platform, account, division, role, password, securityPin, isPasswordless, has2FA, twoFAMethod, accessUsers } = data;

    if (!securityPin) return NextResponse.json({ error: 'Security PIN is required' }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user || !(await bcrypt.compare(securityPin, user.pinHash))) {
      return NextResponse.json({ error: 'Invalid security PIN' }, { status: 403 });
    }

    const existing = await prisma.credential.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (session.role !== 'SUPER_ADMIN' && existing.division !== session.division) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updateData: any = { 
      platform, 
      account, 
      division, 
      role,
      ...(isPasswordless !== undefined && { isPasswordless }),
      ...(has2FA !== undefined && { has2FA }),
      ...(twoFAMethod !== undefined && { twoFAMethod }),
      ...(accessUsers !== undefined && { accessUsers })
    };

    if (isPasswordless) {
      updateData.encryptedPassword = null;
      updateData.iv = null;
      updateData.authTag = null;
    } else if (password) {
      const { encryptedPassword, iv, authTag } = encryptPassword(password);
      updateData.encryptedPassword = encryptedPassword;
      updateData.iv = iv;
      updateData.authTag = authTag;
    }

    await prisma.credential.update({
      where: { id },
      data: updateData
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_CREDENTIAL',
        username: session.username,
        targetId: id,
        details: `Updated credential for ${platform}`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const { securityPin } = data;
    if (!securityPin) return NextResponse.json({ error: 'Security PIN is required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user || !(await bcrypt.compare(securityPin, user.pinHash))) {
      return NextResponse.json({ error: 'Invalid security PIN' }, { status: 403 });
    }

    const existing = await prisma.credential.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (session.role !== 'SUPER_ADMIN' && existing.division !== session.division) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.credential.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE_CREDENTIAL',
        username: session.username,
        targetId: id,
        details: `Deleted credential for ${existing.platform}`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
