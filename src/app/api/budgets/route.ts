import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helper";
import { BudgetService } from "@/server/services/budget-service";
import { startOfMonth, endOfMonth, addMonths, addQuarters, addYears } from "date-fns";

const budgetService = new BudgetService();

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const budgets = await budgetService.getActiveBudgets(user.id);
  return NextResponse.json(budgets);
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    // Automatically set dates based on period if not provided
    let startDate = body.startDate ? new Date(body.startDate) : new Date();
    let endDate = body.endDate ? new Date(body.endDate) : null;

    if (!endDate) {
      if (body.period === "MONTHLY") endDate = endOfMonth(startDate);
      else if (body.period === "QUARTERLY") endDate = addQuarters(startDate, 1);
      else if (body.period === "YEARLY") endDate = addYears(startDate, 1);
      else endDate = addMonths(startDate, 1);
    }

    const budget = await budgetService.createBudget({
      ...body,
      userId: user.id,
      startDate,
      endDate,
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error: any) {
    console.error("Error creating budget:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
