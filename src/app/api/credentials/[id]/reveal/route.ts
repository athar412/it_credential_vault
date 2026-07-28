import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { verifyHash, decryptPassword } from '@/lib/crypto';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { pin } = await request.json();
    if (!pin) return NextResponse.json({ error: 'PIN is required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const isPinValid = await verifyHash(pin, user.pinHash);
    if (!isPinValid) {
      await prisma.auditLog.create({
        data: {
          action: 'FAILED_PIN_ATTEMPT',
          username: session.username,
          targetId: id,
        }
      });
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 403 });
    }

    const credential = await prisma.credential.findUnique({ where: { id } });
    if (!credential) return NextResponse.json({ error: 'Credential not found' }, { status: 404 });

    if (session.role !== 'SUPER_ADMIN' && credential.division !== session.division) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (credential.isPasswordless || !credential.encryptedPassword || !credential.iv || !credential.authTag) {
      return NextResponse.json({ error: 'No password available to reveal' }, { status: 400 });
    }

    const password = decryptPassword(credential.encryptedPassword, credential.iv, credential.authTag);
    if (!password) return NextResponse.json({ error: 'Failed to decrypt password' }, { status: 500 });

    await prisma.auditLog.create({
      data: {
        action: 'REVEAL_PASSWORD',
        username: session.username,
        targetId: id,
        details: `Revealed password for ${credential.platform}`
      }
    });

    return NextResponse.json({ success: true, password });
  } catch (error) {
    console.error('Reveal error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
