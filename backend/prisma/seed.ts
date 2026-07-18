import { prisma } from '../src/db/prisma.js';

async function main() {
  console.log('Seeding database...');

  // 1. Create a Default Price List
  const defaultPriceList = await prisma.priceList.create({
    data: {
      name: 'Standard Pricing',
      description: 'Default everyday pricing',
      isDefault: true,
      isActive: true,
    }
  });

  // 2. Create a Seasonal Price List
  const summerPriceList = await prisma.priceList.create({
    data: {
      name: 'Summer Campaign',
      description: 'Special summer discount rates',
      isDefault: false,
      startsAt: new Date(new Date().setMonth(new Date().getMonth() - 1)), // 1 month ago
      endsAt: new Date(new Date().setMonth(new Date().getMonth() + 2)), // 2 months from now
      isActive: true,
    }
  });

  // 3. Create Rental Periods
  const dailyPeriod = await prisma.rentalPeriod.create({
    data: { name: 'Daily', unit: 'DAY', duration: 1, isActive: true }
  });

  const weeklyPeriod = await prisma.rentalPeriod.create({
    data: { name: 'Weekly', unit: 'WEEK', duration: 1, isActive: true }
  });

  // 4. Create a Base Product
  const product = await prisma.product.create({
    data: {
      name: 'Sony A7III Camera',
      slug: 'sony-a7iii',
      description: 'Full frame mirrorless camera perfect for video and photo.',
      category: 'Photography',
      isActive: true,
    }
  });

  // 5. Create Variants for the Product
  const variant1 = await prisma.productVariant.create({
    data: {
      productId: product.id,
      sku: 'SONY-A7III-BLK',
      brand: 'Sony',
      manufacturer: 'Sony Japan',
      color: 'Black',
      size: 'Body Only',
      isActive: true,
    }
  });

  const variant2 = await prisma.productVariant.create({
    data: {
      productId: product.id,
      sku: 'SONY-A7III-LENS',
      brand: 'Sony',
      manufacturer: 'Sony Japan',
      color: 'Black',
      size: 'With 28-70mm Lens',
      isActive: true,
    }
  });

  // 6. Create Pricing Rules (Standard List)
  await prisma.pricingRule.create({
    data: {
      priceListId: defaultPriceList.id,
      rentalPeriodId: dailyPeriod.id,
      productId: product.id,
      variantId: variant1.id,
      price: 3000.00,
    }
  });

  await prisma.pricingRule.create({
    data: {
      priceListId: defaultPriceList.id,
      rentalPeriodId: dailyPeriod.id,
      productId: product.id,
      variantId: variant2.id,
      price: 4500.00,
    }
  });

  // 7. Create Late Fee Rule for the Product
  await prisma.lateFeeRule.create({
    data: {
      productId: product.id,
      unit: 'DAILY',
      amount: 500,
      gracePeriodMinutes: 120, // 2 hours grace
      maxFee: 5000,
      isActive: true
    }
  });

  // 8. Create Deposit Rule
  await prisma.depositRule.create({
    data: {
      productId: product.id,
      type: 'FIXED',
      amount: 5000,
      isActive: true
    }
  });

  // 9. Create Inventory Units
  await prisma.inventoryUnit.create({
    data: {
      variantId: variant1.id,
      assetTag: 'AST-A7III-001',
      qrCode: 'QR-A7III-001',
      status: 'AVAILABLE',
      condition: 'GOOD',
      location: 'Warehouse A'
    }
  });

  await prisma.inventoryUnit.create({
    data: {
      variantId: variant2.id,
      assetTag: 'AST-A7III-002',
      qrCode: 'QR-A7III-002',
      status: 'AVAILABLE',
      condition: 'NEW',
      location: 'Warehouse A'
    }
  });

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
