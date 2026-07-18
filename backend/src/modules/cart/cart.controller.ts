import { Request, Response } from 'express';
import { prisma } from '../../db/prisma.js';

export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    let cart = await prisma.cart.findFirst({ where: { userId }, include: { items: true } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId }, include: { items: true } });
    }
    res.json({ data: cart });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
};

export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    let cart = await prisma.cart.findFirst({ where: { userId } });
    if (!cart) cart = await prisma.cart.create({ data: { userId } });
    
    const newItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: req.body.productId,
        variantId: req.body.variantId,
        priceListId: req.body.priceListId,
        rentalPeriodId: req.body.rentalPeriodId,
        quantity: req.body.quantity || 1,
        startsAt: new Date(),
        endsAt: new Date(),
        unitPrice: 0,
      }
    });
    res.json({ data: newItem });
  } catch (error) {
    res.status(400).json({ error: 'Failed' });
  }
};

export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: req.body.quantity }
    });
    res.json({ data: updatedItem });
  } catch (error) {
    res.status(400).json({ error: 'Failed' });
  }
};

export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    await prisma.cartItem.delete({ where: { id: itemId } });
    res.json({ data: { success: true } });
  } catch (error) {
    res.status(400).json({ error: 'Failed' });
  }
};
