import { prisma } from '../../db/prisma.js';
import { z } from 'zod';
import {
  createPriceListSchema,
  createLateFeeRuleSchema,
  createDepositRuleSchema,
  createPricingRuleSchema,
} from './pricing.schema.js';

export class PricingService {
  async getRentalPeriods() {
    return prisma.rentalPeriod.findMany({
      where: { isActive: true },
    });
  }

  async getPriceLists() {
    return prisma.priceList.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPriceList(data: z.infer<typeof createPriceListSchema>) {
    return prisma.priceList.create({
      data,
    });
  }

  async createLateFeeRule(data: z.infer<typeof createLateFeeRuleSchema>) {
    return prisma.lateFeeRule.create({
      data,
    });
  }

  async createDepositRule(data: z.infer<typeof createDepositRuleSchema>) {
    return prisma.depositRule.create({
      data,
    });
  }

  async createPricingRule(data: z.infer<typeof createPricingRuleSchema>) {
    return prisma.pricingRule.create({
      data,
    });
  }

  async calculatePriceAndDeposit(
    priceListId: string,
    rentalPeriodId: string,
    productId: string,
    variantId?: string | null
  ) {
    let pricing = await prisma.pricingRule.findFirst({
      where: {
        priceListId,
        rentalPeriodId,
        productId,
        variantId: variantId || undefined,
      },
    });

    if (!pricing && variantId) {
      pricing = await prisma.pricingRule.findFirst({
        where: {
          priceListId,
          rentalPeriodId,
          productId,
          variantId: null,
        },
      });
    }

    const unitPrice = pricing ? Number(pricing.price) : 100.00;

    let depositRule = await prisma.depositRule.findFirst({
      where: {
        priceListId,
        productId,
        variantId: variantId || undefined,
        isActive: true,
      },
    });

    if (!depositRule && variantId) {
      depositRule = await prisma.depositRule.findFirst({
        where: {
          priceListId,
          productId,
          variantId: null,
          isActive: true,
        },
      });
    }

    let depositAmount = 0;
    if (depositRule) {
      const amt = Number(depositRule.amount);
      if (depositRule.type === 'FIXED') {
        depositAmount = amt;
      } else if (depositRule.type === 'PERCENTAGE') {
        depositAmount = unitPrice * (amt / 100);
      }
    } else {
      depositAmount = unitPrice * 0.15;
    }

    return {
      unitPrice,
      depositAmount,
    };
  }
}

export const pricingService = new PricingService();
