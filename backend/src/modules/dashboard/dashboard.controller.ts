import { Request, Response } from 'express';
import { prisma } from '../../db/prisma.js';

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalRentals = await prisma.rentalOrder.count();
    const activeRentals = await prisma.rentalOrder.count({ where: { status: 'CONFIRMED' } });
    res.json({ totalUsers, totalRentals, activeRentals });
  } catch (error) {
    res.status(500).json({ error: 'Error' });
  }
};

export const getRentalActivity = async (req: Request, res: Response) => {
  try {
    const activity = await prisma.rentalOrder.findMany({ take: 10 });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Error' });
  }
};
