import { prisma } from '@/lib/prisma'
import 'dotenv/config';

import { hash } from 'bcryptjs';

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Super Admin
  const hashedPassword = await hash('SuperAdmin123!', 12);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@example.com' },
    update: {},
    create: {
      email: 'superadmin@example.com',
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
