import prisma from '@/lib/prisma';
import { getSpendingTrends, getCategoryBreakdown } from './financial-analytics';
import { addMonths, addDays } from 'date-fns';
import { InsightType, InsightSeverity } from '@prisma/client';

export async function generateInsights(userId: string) {
  const insights = [];
  
  // 1. Budget Alerts
  const budgets = await prisma.budget.findMany({
    where: { userId, isActive: true, endDate: { gte: new Date() } },
    include: { allocations: true },
  });
  
  for (const budget of budgets) {
    const totalAllocated = Number(budget.totalAmount);
    // Explicitly type accumulator
    const totalSpent = budget.allocations.reduce((sum: number, a: any) => sum + Number(a.spent), 0);
    const utilization = (totalSpent / totalAllocated) * 100;
    
    if (utilization > 100) {
      insights.push({
        userId,
        type: InsightType.OVERSPENDING,
        title: `Sobregasto en ${budget.name}`,
        description: `Has excedido tu presupuesto por ${(totalSpent - totalAllocated).toFixed(2)}€.`,
        severity: InsightSeverity.CRITICAL,
        data: { utilization },
      });
    } else if (utilization > 90) {
      insights.push({
        userId,
        type: InsightType.BUDGET_ALERT,
        title: `Presupuesto ${budget.name} casi agotado`,
        description: `Has utilizado el ${utilization.toFixed(1)}% de tu presupuesto.`,
        severity: InsightSeverity.WARNING,
        data: { utilization },
      });
    }
  }
  
  // 2. Unusual Transactions
  const avgTx = await prisma.transaction.aggregate({
    where: { userId, type: 'EXPENSE', isDeleted: false, date: { gte: addMonths(new Date(), -3) } },
    _avg: { amount: true },
  });
  
  const threshold = Number(avgTx._avg.amount || 0) * 3;
  if (threshold > 0) {
    const unusual = await prisma.transaction.findMany({
      where: { userId, type: 'EXPENSE', isDeleted: false, amount: { gte: threshold }, date: { gte: addDays(new Date(), -7) } },
    });
    
    for (const tx of unusual) {
      insights.push({
        userId,
        type: InsightType.UNUSUAL_TRANSACTION,
        title: 'Gasto inusual detectado',
        description: `Un gasto de ${Number(tx.amount).toFixed(2)}€ en ${tx.description} es muy superior a tu habitual.`,
        severity: InsightSeverity.INFO,
        data: { transactionId: tx.id },
      });
    }
  }
  
  // Save to DB
  if (insights.length > 0) {
    await prisma.financialInsight.createMany({ data: insights });
  }
  
  return insights;
}
