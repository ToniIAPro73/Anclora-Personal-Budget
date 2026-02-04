import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { categorizeTransaction } from "@/lib/ai/transaction-categorizer";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { description, merchant, amount, date } = await req.json();
    
    // Get categories and historical patterns for context
    const [categories, historicalPatterns] = await Promise.all([
      prisma.category.findMany({ 
        where: { userId: session.user.id },
        select: { id: true, name: true, keywords: true }
      }),
      prisma.transaction.findMany({
        where: { userId: session.user.id, merchant: { not: null } },
        select: { merchant: true, categoryId: true },
        take: 100,
      })
    ]);

    const result = await categorizeTransaction(
      { description, merchant, amount, date: new Date(date) },
      categories as any,
      session.user.id
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI Categorization Error:", error);
    return NextResponse.json({ error: "Failed to categorize" }, { status: 500 });
  }
}
