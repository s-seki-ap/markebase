import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUser } from "@/lib/progress";

const isDevBypass =
  process.env.NODE_ENV !== "production" && !process.env.GOOGLE_CLIENT_ID;

function getUserId(session: { user?: { email?: string | null } } | null): string | null {
  if (isDevBypass) return "dev-user";
  return session?.user?.email ?? null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const user = await getUser(userId);
  if (!user) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    name: user.monsterName ?? null,
    stage: user.monsterStage ?? "egg",
    primary: user.monsterPrimary ?? null,
    secondary: user.monsterSecondary ?? null,
    imageUrl: user.monsterImageUrl ?? null,
    generating: user.monsterImageGenerating ?? false,
    level: user.level,
    xp: user.xp,
  });
}
