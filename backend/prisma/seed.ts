import { prisma } from '../src/db/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding database with full test environment...');

  // Clear existing database records to prevent duplicate key constraint issues
  await prisma.inspectionAccessory.deleteMany();
  await prisma.returnInspection.deleteMany();
  await prisma.repairTask.deleteMany();
  await prisma.pickupTask.deleteMany();
  await prisma.returnTask.deleteMany();
  await prisma.depositTransaction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.rentalItem.deleteMany();
  await prisma.rentalOrder.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.accessory.deleteMany();
  await prisma.pricingRule.deleteMany();
  await prisma.depositRule.deleteMany();
  await prisma.lateFeeRule.deleteMany();
  await prisma.inventoryUnit.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.rentalPeriod.deleteMany();
  await prisma.priceList.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@rental.com',
      passwordHash: passwordHash,
      fullName: 'Super Admin',
      role: 'ADMIN',
      isActive: true,
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'jane.doe@example.com',
      passwordHash: passwordHash,
      fullName: 'Jane Doe',
      role: 'CUSTOMER',
      isActive: true,
    },
  });

  const alice = await prisma.user.create({
    data: {
      email: 'alice.smith@example.com',
      passwordHash: passwordHash,
      fullName: 'Alice Smith',
      role: 'CUSTOMER',
      isActive: true,
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob.johnson@example.com',
      passwordHash: passwordHash,
      fullName: 'Bob Johnson',
      role: 'CUSTOMER',
      isActive: true,
    },
  });

  console.log('✔ Seeded Users: admin@rental.com, jane.doe@example.com');

  // 2. Create Price Lists
  const defaultPriceList = await prisma.priceList.create({
    data: {
      name: 'Standard Pricing',
      description: 'Default everyday pricing',
      isDefault: true,
      isActive: true,
    }
  });

  // 3. Create Rental Periods
  const hourlyPeriod = await prisma.rentalPeriod.create({
    data: { name: 'Hourly', unit: 'HOUR', duration: 1, isActive: true }
  });

  const dailyPeriod = await prisma.rentalPeriod.create({
    data: { name: 'Daily', unit: 'DAY', duration: 1, isActive: true }
  });

  const weeklyPeriod = await prisma.rentalPeriod.create({
    data: { name: 'Weekly', unit: 'WEEK', duration: 1, isActive: true }
  });

  console.log('✔ Seeded PriceLists & RentalPeriods');

  // 4. Create Products
  const camera = await prisma.product.create({
    data: {
      name: 'Sony A7III Camera',
      slug: 'sony-a7iii',
      description: 'Full frame mirrorless camera perfect for video and photo.',
      category: 'Photography',
      isActive: true,
    }
  });

  const hammer = await prisma.product.create({
    data: {
      name: 'DeWalt Rotary Hammer Drill',
      slug: 'dewalt-rotary-hammer-drill',
      description: 'Heavy-duty 1-inch SDS Plus rotary hammer drill for concrete masonry.',
      category: 'Power Tools',
      isActive: true,
    }
  });

  const generator = await prisma.product.create({
    data: {
      name: 'Yamaha Portable Generator',
      slug: 'yamaha-portable-generator',
      description: '2000-Watt gas powered quiet inverter generator.',
      category: 'Generators',
      isActive: true,
    }
  });

  console.log('✔ Seeded Products');

  // 5. Create Variants
  const cameraVariant = await prisma.productVariant.create({
    data: {
      productId: camera.id,
      sku: 'SONY-A7III-BLK',
      brand: 'Sony',
      color: 'Black',
      size: 'Body Only',
      isActive: true,
    }
  });

  const hammerVariant = await prisma.productVariant.create({
    data: {
      productId: hammer.id,
      sku: 'SKU-HAMMER-001',
      brand: 'DeWalt',
      isActive: true,
    }
  });

  const generatorVariant = await prisma.productVariant.create({
    data: {
      productId: generator.id,
      sku: 'SKU-GEN-001',
      brand: 'Yamaha',
      isActive: true,
    }
  });

  console.log('✔ Seeded Variants');

  // 6. Create Pricing Rules (Standard List)
  // Sony Camera
  await prisma.pricingRule.create({
    data: { priceListId: defaultPriceList.id, rentalPeriodId: dailyPeriod.id, productId: camera.id, variantId: cameraVariant.id, price: 3000.00 }
  });
  await prisma.pricingRule.create({
    data: { priceListId: defaultPriceList.id, rentalPeriodId: weeklyPeriod.id, productId: camera.id, variantId: cameraVariant.id, price: 15000.00 }
  });

  // DeWalt Hammer Drill
  await prisma.pricingRule.create({
    data: { priceListId: defaultPriceList.id, rentalPeriodId: dailyPeriod.id, productId: hammer.id, variantId: hammerVariant.id, price: 1000.00 }
  });
  await prisma.pricingRule.create({
    data: { priceListId: defaultPriceList.id, rentalPeriodId: hourlyPeriod.id, productId: hammer.id, variantId: hammerVariant.id, price: 200.00 }
  });

  // Yamaha Generator
  await prisma.pricingRule.create({
    data: { priceListId: defaultPriceList.id, rentalPeriodId: dailyPeriod.id, productId: generator.id, variantId: generatorVariant.id, price: 2000.00 }
  });

  // 7. Create Late Fee Rules
  await prisma.lateFeeRule.create({
    data: { productId: camera.id, unit: 'DAILY', amount: 500, gracePeriodMinutes: 120, maxFee: 5000, isActive: true }
  });

  await prisma.lateFeeRule.create({
    data: { productId: hammer.id, unit: 'DAILY', amount: 250, gracePeriodMinutes: 60, maxFee: 2500, isActive: true }
  });

  await prisma.lateFeeRule.create({
    data: { productId: generator.id, unit: 'DAILY', amount: 500, gracePeriodMinutes: 60, maxFee: 5000, isActive: true }
  });

  // 8. Create Deposit Rules
  await prisma.depositRule.create({
    data: { productId: camera.id, type: 'FIXED', amount: 5000, isActive: true }
  });
  await prisma.depositRule.create({
    data: { productId: hammer.id, type: 'FIXED', amount: 2000, isActive: true }
  });
  await prisma.depositRule.create({
    data: { productId: generator.id, type: 'FIXED', amount: 5000, isActive: true }
  });

  // 9. Create Accessories
  const lensAccessory = await prisma.accessory.create({
    data: { productId: camera.id, name: '28-70mm Kit Lens', quantity: 1, isRequired: false }
  });

  const caseAccessory = await prisma.accessory.create({
    data: { productId: hammer.id, name: 'Hard Carry Case', quantity: 1, isRequired: true }
  });

  const cordAccessory = await prisma.accessory.create({
    data: { productId: generator.id, name: 'Heavy Duty Extension Cord', quantity: 1, isRequired: true }
  });

  console.log('✔ Seeded Pricing, Late Fee, Deposit rules, and Accessories');

  // 10. Create Inventory Units
  const cameraUnit = await prisma.inventoryUnit.create({
    data: { variantId: cameraVariant.id, assetTag: 'AST-A7III-001', qrCode: 'QR-A7III-001', status: 'AVAILABLE', condition: 'GOOD', location: 'Warehouse A' }
  });

  const hammerUnit = await prisma.inventoryUnit.create({
    data: { variantId: hammerVariant.id, assetTag: 'AST-HAMMER-001', qrCode: 'QR-HAMMER-001', status: 'AVAILABLE', condition: 'GOOD', location: 'Shelf B2' }
  });

  const generatorUnit = await prisma.inventoryUnit.create({
    data: { variantId: generatorVariant.id, assetTag: 'AST-GEN-001', qrCode: 'QR-GEN-001', status: 'RENTED', condition: 'GOOD', location: 'Floor Grid C' }
  });

  console.log('✔ Seeded Inventory Units');

  // 11. Create Active Operations Tasks
  // Alice Order (Scheduled for Pickup today)
  await prisma.rentalOrder.create({
    data: {
      orderNumber: 'ORD-PICKUP-TODAY',
      customerId: alice.id,
      status: 'CONFIRMED',
      deliveryMethod: 'STORE_PICKUP',
      subtotal: 1000,
      depositTotal: 2000,
      grandTotal: 3000,
      items: {
        create: {
          productId: hammer.id,
          variantId: hammerVariant.id,
          inventoryUnitId: hammerUnit.id,
          priceListId: defaultPriceList.id,
          rentalPeriodId: dailyPeriod.id,
          quantity: 1,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + 86400000),
          unitPrice: 1000,
          depositAmount: 2000
        }
      },
      payments: {
        createMany: {
          data: [
            { amount: 1000, type: 'RENTAL_CHARGE', status: 'PAID', provider: 'CARD', userId: alice.id },
            { amount: 2000, type: 'SECURITY_DEPOSIT', status: 'PAID', provider: 'CARD', userId: alice.id }
          ]
        }
      },
      pickupTasks: {
        create: {
          status: 'SCHEDULED',
          scheduledAt: new Date(),
          sequenceNumber: 1,
          routeNotes: 'Verify drill chuck and scan QR to finalize pickup.',
          checklist: ['Verify safety manual is in case', 'Confirm battery pack charged', 'Scan QR Code']
        }
      }
    }
  });

  // Bob Order (Scheduled for Return today, is 2 days late!)
  await prisma.rentalOrder.create({
    data: {
      orderNumber: 'ORD-RETURN-TODAY',
      customerId: bob.id,
      status: 'PICKED_UP',
      deliveryMethod: 'STORE_PICKUP',
      subtotal: 2000,
      depositTotal: 5000,
      grandTotal: 7000,
      pickedUpAt: new Date(Date.now() - 4 * 86400000),
      items: {
        create: {
          productId: generator.id,
          variantId: generatorVariant.id,
          inventoryUnitId: generatorUnit.id,
          priceListId: defaultPriceList.id,
          rentalPeriodId: dailyPeriod.id,
          quantity: 1,
          startsAt: new Date(Date.now() - 4 * 86400000),
          endsAt: new Date(Date.now() - 2 * 86400000), // Overdue by 2 days
          unitPrice: 2000,
          depositAmount: 5000
        }
      },
      payments: {
        createMany: {
          data: [
            { amount: 2000, type: 'RENTAL_CHARGE', status: 'PAID', provider: 'CARD', userId: bob.id },
            { amount: 5000, type: 'SECURITY_DEPOSIT', status: 'PAID', provider: 'CARD', userId: bob.id }
          ]
        }
      },
      depositTransactions: {
        create: {
          amount: 5000,
          type: 'HOLD',
          status: 'HELD'
        }
      },
      returnTasks: {
        create: {
          status: 'SCHEDULED',
          scheduledAt: new Date()
        }
      }
    }
  });

  console.log('✔ Seeded operational pickup/return orders & tasks');
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
