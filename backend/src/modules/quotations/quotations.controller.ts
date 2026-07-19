import { Request, Response } from 'express';
import { prisma } from '../../db/prisma.js';
import { pricingService } from '../pricing/pricing.service.js';
import { RentalStatus, PaymentType } from '../../generated/prisma/client.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatesFilePath = path.join(__dirname, 'templates.json');

const getTemplates = () => {
  if (!fs.existsSync(templatesFilePath)) {
    return {
      header: 'RentOps Inc. Quotation\n123 Business Rd.\nContact: info@rentops.com',
      footer: 'Thank you for your business. Valid for 30 days.'
    };
  }
  return JSON.parse(fs.readFileSync(templatesFilePath, 'utf8'));
};

const saveTemplates = (data: any) => {
  fs.writeFileSync(templatesFilePath, JSON.stringify(data, null, 2), 'utf8');
};

export const getQuotations = async (req: Request, res: Response) => {
  try {
    const quotations = await prisma.quotation.findMany({
      include: {
        customer: {
          select: {
            fullName: true,
            email: true
          }
        },
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ data: quotations });
  } catch (error) {
    console.error('Failed to fetch quotations:', error);
    res.status(500).json({ error: 'Failed to fetch quotations' });
  }
};

export const getQuotationTemplates = async (req: Request, res: Response) => {
  try {
    const templates = getTemplates();
    res.json({ data: templates });
  } catch (error) {
    console.error('Failed to fetch quotation templates:', error);
    res.status(500).json({ error: 'Failed to fetch quotation templates' });
  }
};

export const createQuotationTemplate = async (req: Request, res: Response) => {
  try {
    const { header, footer } = req.body;
    saveTemplates({ header, footer });
    res.status(201).json({ data: { header, footer }, message: 'Created quotation template' });
  } catch (error) {
    console.error('Failed to save quotation template:', error);
    res.status(500).json({ error: 'Failed to save quotation template' });
  }
};

export const createQuotation = async (req: Request, res: Response) => {
  try {
    const { customerId, items } = req.body;
    const createdById = req.user!.id;

    if (!customerId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Customer ID and items are required' });
    }

    const defaultPl = await prisma.priceList.findFirst({ where: { isDefault: true } });
    const priceListId = defaultPl?.id || (await prisma.priceList.findFirst())?.id;
    if (!priceListId) {
      return res.status(400).json({ error: 'No active price list found' });
    }

    let subtotal = 0;
    let depositTotal = 0;

    const computedItems = [];

    for (const item of items) {
      const { productId, variantId, rentalPeriodId, quantity, startsAt, endsAt } = item;
      
      const { unitPrice, depositAmount } = await pricingService.calculatePriceAndDeposit(
        priceListId,
        rentalPeriodId,
        productId,
        variantId
      );

      const qty = Number(quantity) || 1;
      subtotal += unitPrice * qty;
      depositTotal += depositAmount * qty;

      computedItems.push({
        productId,
        variantId,
        rentalPeriodId,
        quantity: qty,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        unitPrice,
        depositAmount
      });
    }

    const grandTotal = subtotal + depositTotal;
    const templates = getTemplates();

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber: `QT-${Date.now()}`,
        customerId,
        createdById,
        priceListId,
        subtotal,
        depositTotal,
        grandTotal,
        header: templates.header,
        footer: templates.footer,
        items: {
          create: computedItems
        }
      },
      include: {
        customer: {
          select: {
            fullName: true,
            email: true
          }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.status(201).json({ data: quotation, message: 'Created quotation successfully' });
  } catch (error: any) {
    console.error('Failed to create quotation:', error);
    res.status(500).json({ error: 'Failed to create quotation' });
  }
};

export const confirmQuotation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    if (quotation.status === 'CONFIRMED') {
      return res.status(400).json({ error: 'Quotation is already confirmed' });
    }

    // Convert Quotation to RentalOrder
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update quotation status
      await tx.quotation.update({
        where: { id },
        data: { status: 'CONFIRMED', confirmedAt: new Date() }
      });

      // 2. Create RentalOrder
      const orderNumber = `ORD-FROM-QT-${quotation.quotationNumber.split('-')[1] || Date.now()}`;
      const rentalOrder = await tx.rentalOrder.create({
        data: {
          orderNumber,
          customerId: quotation.customerId,
          status: 'CONFIRMED',
          subtotal: quotation.subtotal,
          depositTotal: quotation.depositTotal,
          grandTotal: quotation.grandTotal,
          confirmedAt: new Date(),
          items: {
            create: await Promise.all(quotation.items.map(async (item) => {
              // Find available physical inventory unit to allocate
              const availableUnit = await tx.inventoryUnit.findFirst({
                where: {
                  variantId: item.variantId,
                  status: 'AVAILABLE'
                }
              });

              // Mark allocated unit as RESERVED
              if (availableUnit) {
                await tx.inventoryUnit.update({
                  where: { id: availableUnit.id },
                  data: { status: 'RESERVED' }
                });
              }

              return {
                product: { connect: { id: item.productId } },
                variant: { connect: { id: item.variantId } },
                inventoryUnit: availableUnit ? { connect: { id: availableUnit.id } } : undefined,
                priceList: { connect: { id: quotation.priceListId } },
                rentalPeriod: { connect: { id: item.rentalPeriodId } },
                quantity: item.quantity,
                startsAt: item.startsAt,
                endsAt: item.endsAt,
                unitPrice: item.unitPrice,
                depositAmount: item.depositAmount,
                status: 'CONFIRMED' as RentalStatus
              };
            }))
          }
        }
      });

      // 3. Create Invoice
      const invoiceNumber = `INV-${Date.now()}`;
      await tx.invoice.create({
        data: {
          invoiceNumber,
          rentalOrderId: rentalOrder.id,
          status: 'ISSUED',
          subtotal: quotation.subtotal,
          depositAmount: quotation.depositTotal,
          total: quotation.grandTotal
        }
      });

      // 4. Create payment record
      await tx.payment.create({
        data: {
          rentalOrderId: rentalOrder.id,
          userId: quotation.customerId,
          type: 'RENTAL_CHARGE',
          provider: 'MOCK',
          status: 'PAID',
          amount: quotation.grandTotal,
          paidAt: new Date()
        }
      });

      return rentalOrder;
    });

    res.json({ data: result, message: `Successfully confirmed quotation ${id} into rental order.` });
  } catch (error) {
    console.error('Failed to confirm quotation:', error);
    res.status(500).json({ error: 'Failed to confirm quotation' });
  }
};
