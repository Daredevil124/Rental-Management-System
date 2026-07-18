import { Request, Response, NextFunction } from 'express';
import { productsService } from './products.service.js';
import {
  createProductSchema,
  updateProductSchema,
  createVariantSchema,
  createInventoryUnitSchema,
} from './products.schema.js';

export class ProductsController {
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await productsService.getProducts();
      res.status(200).json({ data: products });
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productsService.getProductById(req.params.productId);
      res.status(200).json({ data: product });
    } catch (error: any) {
      if (error.message === 'Product not found') {
        res.status(404).json({ error: { message: error.message } });
        return;
      }
      next(error);
    }
  }

  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createProductSchema.parse(req.body);
      const product = await productsService.createProduct(parsed);
      res.status(201).json({ data: product });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: { message: 'Validation failed', details: error.errors } });
        return;
      }
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateProductSchema.parse(req.body);
      const product = await productsService.updateProduct(req.params.productId, parsed);
      res.status(200).json({ data: product });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: { message: 'Validation failed', details: error.errors } });
        return;
      }
      next(error);
    }
  }

  async createVariant(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createVariantSchema.parse(req.body);
      const variant = await productsService.createVariant(req.params.productId, parsed);
      res.status(201).json({ data: variant });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: { message: 'Validation failed', details: error.errors } });
        return;
      }
      next(error);
    }
  }

  async createInventoryUnit(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createInventoryUnitSchema.parse(req.body);
      const unit = await productsService.createInventoryUnit(parsed);
      res.status(201).json({ data: unit });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: { message: 'Validation failed', details: error.errors } });
        return;
      }
      next(error);
    }
  }
}

export const productsController = new ProductsController();
