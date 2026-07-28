import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { encryptPassword } from '@/lib/crypto';
import bcrypt from 'bcryptjs';

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
    isPasswordless: c.isPasswordless,
    has2FA: c.has2FA,
    twoFAMethod: c.twoFAMethod,
    accessUsers: c.accessUsers,
    updatedAt: c.updatedAt
  }));

  return NextResponse.json({ credentials: safeCredentials });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const { platform, account, division, role, password, securityPin, isPasswordless, has2FA, twoFAMethod, accessUsers } = data;

    if (!platform || !account || !division || !role || !securityPin) {
      return NextResponse.json({ error: 'All fields including security PIN are required' }, { status: 400 });
    }
    
    if (!isPasswordless && !password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const isPinValid = await bcrypt.compare(securityPin, user.pinHash);
    if (!isPinValid) return NextResponse.json({ error: 'Invalid security PIN' }, { status: 403 });

    if (session.role !== 'SUPER_ADMIN' && session.division !== division) {
      return NextResponse.json({ error: 'Cannot create credential for another division' }, { status: 403 });
    }

    let encryptedPassword = null;
    let iv = null;
    let authTag = null;
    
    if (!isPasswordless && password) {
      const encrypted = encryptPassword(password);
      encryptedPassword = encrypted.encryptedPassword;
      iv = encrypted.iv;
      authTag = encrypted.authTag;
    }

    const credential = await prisma.credential.create({
      data: {
        platform,
        account,
        division,
        role,
        encryptedPassword,
        iv,
        authTag,
        isPasswordless: isPasswordless || false,
        has2FA: has2FA || false,
        twoFAMethod,
        accessUsers
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
