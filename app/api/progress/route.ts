import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getUser,
  getUserProgress,
  getWeeklyCompletedCount,
  getRecentModules,
} from "@/lib/progress";

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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUser(userId);
  if (!user) {
    return NextResponse.json({ user: null });
  }

  const [progress, weeklyCount, recentModules] = await Promise.all([
    getUserProgress(userId),
    getWeeklyCompletedCount(userId),
    getRecentModules(userId, 5),
  ]);

  return NextResponse.json({
    user,
    progress,
    completedCount: Object.keys(progress).length,
    weeklyCount,
    recentModules,
  });
}
