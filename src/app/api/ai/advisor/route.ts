import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { askFinancialAdvisor } from "@/lib/ai/financial-advisor";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { question, conversationId } = await req.json();
    const result = await askFinancialAdvisor(session.user.id, question, conversationId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI Advisor Error:", error);
    return NextResponse.json({ error: "Failed to process query" }, { status: 500 });
  }
}
