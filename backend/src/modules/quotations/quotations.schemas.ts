import { z } from 'zod';

export const createQuotationTemplateSchema = z.object({
  name: z.string().min(1),
  content: z.string(),
});

export const createQuotationSchema = z.object({
  customerId: z.string().min(1),
  rentalItems: z.array(z.string()),
  totalAmount: z.number().positive(),
});
