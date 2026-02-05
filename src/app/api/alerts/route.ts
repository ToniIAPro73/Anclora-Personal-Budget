import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helper";
import { AlertService } from "@/server/services/alert-service";

const alertService = new AlertService();

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get("unread") === "true";
  
  if (unreadOnly) {
    const count = await alertService.getUnreadCount(user.id);
    return NextResponse.json({ count });
  }

  const alerts = await alertService.getAlerts(user.id);
  return NextResponse.json(alerts);
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await alertService.markAllAsRead(user.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
