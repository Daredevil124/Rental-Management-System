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

    // Calculate totals
    let subtotal = 0;
    let depositTotal = 0;

    cart.items.forEach(item => {
      const price = Number(item.unitPrice);
      const deposit = Number(item.depositAmount);
      const qty = item.quantity;
      subtotal += price * qty;
      depositTotal += deposit * qty;
    });

    const grandTotal = subtotal + depositTotal;

    const rentalOrder = await prisma.rentalOrder.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        customerId,
        status: 'CONFIRMED',
        subtotal,
        depositTotal,
        grandTotal,
        confirmedAt: new Date(),
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
            depositAmount: item.depositAmount,
          }))
        }
      }
    });

    // Create payment records for base rental and deposit
    await prisma.payment.create({
      data: {
        rentalOrderId: rentalOrder.id,
        userId: customerId,
        type: 'RENTAL_CHARGE',
        provider: 'MOCK',
        providerRef: `REF-RENT-${Date.now()}`,
        status: 'PAID',
        amount: subtotal,
        paidAt: new Date()
      }
    });

    if (depositTotal > 0) {
      await prisma.payment.create({
        data: {
          rentalOrderId: rentalOrder.id,
          userId: customerId,
          type: 'SECURITY_DEPOSIT',
          provider: 'MOCK',
          providerRef: `REF-DEP-${Date.now()}`,
          status: 'PAID',
          amount: depositTotal,
          paidAt: new Date()
        }
      });

      // Create deposit hold log
      await prisma.depositTransaction.create({
        data: {
          rentalOrderId: rentalOrder.id,
          actorId: customerId,
          type: 'HOLD',
          status: 'HELD',
          amount: depositTotal,
          reason: 'Initial security deposit collection during order checkout'
        }
      });
    }

    // Schedule a Pickup Task automatically for warehouse staff
    await prisma.pickupTask.create({
      data: {
        rentalOrderId: rentalOrder.id,
        status: 'SCHEDULED',
        scheduledAt: new Date()
      }
    });

    // Clear cart items
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    
    res.json({ data: rentalOrder });
  } catch (error) {
    console.error('[Rentals API] Checkout failed:', error);
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
