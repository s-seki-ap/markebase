import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getLeaderboard } from "@/lib/progress";

const isDevBypass =
  process.env.NODE_ENV !== "production" && !process.env.GOOGLE_CLIENT_ID;

function isAdmin(email: string | null | undefined): boolean {
  if (isDevBypass) return true;
  if (!email) return false;
  const adminEmails = process.env.ADMIN_EMAILS ?? "";
  const allowed = adminEmails.split(",").map((e) => e.trim()).filter(Boolean);
  return allowed.some((a) => {
    if (a.startsWith("@")) return email.endsWith(a);
    return email === a;
  });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const leaderboard = await getLeaderboard();

  const header = "名前,メール,部門,完了モジュール数,XP,レベル,最終学習日\n";
  const rows = leaderboard.map((e) =>
    [
      e.name,
      e.email,
      e.department ?? "未設定",
      e.completedCount,
      e.xp,
      e.level,
      e.lastActiveDate,
    ].join(",")
  );

  const csv = "\uFEFF" + header + rows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="markebase_report_${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
