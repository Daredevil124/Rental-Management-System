import { Request, Response } from 'express';
import { prisma } from '../../db/prisma.js';

export const getQuotationTemplates = async (req: Request, res: Response) => {
  try {
    res.json({ data: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quotation templates' });
  }
};

export const createQuotationTemplate = async (req: Request, res: Response) => {
  try {
    res.status(201).json({ data: null, message: 'Created quotation template' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create quotation template' });
  }
};

export const createQuotation = async (req: Request, res: Response) => {
  try {
    res.status(201).json({ data: null, message: 'Created quotation' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create quotation' });
  }
};

export const confirmQuotation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    res.json({ data: null, message: `Confirmed quotation ${id}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to confirm quotation' });
  }
};
