import { prisma } from '../../db/prisma.js';
import { z } from 'zod';
import {
  createProductSchema,
  updateProductSchema,
  createVariantSchema,
  createInventoryUnitSchema,
} from './products.schema.js';

export class ProductsService {
  async getProducts() {
    return prisma.product.findMany({
      where: { isActive: true },
      include: { 
        variants: {
          include: {
            inventoryUnits: true
          }
        },
        pricingRules: {
          include: { rentalPeriod: true }
        },
        depositRules: true
      },
    });
  }

  async getProductById(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: { include: { inventoryUnits: true } } },
    });
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async createProduct(data: z.infer<typeof createProductSchema>) {
    return prisma.product.create({
      data,
    });
  }

  async updateProduct(productId: string, data: z.infer<typeof updateProductSchema>) {
    const { name, description, category, isActive, price, depositAmount, lateFeeAmount, lateFeeUnit, gracePeriod, maxFee, stock } = data;

    return prisma.$transaction(async (tx) => {
      // 1. Update product base info
      const product = await tx.product.update({
        where: { id: productId },
        data: {
          name,
          description,
          category,
          isActive
        }
      });

      // 2. Update PricingRule (Daily) if price is passed
      if (price !== undefined) {
        const defaultPl = await tx.priceList.findFirst({ where: { isDefault: true } });
        const dailyPeriod = await tx.rentalPeriod.findFirst({ where: { name: 'Daily' } });
        if (defaultPl && dailyPeriod) {
          const existingPricing = await tx.pricingRule.findFirst({
            where: {
              priceListId: defaultPl.id,
              rentalPeriodId: dailyPeriod.id,
              productId: productId,
              variantId: null
            }
          });
          if (existingPricing) {
            await tx.pricingRule.update({
              where: { id: existingPricing.id },
              data: { price }
            });
          } else {
            await tx.pricingRule.create({
              data: {
                priceListId: defaultPl.id,
                rentalPeriodId: dailyPeriod.id,
                productId: productId,
                price
              }
            });
          }
        }
      }

      // 3. Update DepositRule
      if (depositAmount !== undefined) {
        const existingRule = await tx.depositRule.findFirst({
          where: { productId }
        });
        if (existingRule) {
          await tx.depositRule.update({
            where: { id: existingRule.id },
            data: { amount: depositAmount }
          });
        } else {
          await tx.depositRule.create({
            data: {
              productId,
              type: 'FIXED',
              amount: depositAmount
            }
          });
        }
      }

      // 4. Update LateFeeRule
      if (lateFeeAmount !== undefined) {
        const existingRule = await tx.lateFeeRule.findFirst({
          where: { productId }
        });
        if (existingRule) {
          await tx.lateFeeRule.update({
            where: { id: existingRule.id },
            data: {
              amount: lateFeeAmount,
              unit: lateFeeUnit || 'DAILY',
              gracePeriodMinutes: gracePeriod !== undefined ? gracePeriod : 120,
              maxFee: maxFee !== undefined ? maxFee : 5000
            }
          });
        } else {
          await tx.lateFeeRule.create({
            data: {
              productId,
              unit: lateFeeUnit || 'DAILY',
              amount: lateFeeAmount,
              gracePeriodMinutes: gracePeriod !== undefined ? gracePeriod : 120,
              maxFee: maxFee !== undefined ? maxFee : 5000,
              isActive: true
            }
          });
        }
      }

      // 5. Stock adjustments (InventoryUnits)
      if (stock !== undefined) {
        const variants = await tx.productVariant.findMany({
          where: { productId },
          include: { inventoryUnits: true }
        });
        const currentUnits = variants.flatMap(v => v.inventoryUnits);
        const currentCount = currentUnits.length;

        if (stock > currentCount) {
          const variant = variants[0];
          if (variant) {
            const toAdd = stock - currentCount;
            for (let i = 0; i < toAdd; i++) {
              await tx.inventoryUnit.create({
                data: {
                  variantId: variant.id,
                  assetTag: `AST-${variant.sku}-${Date.now()}-${i}`,
                  qrCode: `QR-${variant.sku}-${Date.now()}-${i}`,
                  status: 'AVAILABLE',
                  condition: 'GOOD',
                  location: 'Warehouse A'
                }
              });
            }
          }
        } else if (stock < currentCount) {
          const toDeleteCount = currentCount - stock;
          const availableUnits = currentUnits.filter(u => u.status === 'AVAILABLE');
          const idsToDelete = availableUnits.slice(0, toDeleteCount).map(u => u.id);
          if (idsToDelete.length > 0) {
            await tx.inventoryUnit.deleteMany({
              where: { id: { in: idsToDelete } }
            });
          }
        }
      }

      return product;
    });
  }

  async createVariant(productId: string, data: z.infer<typeof createVariantSchema>) {
    return prisma.productVariant.create({
      data: {
        ...data,
        productId,
      },
    });
  }

  async createInventoryUnit(data: z.infer<typeof createInventoryUnitSchema>) {
    return prisma.inventoryUnit.create({
      data: {
        ...data,
      },
    });
  }
}

export const productsService = new ProductsService();
