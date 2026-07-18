import { Request, Response } from 'express';
import { prisma } from '../../db/prisma.js';

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    // 1. Active Rentals (CONFIRMED, PICKUP_SCHEDULED, PICKED_UP, RETURN_DUE)
    const activeRentals = await prisma.rentalOrder.count({
      where: {
        status: {
          in: ['CONFIRMED', 'PICKUP_SCHEDULED', 'PICKED_UP', 'RETURN_DUE'],
        },
      },
    });

    // 2. Overdue Rentals
    const overdue = await prisma.rentalOrder.count({
      where: {
        status: 'OVERDUE',
      },
    });

    // 3. Rentals Due Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueToday = await prisma.returnTask.count({
      where: {
        scheduledAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // 4. Upcoming Pickups
    const upcomingPickups = await prisma.pickupTask.count({
      where: {
        status: {
          in: ['SCHEDULED', 'IN_PROGRESS'],
        },
      },
    });

    // 5. Upcoming Returns
    const upcomingReturns = await prisma.returnTask.count({
      where: {
        status: {
          in: ['SCHEDULED', 'IN_PROGRESS'],
        },
      },
    });

    // 6. Revenue from Rentals
    const paymentsSummary = await prisma.payment.aggregate({
      where: {
        type: 'RENTAL_CHARGE',
        status: 'PAID',
      },
      _sum: {
        amount: true,
      },
    });
    const rentalRevenue = Number(paymentsSummary._sum.amount || 0);

    // 7. Security Deposits Held
    const depositsHeldSummary = await prisma.payment.aggregate({
      where: {
        type: 'SECURITY_DEPOSIT',
        status: 'PAID',
      },
      _sum: {
        amount: true,
      },
    });
    const securityDepositsHeld = Number(depositsHeldSummary._sum.amount || 0);

    // 8. Late Fee Collection
    const lateFeesSummary = await prisma.payment.aggregate({
      where: {
        type: 'LATE_FEE',
        status: 'PAID',
      },
      _sum: {
        amount: true,
      },
    });
    const lateFeeCollection = Number(lateFeesSummary._sum.amount || 0);

    // Calculate revenueToday for the frontend UI "Revenue Today" card
    const revenueTodaySummary = await prisma.payment.aggregate({
      where: {
        status: 'PAID',
        paidAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      _sum: {
        amount: true,
      },
    });
    const revenueToday = Number(revenueTodaySummary._sum.amount || 0);

    res.json({
      data: {
        activeRentals,
        overdue,
        dueToday,
        upcomingPickups,
        upcomingReturns,
        rentalRevenue,
        securityDepositsHeld,
        lateFeeCollection,
        revenueToday,
      }
    });
  } catch (error) {
    console.error('[Dashboard API] Error calculating metrics:', error);
    res.status(500).json({ error: { message: 'Failed to retrieve dashboard metrics' } });
  }
};

export const getRentalActivity = async (req: Request, res: Response) => {
  try {
    const activity = await prisma.rentalOrder.findMany({ 
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
    res.json({ data: activity });
  } catch (error) {
    console.error('[Dashboard API] Error fetching recent activities:', error);
    res.status(500).json({ error: { message: 'Failed to retrieve rental activities' } });
  }
};
