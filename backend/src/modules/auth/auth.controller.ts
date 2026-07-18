import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { loginSchema, registerSchema } from './auth.schema.js';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = registerSchema.parse(req.body);
      const result = await authService.register(parsedData);
      res.status(201).json({ data: result });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: { message: 'Validation failed', details: error.errors } });
        return;
      }
      if (error.message === 'User already exists') {
        res.status(409).json({ error: { message: error.message } });
        return;
      }
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = loginSchema.parse(req.body);
      const result = await authService.login(parsedData);
      res.status(200).json({ data: result });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: { message: 'Validation failed', details: error.errors } });
        return;
      }
      if (error.message === 'Invalid email or password') {
        res.status(401).json({ error: { message: error.message } });
        return;
      }
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ error: { message: 'Email parameter is required' } });
        return;
      }
      const result = await authService.verifyEmail(email);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
