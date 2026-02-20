import 'dotenv/config';
import { prisma } from '@/lib/prisma'

import { hash } from 'bcryptjs';

async function main() {
  console.log('🌱 Starting database seed...');

  const passwrord = process.env.SUPER_ADMIN_PASSWORD;
  const email = process.env.SUPER_ADMIN_EMAIL;

  if (!passwrord || !email) {
    throw new Error('SUPER_ADMIN_PASSWORD or SUPER_ADMIN_EMAIL environment variable is not set');
  }



  // Create Super Admin
  const hashedPassword = await hash(passwrord, 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: email },
    update: {},
    create: {
      email: email,
      name: 'Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      authProvider: 'MANUAL',
      emailVerified: new Date(),
      isActive: true,
    },
  });

  console.log('✅ Super Admin created:', superAdmin.email);

  console.log('\n🎉 Database seeded successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
