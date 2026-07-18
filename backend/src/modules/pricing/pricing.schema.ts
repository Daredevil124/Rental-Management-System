import { z } from 'zod';
import { DepositRuleType, LateFeeUnit } from '../../generated/prisma/client.js';

export const createPriceListSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  isDefault: z.boolean().optional(),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const createLateFeeRuleSchema = z.object({
  priceListId: z.string().uuid().optional().nullable(),
  productId: z.string().uuid().optional().nullable(),
  variantId: z.string().uuid().optional().nullable(),
  unit: z.nativeEnum(LateFeeUnit),
  amount: z.number().min(0),
  gracePeriodMinutes: z.number().min(0).optional(),
  maxFee: z.number().min(0).optional().nullable(),
  currency: z.string().length(3).optional(),
  isActive: z.boolean().optional(),
});

export const createDepositRuleSchema = z.object({
  priceListId: z.string().uuid().optional().nullable(),
  productId: z.string().uuid().optional().nullable(),
  variantId: z.string().uuid().optional().nullable(),
  type: z.nativeEnum(DepositRuleType),
  amount: z.number().min(0),
  currency: z.string().length(3).optional(),
  isActive: z.boolean().optional(),
});
