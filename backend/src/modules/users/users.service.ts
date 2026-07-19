import { prisma } from '../../db/prisma.js';
import { z } from 'zod';
import { updateUserSchema } from './users.schema.js';

export class UsersService {
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        profileImage: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateUser(id: string, data: z.infer<typeof updateUserSchema>) {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...data,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        profileImage: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        profileImage: true,
        role: true,
        isActive: true,
        companyName: true,
        productCategory: true,
        gstNo: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async approveVendor(id: string) {
    return prisma.user.update({
      where: { id },
      data: { isActive: true },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
      }
    });
  }
}

export const usersService = new UsersService();
