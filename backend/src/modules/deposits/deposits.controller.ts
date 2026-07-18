import { Request, Response } from 'express';
import { prisma } from '../../db/prisma.js';

export const getDeposits = async (req: Request, res: Response) => {
  try {
    const deposits = await prisma.depositTransaction.findMany();
    res.json(deposits);
  } catch (error) {
    res.status(500).json({ error: 'Error' });
  }
};

export const getDepositHistory = async (req: Request, res: Response) => {
  try {
    const { rentalId } = req.params;
    const history = await prisma.payment.findMany({
      where: { rentalOrderId: rentalId, type: 'SECURITY_DEPOSIT' }
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Error' });
  }
};

export const settleDeposit = async (req: Request, res: Response) => {
  try {
    const { rentalId } = req.params;
    const tx = await prisma.depositTransaction.create({
      data: {
        rentalOrderId: rentalId,
        type: 'DEDUCTION',
        status: 'HELD',
        amount: 0,
      }
    });
    res.json({ data: tx });
  } catch (error) {
    res.status(500).json({ error: 'Error' });
  }
};
