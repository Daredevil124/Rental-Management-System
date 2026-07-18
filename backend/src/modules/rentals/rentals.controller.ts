import { Request, Response } from 'express';
import { prisma } from '../../db/prisma.js';

export const checkout = async (req: Request, res: Response) => {
  try {
    const customerId = req.user!.id;
    const { items, deliveryMethod } = req.body;
    
    if (!items || items.length === 0) return res.status(400).json({ error: 'Empty cart' });

    // Fetch defaults to satisfy Prisma relations
    const defaultVariant = await prisma.productVariant.findFirst();
    const defaultPriceList = await prisma.priceList.findFirst();
    const defaultPeriod = await prisma.rentalPeriod.findFirst();

    if (!defaultVariant || !defaultPriceList || !defaultPeriod) {
      return res.status(500).json({ error: 'Database not properly seeded for checkout' });
    }

    // Calculate totals
    let subtotal = 0;
    let depositTotal = 0;

    items.forEach((item: any) => {
      const price = Number(item.price);
      const deposit = Number(item.deposit);
      const qty = item.quantity || 1;
      subtotal += price; 
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
          create: items.map((item: any) => ({
            productId: item.productId,
            variantId: defaultVariant.id,
            priceListId: defaultPriceList.id,
            rentalPeriodId: defaultPeriod.id,
            quantity: item.quantity || 1,
            startsAt: new Date(item.startDate || Date.now()),
            endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            unitPrice: Number(item.price) / (item.quantity || 1),
            depositAmount: Number(item.deposit),
          }))
        }
      }
    });

    // Create payment records
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
    }

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

import PDFDocument from 'pdfkit';

export const downloadInvoice = async (req: Request, res: Response) => {
  try {
    const { rentalId } = req.params;
    const customerId = req.user!.id;
    
    const rental = await prisma.rentalOrder.findFirst({
      where: { id: rentalId, customerId },
      include: { items: { include: { product: true } } }
    });

    if (!rental) return res.status(404).json({ error: 'Not found' });

    // Set PDF headers
    res.setHeader('Content-disposition', `attachment; filename="Invoice_${rental.orderNumber}.pdf"`);
    res.setHeader('Content-type', 'application/pdf');

    // Initialize PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Pipe PDF straight to the HTTP response
    doc.pipe(res);

    // Build PDF content
    doc.fontSize(20).text('RENTAL INVOICE', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).text(`Order Number: ${rental.orderNumber}`);
    doc.text(`Order Date: ${new Date(rental.createdAt).toLocaleString()}`);
    doc.text(`Status: ${rental.status}`);
    doc.moveDown(2);

    doc.fontSize(16).text('Items', { underline: true });
    doc.moveDown();

    rental.items.forEach(item => {
        doc.fontSize(12).fillColor('black').text(`• ${item.product.name} (Qty: ${item.quantity})`);
        doc.fontSize(10).fillColor('gray').text(`   Rental Price: ₹${item.unitPrice}`);
        doc.fillColor('gray').text(`   Deposit: ₹${item.depositAmount}`);
        doc.moveDown(0.5);
    });

    doc.moveDown();
    doc.fontSize(16).fillColor('black').text('Financials', { underline: true });
    doc.moveDown();

    doc.fontSize(12).text(`Rental Subtotal: ₹${rental.subtotal}`);
    doc.text(`Security Deposit: ₹${rental.depositTotal}`);
    doc.moveDown();
    
    doc.fontSize(14).text(`GRAND TOTAL: ₹${rental.grandTotal}`, { stroke: true });
    
    doc.moveDown(3);
    doc.fontSize(10).fillColor('gray').text('Thank you for renting with RentOps!', { align: 'center' });

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Invoice download failed:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed' });
    }
  }
};
