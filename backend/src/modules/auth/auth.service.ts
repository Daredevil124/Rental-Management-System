import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../db/prisma.js';
import { env } from '../../config/env.js';
import { z } from 'zod';
import { loginSchema, registerSchema } from './auth.schema.js';
import { emailService } from '../../services/email.service.js';

export class AuthService {
  async register(data: z.infer<typeof registerSchema>) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        role: (data.role ?? 'CUSTOMER') as any,
        companyName: data.companyName,
        productCategory: data.productCategory,
        gstNo: data.gstNo,
      },
    });

    return this.generateAuthResponse(user);
  }

  async login(data: z.infer<typeof loginSchema>) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    return this.generateAuthResponse(user);
  }

  async verifyEmail(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { exists: false };
    }

    const resetLink = `${env.corsOrigin}/reset-password?email=${encodeURIComponent(email)}&token=mock-token-${Math.random().toString(36).substring(7)}`;
    
    try {
      const emailResult = await emailService.sendPasswordResetEmail(email, resetLink);
      if (emailResult.success) {
        return { exists: true, previewUrl: emailResult.previewUrl, resetLink: null, emailError: null };
      } else {
        return { exists: true, previewUrl: null, resetLink, emailError: emailResult.error };
      }
    } catch (error: any) {
      return { exists: true, previewUrl: null, resetLink, emailError: error.message };
    }
  }

  async resetPassword(email: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    return { success: true };
  }

  private generateAuthResponse(user: any) {
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn as any }
    );

    const { passwordHash, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }
}

export const authService = new AuthService();
