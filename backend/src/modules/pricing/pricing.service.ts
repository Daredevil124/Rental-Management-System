import { prisma } from '../../db/prisma.js';
import { z } from 'zod';
import {
  createPriceListSchema,
  createLateFeeRuleSchema,
  createDepositRuleSchema,
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
}

export const pricingService = new PricingService();
