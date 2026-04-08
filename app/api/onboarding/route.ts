import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUser, createUser, updateUserOnboarding } from "@/lib/progress";

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
  const { role, experience, learningPathId } = body as {
    role: "consultant" | "designer" | "engineer";
    experience: "beginner" | "some" | "advanced";
    learningPathId: string;
  };

  // ユーザーが存在しなければ作成
  const existing = await getUser(userId);
  if (!existing) {
    const name = session?.user?.name ?? "ゲスト";
    const email = session?.user?.email ?? userId;
    await createUser(userId, { email, name });
  }

  await updateUserOnboarding(userId, { role, experience, learningPathId });

  return NextResponse.json({ success: true });
}
