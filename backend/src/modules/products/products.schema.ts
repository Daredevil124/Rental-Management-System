import { z } from 'zod';
import { InventoryStatus, ProductCondition } from '../../generated/prisma/client.js';

export const createProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional().nullable(),
  category: z.string().min(2),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  category: z.string().min(2).optional(),
  isActive: z.boolean().optional(),
});

export const createVariantSchema = z.object({
  sku: z.string().min(2),
  brand: z.string().optional().nullable(),
  manufacturer: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  attributes: z.any().optional(),
});

export const createInventoryUnitSchema = z.object({
  variantId: z.string().uuid(),
  assetTag: z.string().min(2),
  qrCode: z.string().min(2),
  status: z.nativeEnum(InventoryStatus).optional(),
  condition: z.nativeEnum(ProductCondition).optional(),
  location: z.string().optional().nullable(),
  purchaseDate: z.string().datetime().optional().nullable(), // ISO format
});
