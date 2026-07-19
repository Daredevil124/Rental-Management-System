import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service.js';
import { updateUserSchema } from './users.schema.js';

export class UsersController {
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: { message: 'Unauthorized' } });
        return;
      }
      const user = await usersService.getUserById(req.user.id);
      res.status(200).json({ data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: { message: 'Unauthorized' } });
        return;
      }
      const parsedData = updateUserSchema.parse(req.body);
      const user = await usersService.updateUser(req.user.id, parsedData);
      res.status(200).json({ data: user });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: { message: 'Validation failed', details: error.errors } });
        return;
      }
      next(error);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await usersService.getAllUsers();
      res.status(200).json({ data: users });
    } catch (error) {
      next(error);
    }
  }

  async approveVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.approveVendor(req.params.userId);
      res.status(200).json({ data: user });
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
