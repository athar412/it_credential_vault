import { PrismaClient } from '@prisma/client';
import { hashText, encryptPassword } from '../src/lib/crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // Create Users
  const superAdminPassword = await hashText('admin123');
  const superAdminPin = await hashText('123456');

  const marketingPassword = await hashText('user123');
  const marketingPin = await hashText('654321');

  const devopsPassword = await hashText('user123');
  const devopsPin = await hashText('112233');

  const superAdmin = await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      username: 'superadmin',
      passwordHash: superAdminPassword,
      pinHash: superAdminPin,
      role: 'SUPER_ADMIN',
    },
  });

  const marketingAdmin = await prisma.user.upsert({
    where: { username: 'marketing' },
    update: {},
    create: {
      username: 'marketing',
      passwordHash: marketingPassword,
      pinHash: marketingPin,
      role: 'ADMIN_DIVISI',
      division: 'Marketing',
    },
  });

  const devopsAdmin = await prisma.user.upsert({
    where: { username: 'devops' },
    update: {},
    create: {
      username: 'devops',
      passwordHash: devopsPassword,
      pinHash: devopsPin,
      role: 'ADMIN_DIVISI',
      division: 'DevOps',
    },
  });

  console.log('Users seeded');

  // Create Sample Credentials
  const marketingCred1 = encryptPassword('m4rk3t1ng_S3cr3t!');
  await prisma.credential.create({
    data: {
      platform: 'Mailchimp',
      account: 'marketing@company.com',
      division: 'Marketing',
      role: 'Admin',
      encryptedPassword: marketingCred1.encryptedPassword,
      iv: marketingCred1.iv,
      authTag: marketingCred1.authTag,
    }
  });

  const devopsCred1 = encryptPassword('D3v0ps_AWS_P@ssw0rd');
  await prisma.credential.create({
    data: {
      platform: 'AWS',
      account: 'root@company.com',
      division: 'DevOps',
      role: 'Root Admin',
      encryptedPassword: devopsCred1.encryptedPassword,
      iv: devopsCred1.iv,
      authTag: devopsCred1.authTag,
    }
  });

  console.log('Credentials seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
