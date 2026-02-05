import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = req.nextUrl.searchParams.get("status") || "ACTIVE";

  // Mock data for subscriptions
  const mockSubscriptions = [
    {
      id: "sub_1",
      name: "Netflix",
      amount: 15.99,
      currency: "EUR",
      frequency: "MONTHLY",
      nextBillingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Entretenimiento",
      status: "ACTIVE",
    },
    {
      id: "sub_2",
      name: "Spotify",
      amount: 11.99,
      currency: "EUR",
      frequency: "MONTHLY",
      nextBillingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Música",
      status: "ACTIVE",
    },
    {
      id: "sub_3",
      name: "Adobe Creative Cloud",
      amount: 54.99,
      currency: "EUR",
      frequency: "MONTHLY",
      nextBillingDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Software",
      status: "ACTIVE",
    },
  ];

  const filtered = status === "ALL" 
    ? mockSubscriptions 
    : mockSubscriptions.filter(s => s.status === status);

  return NextResponse.json(filtered);
}
