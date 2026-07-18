import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  role: z.enum(['CUSTOMER', 'ADMIN']).optional(), // Optional for seeding mostly, default CUSTOMER in DB
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
