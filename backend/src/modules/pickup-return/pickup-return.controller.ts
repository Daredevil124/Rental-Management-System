import { Request, Response } from 'express';
import { prisma } from '../../db/prisma.js';

/**
 * Dynamic Seeder to populate active operations data if database has no tasks.
 */
async function autoSeedOperationsData() {
  try {
    // 1. Get or create products
    let hammer = await prisma.product.findUnique({ where: { slug: 'dewalt-rotary-hammer-drill' } });
    if (!hammer) {
      hammer = await prisma.product.create({
        data: {
          name: 'DeWalt Rotary Hammer Drill',
          slug: 'dewalt-rotary-hammer-drill',
          description: 'Heavy-duty SDS Plus rotary hammer drill',
          category: 'Power Tools'
        }
      });
    }
    let generator = await prisma.product.findUnique({ where: { slug: 'yamaha-portable-generator' } });
    if (!generator) {
      generator = await prisma.product.create({
        data: {
          name: 'Yamaha Portable Generator',
          slug: 'yamaha-portable-generator',
          description: '2000-Watt portable generator',
          category: 'Generators'
        }
      });
    }

    // 2. Variants
    const hammerVariant = await prisma.productVariant.upsert({
      where: { sku: 'SKU-HAMMER-001' },
      update: {},
      create: {
        productId: hammer.id,
        sku: 'SKU-HAMMER-001',
        brand: 'DeWalt',
        isActive: true
      }
    });

    const generatorVariant = await prisma.productVariant.upsert({
      where: { sku: 'SKU-GEN-001' },
      update: {},
      create: {
        productId: generator.id,
        sku: 'SKU-GEN-001',
        brand: 'Yamaha',
        isActive: true
      }
    });

    // 3. Inventory Units
    const hammerUnit = await prisma.inventoryUnit.upsert({
      where: { assetTag: 'AST-HAMMER-001' },
      update: {},
      create: {
        variantId: hammerVariant.id,
        assetTag: 'AST-HAMMER-001',
        qrCode: 'QR-HAMMER-001',
        status: 'AVAILABLE',
        condition: 'GOOD'
      }
    });

    const generatorUnit = await prisma.inventoryUnit.upsert({
      where: { assetTag: 'AST-GEN-001' },
      update: {},
      create: {
        variantId: generatorVariant.id,
        assetTag: 'AST-GEN-001',
        qrCode: 'QR-GEN-001',
        status: 'RENTED',
        condition: 'GOOD'
      }
    });

    // 4. PriceList, RentalPeriods
    const priceList = await prisma.priceList.upsert({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Standard Price List',
        isDefault: true,
        isActive: true
      }
    });

    const dailyPeriod = await prisma.rentalPeriod.upsert({
      where: { unit_duration: { unit: 'DAY', duration: 1 } },
      update: {},
      create: {
        name: 'Daily',
        unit: 'DAY',
        duration: 1,
        isActive: true
      }
    });

    // 5. Users
    const alice = await prisma.user.upsert({
      where: { email: 'alice.smith@example.com' },
      update: {},
      create: {
        email: 'alice.smith@example.com',
        passwordHash: 'dummyhash',
        fullName: 'Alice Smith',
        role: 'CUSTOMER',
        isActive: true
      }
    });

    const bob = await prisma.user.upsert({
      where: { email: 'bob.johnson@example.com' },
      update: {},
      create: {
        email: 'bob.johnson@example.com',
        passwordHash: 'dummyhash2',
        fullName: 'Bob Johnson',
        role: 'CUSTOMER',
        isActive: true
      }
    });

    // 6. Accessories
    const caseAccessory = await prisma.accessory.create({
      data: {
        productId: hammer.id,
        name: 'Hard Carry Case',
        quantity: 1,
        isRequired: true
      }
    });

    const cordAccessory = await prisma.accessory.create({
      data: {
        productId: generator.id,
        name: 'Heavy Duty Extension Cord',
        quantity: 1,
        isRequired: true
      }
    });

    // 7. Orders & Tasks
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
            priceListId: priceList.id,
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
            routeNotes: 'Standard customer store pickup checklist required.',
            checklist: ['Verify safety guards intact', 'Confirm carrying box', 'Register QR Scan']
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
            priceListId: priceList.id,
            rentalPeriodId: dailyPeriod.id,
            quantity: 1,
            startsAt: new Date(Date.now() - 4 * 86400000),
            endsAt: new Date(Date.now() - 2 * 86400000), // Late
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
  } catch (err) {
    console.error('Error auto seeding operations:', err);
  }
}

export const getPickups = async (req: Request, res: Response) => {
  try {
    const count = await prisma.pickupTask.count();
    if (count === 0) {
      await autoSeedOperationsData();
    }

    const pickups = await prisma.pickupTask.findMany({
      include: {
        rentalOrder: {
          include: {
            customer: true,
            items: {
              include: {
                product: true,
                inventoryUnit: true
              }
            }
          }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    });

    res.json({ data: pickups });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch pickups' });
  }
};

export const confirmPickup = async (req: Request, res: Response) => {
  try {
    const { rentalId } = req.params;

    // 1. Update task to completed
    const task = await prisma.pickupTask.findFirst({
      where: { rentalOrderId: rentalId, status: 'SCHEDULED' }
    });

    if (!task) {
      res.status(404).json({ error: 'Scheduled pickup task not found for this rental' });
      return;
    }

    await prisma.$transaction([
      prisma.pickupTask.update({
        where: { id: task.id },
        data: { status: 'COMPLETED', confirmedAt: new Date() }
      }),
      // 2. Set order status to PICKED_UP
      prisma.rentalOrder.update({
        where: { id: rentalId },
        data: { status: 'PICKED_UP', pickedUpAt: new Date() }
      }),
      // 3. Mark items and units as RENTED
      prisma.rentalItem.updateMany({
        where: { rentalOrderId: rentalId },
        data: { status: 'PICKED_UP' }
      })
    ]);

    // Find the item inventory unit to flip status
    const rentalItems = await prisma.rentalItem.findMany({
      where: { rentalOrderId: rentalId }
    });
    for (const item of rentalItems) {
      if (item.inventoryUnitId) {
        await prisma.inventoryUnit.update({
          where: { id: item.inventoryUnitId },
          data: { status: 'RENTED' }
        });
      }
    }

    res.json({ data: null, message: `Confirmed pickup for rental ${rentalId}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to confirm pickup' });
  }
};

import { calculateLateFee } from '../../utils/lateFeeCalculator.js';

export const getReturns = async (req: Request, res: Response) => {
  try {
    const count = await prisma.returnTask.count();
    if (count === 0) {
      await autoSeedOperationsData();
    }

    const returns = await prisma.returnTask.findMany({
      include: {
        rentalOrder: {
          include: {
            customer: true,
            items: {
              include: {
                product: {
                  include: {
                    accessories: true,
                    lateFeeRules: true
                  }
                },
                inventoryUnit: true
              }
            }
          }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    });

    res.json({ data: returns });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch returns' });
  }
};

export const confirmReturn = async (req: Request, res: Response) => {
  try {
    const { rentalId } = req.params;
    const { condition, damageNotes, damageFeeAmount = 0, missingAccessories = [] } = req.body;

    const task = await prisma.returnTask.findFirst({
      where: { rentalOrderId: rentalId, status: 'SCHEDULED' }
    });

    if (!task) {
      res.status(404).json({ error: 'Scheduled return task not found for this rental' });
      return;
    }

    const rentalOrder = await prisma.rentalOrder.findUnique({
      where: { id: rentalId },
      include: {
        items: {
          include: {
            product: {
              include: { lateFeeRules: true }
            }
          }
        }
      }
    });

    if (!rentalOrder) {
      res.status(404).json({ error: 'Rental order not found' });
      return;
    }

    let totalLateFee = 0;
    let lateDays = 0;
    const returnedAt = new Date();

    for (const item of rentalOrder.items) {
      if (item.endsAt < returnedAt) {
        const rule = item.product.lateFeeRules.find(r => r.isActive);
        if (rule) {
          const fee = calculateLateFee(item.endsAt, returnedAt, {
            unit: rule.unit,
            amount: Number(rule.amount),
            gracePeriodMinutes: rule.gracePeriodMinutes,
            maxFee: rule.maxFee ? Number(rule.maxFee) : null
          });
          totalLateFee += fee;
          lateDays = Math.ceil((returnedAt.getTime() - item.endsAt.getTime()) / 86400000);
        }
      }
    }

    const missingAccessoriesPenalty = (missingAccessories?.length || 0) * 200; // ₹200 fee per missing accessory
    const totalDeductions = totalLateFee + Number(damageFeeAmount) + missingAccessoriesPenalty;
    const originalDeposit = Number(rentalOrder.depositTotal) || 0;
    let refundAmount = originalDeposit - totalDeductions;
    if (refundAmount < 0) refundAmount = 0;

    await prisma.$transaction(async (tx) => {
      // 1. Update task to completed
      await tx.returnTask.update({
        where: { id: task.id },
        data: { status: 'COMPLETED', confirmedAt: returnedAt }
      });

      // 2. Set order status to RETURNED
      await tx.rentalOrder.update({
        where: { id: rentalId },
        data: {
          status: 'RETURNED',
          returnedAt,
          lateFeeTotal: totalLateFee,
          damageFeeTotal: damageFeeAmount,
          grandTotal: { increment: totalLateFee }
        }
      });

      // 3. Create inspection report
      const item = rentalOrder.items[0];
      if (item) {
        const inspection = await tx.returnInspection.create({
          data: {
            returnTaskId: task.id,
            rentalItemId: item.id,
            inventoryUnitId: item.inventoryUnitId!,
            condition: condition || 'GOOD',
            damageNotes: damageNotes || '',
            damageFeeAmount: damageFeeAmount
          }
        });

        // 4. Missing accessories
        for (const accId of missingAccessories) {
          await tx.inspectionAccessory.create({
            data: {
              returnInspectionId: inspection.id,
              accessoryId: accId,
              expectedQuantity: 1,
              returnedQuantity: 0,
              missingQuantity: 1
            }
          });
        }

        // 5. Repair initiation if DAMAGED
        if (condition === 'DAMAGED') {
          await tx.inventoryUnit.update({
            where: { id: item.inventoryUnitId! },
            data: { status: 'MAINTENANCE', condition: 'DAMAGED' }
          });

          await tx.repairTask.create({
            data: {
              inventoryUnitId: item.inventoryUnitId!,
              returnInspectionId: inspection.id,
              status: 'OPEN',
              description: `Damage reported: ${damageNotes}. Fee charged: ₹${damageFeeAmount}`,
              estimatedCost: damageFeeAmount
            }
          });
        } else {
          await tx.inventoryUnit.update({
            where: { id: item.inventoryUnitId! },
            data: { status: 'AVAILABLE', condition: condition || 'GOOD' }
          });
        }
      }

      // 6. Record Deposit Transactions & Payment History
      if (totalDeductions > 0) {
        const deductionAmt = totalDeductions <= originalDeposit ? totalDeductions : originalDeposit;
        await tx.depositTransaction.create({
          data: {
            rentalOrderId: rentalId,
            type: 'DEDUCTION',
            status: 'PARTIALLY_DEDUCTED',
            amount: deductionAmt,
            reason: 'Late Return or Damage Penalty Deduction'
          }
        });

        // Record late fee payment log
        await tx.payment.create({
          data: {
            rentalOrderId: rentalId,
            userId: rentalOrder.customerId,
            type: 'LATE_FEE',
            provider: 'MOCK',
            providerRef: `REF-LATE-${Date.now()}`,
            status: 'PAID',
            amount: deductionAmt,
            paidAt: new Date()
          }
        });
      }

      if (refundAmount > 0) {
        await tx.depositTransaction.create({
          data: {
            rentalOrderId: rentalId,
            type: 'REFUND',
            status: 'REFUNDED',
            amount: refundAmount,
            reason: 'Remaining Deposit Refunded'
          }
        });

        // Record refund payment log
        await tx.payment.create({
          data: {
            rentalOrderId: rentalId,
            userId: rentalOrder.customerId,
            type: 'REFUND',
            provider: 'MOCK',
            providerRef: `REF-REF-${Date.now()}`,
            status: 'PAID',
            amount: refundAmount,
            paidAt: new Date()
          }
        });
      }

      // Update HELD transaction status
      await tx.depositTransaction.updateMany({
        where: { rentalOrderId: rentalId, type: 'HOLD' },
        data: { status: refundAmount === originalDeposit ? 'REFUNDED' : 'PARTIALLY_DEDUCTED' }
      });

      // 7. Generate/Update Invoice automatically
      const existingInvoice = await tx.invoice.findFirst({
        where: { rentalOrderId: rentalId }
      });

      if (existingInvoice) {
        await tx.invoice.update({
          where: { id: existingInvoice.id },
          data: {
            lateFeeAmount: totalLateFee,
            damageFeeAmount: damageFeeAmount,
            total: { increment: totalLateFee },
            updatedAt: new Date()
          }
        });
      } else {
        await tx.invoice.create({
          data: {
            invoiceNumber: `INV-${Date.now()}`,
            rentalOrderId: rentalId,
            lateFeeAmount: totalLateFee,
            damageFeeAmount: damageFeeAmount,
            total: Number(rentalOrder.grandTotal) + totalLateFee,
            status: 'ISSUED'
          }
        });
      }
    });

    res.json({
      success: true,
      message: `Return processed for order ${rentalOrder.orderNumber}`,
      data: {
        lateDays,
        lateFee: totalLateFee,
        damageFee: damageFeeAmount,
        refundAmount
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to confirm return' });
  }
};
