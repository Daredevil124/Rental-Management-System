import { LateFeeUnit } from '../generated/prisma/client.js';

export const calculateLateFee = (
  endsAt: Date,
  returnedAt: Date,
  rule: { unit: LateFeeUnit; amount: number; gracePeriodMinutes: number; maxFee: number | null }
): number => {
  const overdueMs = returnedAt.getTime() - endsAt.getTime();
  
  // If not overdue, or within grace period, no fee
  const gracePeriodMs = rule.gracePeriodMinutes * 60 * 1000;
  if (overdueMs <= gracePeriodMs) {
    return 0;
  }

  let unitsOverdue = 0;
  
  const msInHour = 60 * 60 * 1000;
  const msInDay = 24 * msInHour;
  const msInWeek = 7 * msInDay;
  const msInMonth = 30 * msInDay; // simplified

  switch (rule.unit) {
    case LateFeeUnit.HOURLY:
      unitsOverdue = Math.ceil(overdueMs / msInHour);
      break;
    case LateFeeUnit.DAILY:
      unitsOverdue = Math.ceil(overdueMs / msInDay);
      break;
    case LateFeeUnit.WEEKLY:
      unitsOverdue = Math.ceil(overdueMs / msInWeek);
      break;
    case LateFeeUnit.MONTHLY:
      unitsOverdue = Math.ceil(overdueMs / msInMonth);
      break;
  }

  let totalFee = unitsOverdue * rule.amount;

  if (rule.maxFee && totalFee > rule.maxFee) {
    totalFee = rule.maxFee;
  }

  return totalFee;
};
