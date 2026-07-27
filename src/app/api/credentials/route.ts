import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { encryptPassword } from '@/lib/crypto';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let credentials;
  if (session.role === 'SUPER_ADMIN') {
    credentials = await prisma.credential.findMany({ orderBy: { createdAt: 'desc' } });
  } else {
    credentials = await prisma.credential.findMany({
      where: { division: session.division! },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Strip sensitive fields
  const safeCredentials = credentials.map(c => ({
    id: c.id,
    platform: c.platform,
    account: c.account,
    division: c.division,
    role: c.role,
    updatedAt: c.updatedAt
  }));

  return NextResponse.json({ credentials: safeCredentials });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const { platform, account, division, role, password } = data;

    if (!platform || !account || !division || !role || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (session.role !== 'SUPER_ADMIN' && session.division !== division) {
      return NextResponse.json({ error: 'Cannot create credential for another division' }, { status: 403 });
    }

    const { encryptedPassword, iv, authTag } = encryptPassword(password);

    const credential = await prisma.credential.create({
      data: {
        platform,
        account,
        division,
        role,
        encryptedPassword,
        iv,
        authTag
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE_CREDENTIAL',
        username: session.username,
        targetId: credential.id,
        details: `Created credential for ${platform}`
      }
    });

    return NextResponse.json({ success: true, id: credential.id });
  } catch (error) {
    console.error('Error creating credential:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
