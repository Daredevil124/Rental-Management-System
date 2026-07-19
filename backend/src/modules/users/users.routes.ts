import { Router } from 'express';
import { usersController } from './users.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

export const usersRouter = Router();

usersRouter.get('/me', authenticate, usersController.getMe);
usersRouter.patch('/me', authenticate, usersController.updateMe);

usersRouter.get('/admin', authenticate, authorize(['ADMIN']), usersController.getAllUsers);
usersRouter.patch('/admin/:userId/approve', authenticate, authorize(['ADMIN']), usersController.approveVendor);
