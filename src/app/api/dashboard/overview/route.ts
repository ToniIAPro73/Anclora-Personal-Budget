import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth, addMonths } from "date-fns";
import { getSpendingTrends, getCategoryBreakdown } from "@/lib/analytics/financial-analytics";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  // 1. Get Accounts & Total Balance
  const accounts = await prisma.account.findMany({
    where: { userId, isActive: true },
  });
  const totalBalance = accounts.reduce((sum: number, acc: any) => sum + Number(acc.currentBalance), 0);

  // 2. Get Month Income vs Expenses
  const currentMonthTransactions = await prisma.transaction.findMany({
    where: { 
      userId, 
      isDeleted: false, 
      date: { gte: start, lte: end } 
    },
  });

  const monthlyIncome = currentMonthTransactions
    .filter((t: any) => t.type === 'INCOME')
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  
  const monthlyExpenses = currentMonthTransactions
    .filter((t: any) => t.type === 'EXPENSE')
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  // 3. Analytics
  const spendingTrends = await getSpendingTrends(userId, 6);
  const categoryBreakdown = await getCategoryBreakdown(userId, start, end);

  // 4. Budgets
  const budgets = await prisma.budget.findMany({
    where: { userId, isActive: true, endDate: { gte: now } },
    include: { allocations: { include: { category: true } } },
  });

  return NextResponse.json({
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    spendingTrends,
    categoryBreakdown,
    budgets,
  });
}
