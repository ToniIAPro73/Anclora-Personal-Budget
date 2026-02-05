import { addMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import prisma from '@/lib/prisma';
import { safeDecimal } from '@/lib/finance/calculation-rules';

export async function generateCashFlowProjection(userId: string, horizon: 'SHORT_TERM' | 'MEDIUM_TERM') {
  const startDate = new Date();
  const lookbackMonths = 6;
  const historicalStart = addMonths(startDate, -lookbackMonths);
  
  const historicalTransactions = await prisma.transaction.findMany({
    where: { userId, date: { gte: historicalStart, lt: startDate }, isDeleted: false },
  });
  
  // Calculate historical averages
  const incomes = historicalTransactions.filter((t: any) => t.type === 'INCOME').map((t: any) => Number(t.amount));
  const expenses = historicalTransactions.filter((t: any) => t.type === 'EXPENSE').map((t: any) => Number(t.amount));
  const avgIncome = incomes.length > 0 ? incomes.reduce((s: number, a: number) => s + a, 0) / lookbackMonths : 0;
  const avgExpense = expenses.length > 0 ? expenses.reduce((s: number, a: number) => s + a, 0) / lookbackMonths : 0;
  
  const accounts = await prisma.account.findMany({ where: { userId, isActive: true } });
  let runningBalance = accounts.reduce((sum: number, acc: any) => sum + Number(acc.currentBalance), 0);
  
  const projectionMonths = horizon === 'SHORT_TERM' ? 3 : 12;
  const projectionDates = eachMonthOfInterval({
    start: startOfMonth(startDate),
    end: endOfMonth(addMonths(startDate, projectionMonths - 1)),
  });
  
  return projectionDates.map(month => {
    runningBalance = runningBalance + avgIncome - avgExpense;
    return {
      month,
      projectedIncome: safeDecimal(avgIncome),
      projectedExpenses: safeDecimal(avgExpense),
      projectedBalance: safeDecimal(runningBalance),
      confidence: 0.8, // Static for now
    };
  });
}
