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
        variants: true,
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
    return prisma.product.update({
      where: { id: productId },
      data,
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
