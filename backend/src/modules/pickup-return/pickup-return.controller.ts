import { Request, Response } from 'express';
import { prisma } from '../../db/prisma.js';

export const getPickups = async (req: Request, res: Response) => {
  try {
    res.json({ data: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pickups' });
  }
};

export const confirmPickup = async (req: Request, res: Response) => {
  try {
    const { rentalId } = req.params;
    res.json({ data: null, message: `Confirmed pickup for rental ${rentalId}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to confirm pickup' });
  }
};

import { calculateLateFee } from '../../utils/lateFeeCalculator.js';

export const getReturns = async (req: Request, res: Response) => {
  try {
    const returns = await prisma.rentalOrder.findMany({
      where: {
        status: { in: ['PICKED_UP', 'RETURN_DUE', 'OVERDUE'] }
      },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: {
                lateFeeRules: true
              }
            }
          }
        }
      }
    });
    res.json({ data: returns });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch returns' });
  }
};

export const confirmReturn = async (req: Request, res: Response) => {
  try {
    const { rentalId } = req.params;
    const returnedAt = new Date();

    const rentalOrder = await prisma.rentalOrder.findUnique({
      where: { id: rentalId },
      include: {
        items: {
          include: {
            product: {
              include: { lateFeeRules: true }
            }
          }
        }
      }
    });

    if (!rentalOrder) return res.status(404).json({ error: 'Rental order not found' });

    let totalLateFee = 0;

    // Calculate late fees per item based on rules
    for (const item of rentalOrder.items) {
      if (item.endsAt < returnedAt) {
        // Fetch applicable late fee rule (first active one)
        const rule = item.product.lateFeeRules.find(r => r.isActive);
        if (rule) {
          const fee = calculateLateFee(item.endsAt, returnedAt, {
            unit: rule.unit,
            amount: Number(rule.amount),
            gracePeriodMinutes: rule.gracePeriodMinutes,
            maxFee: rule.maxFee ? Number(rule.maxFee) : null
          });
          totalLateFee += fee;
        }
      }
    }

    // Update order
    const updatedOrder = await prisma.rentalOrder.update({
      where: { id: rentalId },
      data: {
        status: 'RETURNED',
        returnedAt,
        lateFeeTotal: totalLateFee,
        grandTotal: { increment: totalLateFee } // In practice, deduct from deposit
      }
    });

    // We can handle security deposit logic here:
    // Generate/Update Invoice automatically
    const existingInvoice = await prisma.invoice.findFirst({
      where: { rentalOrderId: rentalId }
    });

    if (existingInvoice) {
      await prisma.invoice.update({
        where: { id: existingInvoice.id },
        data: {
          lateFeeAmount: totalLateFee,
          total: { increment: totalLateFee },
          updatedAt: new Date()
        }
      });
    } else {
      await prisma.invoice.create({
        data: {
          invoiceNumber: `INV-${Date.now()}`,
          rentalOrderId: rentalId,
          lateFeeAmount: totalLateFee,
          total: Number(updatedOrder.grandTotal) + totalLateFee,
          status: 'ISSUED'
        }
      });
    }

    res.json({ data: updatedOrder, message: `Confirmed return for rental ${rentalId} with late fee of ${totalLateFee}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to confirm return' });
  }
};
