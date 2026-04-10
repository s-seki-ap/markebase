import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase";
import type { UserData, ModuleProgress } from "@/lib/progress";

const isDevBypass =
  process.env.NODE_ENV !== "production" && !process.env.GOOGLE_CLIENT_ID;

const MODULE_BASE_XP = 30;
const QUIZ_POINT_XP = 10;

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

function calcLevel(xp: number): number {
  let level = 1;
  let threshold = 0;
  let increment = 100;
  while (xp >= threshold + increment) {
    threshold += increment;
    level++;
    increment += 50;
  }
  return level;
}

interface BackfillResult {
  userId: string;
  name: string;
  oldXp: number;
  newXp: number;
  diff: number;
  oldLevel: number;
  newLevel: number;
  oldCompletedCount: number;
  newCompletedCount: number;
  changed: boolean;
}

async function computeBackfill(): Promise<BackfillResult[]> {
  const usersSnap = await db.collection("users").get();
  const results: BackfillResult[] = [];

  for (const userDoc of usersSnap.docs) {
    const userId = userDoc.id;
    const userData = userDoc.data() as UserData;
    const oldXp = userData.xp ?? 0;
    const oldLevel = userData.level ?? 1;
    const oldCompletedCount = userData.completedCount ?? 0;

    const progressSnap = await db
      .collection("users")
      .doc(userId)
      .collection("progress")
      .get();

    let newXp = 0;
    let newCompletedCount = 0;
    for (const progressDoc of progressSnap.docs) {
      const p = progressDoc.data() as ModuleProgress;
      newXp += MODULE_BASE_XP;
      newCompletedCount += 1;
      if (p.quizScore !== null && p.quizScore !== undefined) {
        newXp += p.quizScore * QUIZ_POINT_XP;
      }
    }
    const newLevel = calcLevel(newXp);
    const changed =
      newXp !== oldXp ||
      newLevel !== oldLevel ||
      newCompletedCount !== oldCompletedCount;

    results.push({
      userId,
      name: userData.name ?? userId,
      oldXp,
      newXp,
      diff: newXp - oldXp,
      oldLevel,
      newLevel,
      oldCompletedCount,
      newCompletedCount,
      changed,
    });
  }

  return results;
}

function buildSummary(results: BackfillResult[]) {
  return {
    userCount: results.length,
    changedCount: results.filter((r) => r.changed).length,
    totalDiff: results.reduce((s, r) => s + r.diff, 0),
    totalOldXp: results.reduce((s, r) => s + r.oldXp, 0),
    totalNewXp: results.reduce((s, r) => s + r.newXp, 0),
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const results = await computeBackfill();
  return NextResponse.json({
    dryRun: true,
    summary: buildSummary(results),
    users: results,
  });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const results = await computeBackfill();
  const toUpdate = results.filter((r) => r.changed);

  // Firestore バッチは最大500オペレーション
  const CHUNK = 400;
  for (let i = 0; i < toUpdate.length; i += CHUNK) {
    const batch = db.batch();
    for (const r of toUpdate.slice(i, i + CHUNK)) {
      batch.update(db.collection("users").doc(r.userId), {
        xp: r.newXp,
        level: r.newLevel,
        completedCount: r.newCompletedCount,
      });
    }
    await batch.commit();
  }

  return NextResponse.json({
    applied: true,
    summary: buildSummary(results),
    users: results,
  });
}
