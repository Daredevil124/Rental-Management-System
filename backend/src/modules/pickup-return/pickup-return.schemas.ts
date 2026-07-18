import { z } from 'zod';

export const confirmPickupSchema = z.object({
  notes: z.string().optional(),
});

export const confirmReturnSchema = z.object({
  condition: z.string().optional(),
  notes: z.string().optional(),
});
