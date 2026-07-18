import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart } from './cart.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getCart);
router.post('/items', addToCart);
router.patch('/items/:itemId', updateCartItem);
router.delete('/items/:itemId', removeFromCart);

export default router;
