import { Router } from 'express';
import { productsController } from './products.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { UserRole } from '../../generated/prisma/client.js';

export const productsRouter = Router();

// Public routes
productsRouter.get('/products', productsController.getProducts);
productsRouter.get('/products/:productId', productsController.getProductById);

// Admin routes
productsRouter.post('/admin/products', authenticate, authorize(['ADMIN']), productsController.createProduct);
productsRouter.patch('/admin/products/:productId', authenticate, authorize(['ADMIN']), productsController.updateProduct);
productsRouter.post('/admin/products/:productId/variants', authenticate, authorize(['ADMIN']), productsController.createVariant);
productsRouter.post('/admin/inventory-units', authenticate, authorize(['ADMIN']), productsController.createInventoryUnit);
