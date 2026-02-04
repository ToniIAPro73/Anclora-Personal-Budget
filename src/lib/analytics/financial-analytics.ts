import prisma from '@/lib/prisma';
import { safeDecimal } from '@/lib/finance/calculation-rules';
import { addMonths, format } from 'date-fns';

export async function getSpendingTrends(userId: string, months: number = 6) {
  const startDate = addMonths(new Date(), -months);
  
  const transactions = await prisma.transaction.findMany({
    where: { userId, type: 'EXPENSE', isDeleted: false, date: { gte: startDate } },
    select: { amount: true, date: true },
    orderBy: { date: 'asc' },
  });
  
  const monthlySpending = new Map<string, number>();
  for (const tx of transactions) {
    const monthKey = format(tx.date, 'yyyy-MM');
    const current = monthlySpending.get(monthKey) || 0;
    monthlySpending.set(monthKey, current + Number(tx.amount));
  }
  
  const sortedMonths = Array.from(monthlySpending.entries()).sort();
  return sortedMonths.map(([period, amount], i) => {
    const prevAmount = i > 0 ? sortedMonths[i - 1][1] : amount;
    const change = prevAmount > 0 ? ((amount - prevAmount) / prevAmount) * 100 : 0;
    return { period, amount: safeDecimal(amount), change: safeDecimal(change) };
  });
}

export async function getCategoryBreakdown(userId: string, startDate: Date, endDate: Date) {
  const transactions = await prisma.transaction.findMany({
    where: { userId, type: 'EXPENSE', isDeleted: false, date: { gte: startDate, lte: endDate } },
    include: { category: true },
  });
  
  const categoryTotals = new Map<string, { name: string; amount: number; count: number }>();
  let grandTotal = 0;
  
  for (const tx of transactions) {
    const amount = Number(tx.amount);
    grandTotal += amount;
    if (tx.categoryId && tx.category) {
      const existing = categoryTotals.get(tx.categoryId) || { name: tx.category.name, amount: 0, count: 0 };
      existing.amount += amount;
      existing.count += 1;
      categoryTotals.set(tx.categoryId, existing);
    }
  }
  
  return Array.from(categoryTotals.entries()).map(([categoryId, data]) => ({
    categoryId,
    categoryName: data.name,
    amount: safeDecimal(data.amount),
    percentage: safeDecimal((data.amount / grandTotal) * 100),
    transactionCount: data.count,
  })).sort((a, b) => b.amount - a.amount);
}
