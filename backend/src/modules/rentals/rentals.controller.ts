import { Request, Response } from 'express';
import { prisma } from '../../db/prisma.js';

export const checkout = async (req: Request, res: Response) => {
  try {
    const customerId = req.user!.id;
    const cart = await prisma.cart.findFirst({
      where: { userId: customerId },
      include: { items: true }
    });

    if (!cart || cart.items.length === 0) return res.status(400).json({ error: 'Empty' });

    const rentalOrder = await prisma.rentalOrder.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        customerId,
        status: 'CONFIRMED',
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            priceListId: item.priceListId,
            rentalPeriodId: item.rentalPeriodId,
            quantity: item.quantity,
            startsAt: item.startsAt,
            endsAt: item.endsAt,
            unitPrice: item.unitPrice,
          }))
        }
      }
    });
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    res.json({ data: rentalOrder });
  } catch (error) {
    res.status(400).json({ error: 'Failed' });
  }
};

export const getRentals = async (req: Request, res: Response) => {
  try {
    const customerId = req.user!.id;
    const rentals = await prisma.rentalOrder.findMany({ where: { customerId } });
    res.json({ data: rentals });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
};

export const getRentalById = async (req: Request, res: Response) => {
  try {
    const { rentalId } = req.params;
    const customerId = req.user!.id;
    const rental = await prisma.rentalOrder.findFirst({ where: { id: rentalId, customerId } });
    res.json({ data: rental });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
};

export const getInvoice = async (req: Request, res: Response) => {
  try {
    const { rentalId } = req.params;
    const invoice = await prisma.invoice.findFirst({ where: { rentalOrderId: rentalId } });
    res.json({ data: invoice });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
};
