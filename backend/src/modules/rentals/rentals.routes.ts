import { Router } from 'express';
import { checkout, getRentals, getRentalById, getInvoice } from './rentals.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/checkout', checkout);
router.get('/', getRentals);
router.get('/:rentalId', getRentalById);

export default router;
