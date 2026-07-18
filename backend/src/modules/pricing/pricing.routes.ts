import { Router } from 'express';
import { pricingController } from './pricing.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

export const pricingRouter = Router();

// Public routes
pricingRouter.get('/pricing/rental-periods', pricingController.getRentalPeriods);

// Admin routes
pricingRouter.get('/admin/price-lists', authenticate, authorize(['ADMIN']), pricingController.getPriceLists);
pricingRouter.post('/admin/price-lists', authenticate, authorize(['ADMIN']), pricingController.createPriceList);
pricingRouter.post('/admin/late-fee-rules', authenticate, authorize(['ADMIN']), pricingController.createLateFeeRule);
pricingRouter.post('/admin/deposit-rules', authenticate, authorize(['ADMIN']), pricingController.createDepositRule);
