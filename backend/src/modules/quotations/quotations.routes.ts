import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import * as quotationsController from './quotations.controller.js';

const router = Router();

router.use(authenticate);
router.use(authorize(['ADMIN']));

router.get('/admin/quotations', quotationsController.getQuotations);
router.get('/admin/quotation-templates', quotationsController.getQuotationTemplates);
router.post('/admin/quotation-templates', quotationsController.createQuotationTemplate);
router.post('/admin/quotations', quotationsController.createQuotation);
router.post('/admin/quotations/:id/confirm', quotationsController.confirmQuotation);

export default router;
