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

  // Create sample Admin
  const adminPassword = await hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      authProvider: 'MANUAL',
      emailVerified: new Date(),
      isActive: true,
    },
  });

  console.log('✅ Admin created:', admin.email);

  // Create sample User
  const userPassword = await hash('User123!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Regular User',
      password: userPassword,
      role: 'USER',
      authProvider: 'MANUAL',
      emailVerified: new Date(),
      isActive: true,
    },
  });

  console.log('✅ Regular User created:', user.email);

  // Create sample approved posts
  const post1 = await prisma.post.create({
    data: {
      title: 'Welcome to Secure Auth',
      content: 'This is a sample approved post visible to everyone on the public feed.',
      isApproved: true,
      authorId: superAdmin.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: 'Getting Started Guide',
      content: 'Learn how to use this application with role-based access control.',
      isApproved: true,
      authorId: admin.id,
    },
  });

  console.log('✅ Sample posts created');

  // Create pending post
  await prisma.post.create({
    data: {
      title: 'Pending Post',
      content: 'This post is awaiting approval from an admin.',
      isApproved: false,
      authorId: user.id,
    },
  });

  console.log('✅ Pending post created');

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('Login credentials:');
  console.log('Super Admin: superadmin@example.com / SuperAdmin123!');
  console.log('Admin: admin@example.com / Admin123!');
  console.log('User: user@example.com / User123!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
