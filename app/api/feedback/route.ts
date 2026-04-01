import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { saveModuleFeedback } from "@/lib/progress";

const isDevBypass = !process.env.GOOGLE_CLIENT_ID;

function getUserId(session: { user?: { email?: string | null } } | null): string | null {
  if (isDevBypass) return "dev-user";
  return session?.user?.email ?? null;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { categoryId, moduleId, rating, comment } = body as {
    categoryId: string;
    moduleId: string;
    rating: number;
    comment: string;
  };

  if (!categoryId || !moduleId || !rating) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await saveModuleFeedback(userId, categoryId, moduleId, rating, comment ?? "");
  return NextResponse.json({ success: true });
}
