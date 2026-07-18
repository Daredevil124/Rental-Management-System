import { Router } from 'express';
import { getDashboardSummary, getRentalActivity } from './dashboard.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

router.get('/admin/dashboard/summary', authenticate, authorize(['ADMIN']), getDashboardSummary);
router.get('/admin/dashboard/rental-activity', authenticate, authorize(['ADMIN']), getRentalActivity);

export default router;
