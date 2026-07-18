import { prisma } from './src/db/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  // Hash password
  const passwordHash = await bcrypt.hash('password123', 10);

  // Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@rental.com',
      passwordHash: passwordHash,
      fullName: 'Super Admin',
      role: 'ADMIN',
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'jane.doe@example.com',
      passwordHash: passwordHash,
      fullName: 'Jane Doe',
      role: 'CUSTOMER',
    },
  });

  // Products
  const hammer = await prisma.product.create({
    data: {
      name: 'DeWalt Rotary Hammer Drill',
      slug: 'dewalt-rotary-hammer-drill',
      description: 'Heavy-duty 1-inch SDS Plus rotary hammer drill for concrete masonry.',
      category: 'Power Tools',
    },
  });

  const generator = await prisma.product.create({
    data: {
      name: 'Yamaha Portable Generator',
      slug: 'yamaha-portable-generator',
      description: '2000-Watt gas powered quiet inverter generator.',
      category: 'Generators',
    },
  });

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
