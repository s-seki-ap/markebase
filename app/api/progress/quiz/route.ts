import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { saveQuizXP } from "@/lib/progress";
import { revalidatePath } from "next/cache";

const isDevBypass =
  process.env.NODE_ENV !== "production" && !process.env.GOOGLE_CLIENT_ID;

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
  const { categoryId, moduleId, score } = body as {
    categoryId: string;
    moduleId: string;
    score: number;
  };

  if (!categoryId || !moduleId || score == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const result = await saveQuizXP(userId, categoryId, moduleId, score);
  revalidatePath("/");
  return NextResponse.json(result);
}
