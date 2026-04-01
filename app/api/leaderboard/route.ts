import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLeaderboard } from "@/lib/progress";

const isDevBypass = !process.env.GOOGLE_CLIENT_ID;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isDevBypass && !session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leaderboard = await getLeaderboard();
  return NextResponse.json({ leaderboard });
}
