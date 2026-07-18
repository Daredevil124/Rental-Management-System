import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  role: z.enum(['CUSTOMER', 'ADMIN', 'VENDOR']).optional(),
  companyName: z.string().optional(),
  productCategory: z.string().optional(),
  gstNo: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
