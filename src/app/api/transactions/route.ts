import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helper";
import { TransactionService } from "@/server/services/transaction-service";
import prisma from "@/lib/prisma";

const transactionService = new TransactionService();

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: user.id, isDeleted: false },
      include: { account: true, category: true },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
    prisma.transaction.count({
      where: { userId: user.id, isDeleted: false },
    }),
  ]);

  return NextResponse.json({
    transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const transaction = await transactionService.createTransaction({
      ...body,
      userId: user.id,
      date: new Date(body.date),
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
