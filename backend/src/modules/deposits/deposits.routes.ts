import { Router } from 'express';
import { getDeposits, getDepositHistory, settleDeposit } from './deposits.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

router.get('/admin/deposits', authenticate, authorize(['ADMIN']), getDeposits);
router.get('/admin/rentals/:rentalId/deposit-history', authenticate, authorize(['ADMIN']), getDepositHistory);
router.post('/admin/rentals/:rentalId/settle-deposit', authenticate, authorize(['ADMIN']), settleDeposit);

export default router;
