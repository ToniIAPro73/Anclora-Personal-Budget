import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AccountService } from "@/server/services/account-service";
import prisma from "@/lib/prisma";

const accountService = new AccountService();

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await accountService.getAccounts(session.user.id);
  return NextResponse.json(accounts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const account = await accountService.createAccount({
      ...body,
      userId: session.user.id,
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
