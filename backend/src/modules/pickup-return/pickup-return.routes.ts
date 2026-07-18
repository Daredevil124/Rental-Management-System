import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import * as pickupReturnController from './pickup-return.controller.js';

const router = Router();

router.use(authenticate);
router.use(authorize(['ADMIN']));

router.get('/admin/pickups', pickupReturnController.getPickups);
router.post('/admin/rentals/:rentalId/confirm-pickup', pickupReturnController.confirmPickup);
router.get('/admin/returns', pickupReturnController.getReturns);
router.post('/admin/rentals/:rentalId/confirm-return', pickupReturnController.confirmReturn);

export default router;
