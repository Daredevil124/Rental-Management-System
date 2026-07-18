import { z } from 'zod';

export const settleDepositSchema = z.object({
  amount: z.number().positive(),
  reason: z.string().optional(),
  type: z.enum(['REFUND', 'DEDUCTION'])
});
