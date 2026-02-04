import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CategoryService } from "@/server/services/category-service";
import prisma from "@/lib/prisma";

const categoryService = new CategoryService();

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await categoryService.getCategories(session.user.id);
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const category = await categoryService.createCategory({
      ...body,
      userId: session.user.id,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
