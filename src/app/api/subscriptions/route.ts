import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helper";
import { SubscriptionService } from "@/server/services/subscription-service";

const subscriptionService = new SubscriptionService();

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const subscriptions = await subscriptionService.getSubscriptions(user.id);
    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    // Convert string dates to Date objects for the service
    const data = {
      ...body,
      userId: user.id,
      nextBillingDate: body.nextBillingDate ? new Date(body.nextBillingDate) : undefined,
    };

    const subscription = await subscriptionService.createSubscription(data);
    return NextResponse.json(subscription, { status: 201 });
  } catch (error: any) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" }, 
      { status: 400 }
    );
  }
}
