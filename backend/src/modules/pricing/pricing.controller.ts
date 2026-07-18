import { Request, Response, NextFunction } from 'express';
import { pricingService } from './pricing.service.js';
import {
  createPriceListSchema,
  createLateFeeRuleSchema,
  createDepositRuleSchema,
  createPricingRuleSchema,
} from './pricing.schema.js';

export class PricingController {
  async getRentalPeriods(req: Request, res: Response, next: NextFunction) {
    try {
      const periods = await pricingService.getRentalPeriods();
      res.status(200).json({ data: periods });
    } catch (error) {
      next(error);
    }
  }

  async getPriceLists(req: Request, res: Response, next: NextFunction) {
    try {
      const lists = await pricingService.getPriceLists();
      res.status(200).json({ data: lists });
    } catch (error) {
      next(error);
    }
  }

  async createPriceList(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createPriceListSchema.parse(req.body);
      const list = await pricingService.createPriceList(parsed);
      res.status(201).json({ data: list });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: { message: 'Validation failed', details: error.errors } });
        return;
      }
      next(error);
    }
  }

  async createLateFeeRule(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createLateFeeRuleSchema.parse(req.body);
      const rule = await pricingService.createLateFeeRule(parsed);
      res.status(201).json({ data: rule });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: { message: 'Validation failed', details: error.errors } });
        return;
      }
      next(error);
    }
  }

  async createDepositRule(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createDepositRuleSchema.parse(req.body);
      const rule = await pricingService.createDepositRule(parsed);
      res.status(201).json({ data: rule });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: { message: 'Validation failed', details: error.errors } });
        return;
      }
      next(error);
    }
  }

  async createPricingRule(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createPricingRuleSchema.parse(req.body);
      const rule = await pricingService.createPricingRule(parsed);
      res.status(201).json({ data: rule });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: { message: 'Validation failed', details: error.errors } });
        return;
      }
      next(error);
    }
  }
}

export const pricingController = new PricingController();
