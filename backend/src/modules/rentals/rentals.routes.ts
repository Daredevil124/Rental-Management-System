import { Router } from 'express';
import { checkout, getRentals, getRentalById, getInvoice, downloadInvoice } from './rentals.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/checkout', checkout);
router.get('/', getRentals);
router.get('/:rentalId', getRentalById);
router.get('/:rentalId/invoice/download', downloadInvoice);

export default router;
