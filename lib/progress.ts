import { db } from "./firebase";
import { FieldValue } from "firebase-admin/firestore";
import { checkAndAwardBadges, type BadgeDefinition } from "./badges";

// ---------- Types ----------

export interface UserData {
  email: string;
  name: string;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  role?: "consultant" | "designer" | "engineer";
  experience?: "beginner" | "some" | "advanced";
  learningPathId?: string;
  department?: string;
  completedCount: number;
  createdAt: FirebaseFirestore.Timestamp;
}

export interface ModuleProgress {
  completedAt: FirebaseFirestore.Timestamp;
  quizScore: number | null;
  xpEarned: number;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  email: string;
  xp: number;
  level: number;
  completedCount: number;
  lastActiveDate: string;
  department?: string;
}

// ---------- Helpers ----------

function calcLevel(xp: number): number {
  // Level 1: 0, Level 2: 100, Level 3: 250, Level 4: 450, ...
  // 各レベルに必要な累計XP: level N = sum(50 * i) for i=1..N-1
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

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function calcStreak(lastActiveDate: string, currentStreak: number): number {
  const today = todayStr();
  if (lastActiveDate === today) return currentStreak;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (lastActiveDate === yesterdayStr) return currentStreak + 1;
  return 1; // ストリークリセット
}

// ---------- User CRUD ----------

export async function getUser(userId: string): Promise<UserData | null> {
  const doc = await db.collection("users").doc(userId).get();
  if (!doc.exists) return null;
  return doc.data() as UserData;
}

export async function createUser(
  userId: string,
  data: { email: string; name: string }
): Promise<UserData> {
  const userData: UserData = {
    email: data.email,
    name: data.name,
    xp: 0,
    level: 1,
    streak: 0,
    lastActiveDate: todayStr(),
    completedCount: 0,
    createdAt: FieldValue.serverTimestamp() as unknown as FirebaseFirestore.Timestamp,
  };
  await db.collection("users").doc(userId).set(userData);
  return userData;
}

export async function updateUserOnboarding(
  userId: string,
  data: {
    role: "consultant" | "designer" | "engineer";
    experience: "beginner" | "some" | "advanced";
    learningPathId: string;
  }
): Promise<void> {
  await db.collection("users").doc(userId).update({
    role: data.role,
    experience: data.experience,
    learningPathId: data.learningPathId,
  });
}

// ---------- Progress ----------

export async function getUserProgress(
  userId: string
): Promise<Record<string, ModuleProgress>> {
  const snapshot = await db
    .collection("users")
    .doc(userId)
    .collection("progress")
    .get();

  const progress: Record<string, ModuleProgress> = {};
  snapshot.forEach((doc) => {
    progress[doc.id] = doc.data() as ModuleProgress;
  });
  return progress;
}

export async function markModuleComplete(
  userId: string,
  categoryId: string,
  moduleId: string,
  quizScore: number | null = null
): Promise<{ xpEarned: number; newBadges: BadgeDefinition[] }> {
  const progressId = `${categoryId}--${moduleId}`;
  const progressRef = db
    .collection("users")
    .doc(userId)
    .collection("progress")
    .doc(progressId);

  // 既に完了済みならスキップ
  const existing = await progressRef.get();
  if (existing.exists) {
    return { xpEarned: 0, newBadges: [] };
  }

  const xpEarned = 30; // モジュール完了ベースXP
  await progressRef.set({
    completedAt: FieldValue.serverTimestamp(),
    quizScore,
    xpEarned,
  });

  // ユーザーのXP/レベル/ストリーク/完了数を更新
  const userRef = db.collection("users").doc(userId);
  await userRef.update({
    completedCount: FieldValue.increment(1),
  });
  await addXP(userId, xpEarned);

  // バッジ判定
  const newBadges = await checkAndAwardBadges(userId);

  return { xpEarned, newBadges };
}

export async function addXP(userId: string, amount: number): Promise<void> {
  const userRef = db.collection("users").doc(userId);
  const user = await userRef.get();
  if (!user.exists) return;

  const data = user.data() as UserData;
  const newXP = data.xp + amount;
  const newLevel = calcLevel(newXP);
  const newStreak = calcStreak(data.lastActiveDate, data.streak);

  await userRef.update({
    xp: newXP,
    level: newLevel,
    streak: newStreak,
    lastActiveDate: todayStr(),
  });
}

export async function saveQuizXP(
  userId: string,
  categoryId: string,
  moduleId: string,
  score: number
): Promise<{ xpEarned: number; newBadges: BadgeDefinition[] }> {
  const xpEarned = score * 10;
  const progressId = `${categoryId}--${moduleId}`;
  const progressRef = db
    .collection("users")
    .doc(userId)
    .collection("progress")
    .doc(progressId);

  // クイズスコアを更新（モジュール完了とは別にクイズXPを記録）
  const existing = await progressRef.get();
  if (existing.exists) {
    await progressRef.update({ quizScore: score });
  } else {
    await progressRef.set({
      completedAt: FieldValue.serverTimestamp(),
      quizScore: score,
      xpEarned,
    });
  }

  await addXP(userId, xpEarned);
  const newBadges = await checkAndAwardBadges(userId);
  return { xpEarned, newBadges };
}

// ---------- Leaderboard ----------

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const usersSnapshot = await db
    .collection("users")
    .orderBy("xp", "desc")
    .limit(50)
    .get();

  return usersSnapshot.docs.map((doc) => {
    const data = doc.data() as UserData;
    return {
      userId: doc.id,
      name: data.name,
      email: data.email,
      xp: data.xp,
      level: data.level,
      completedCount: data.completedCount ?? 0,
      lastActiveDate: data.lastActiveDate,
      department: data.department,
    };
  });
}

// ---------- Module Stats (Social Proof) ----------

export async function getModuleCompletionCounts(): Promise<Record<string, number>> {
  const usersSnapshot = await db.collection("users").limit(200).get();
  const counts: Record<string, number> = {};

  // Use cached completedCount from user docs + progress subcollections
  const progressPromises = usersSnapshot.docs.map(async (userDoc) => {
    const progressSnap = await db
      .collection("users")
      .doc(userDoc.id)
      .collection("progress")
      .get();
    for (const doc of progressSnap.docs) {
      counts[doc.id] = (counts[doc.id] ?? 0) + 1;
    }
  });

  await Promise.all(progressPromises);
  return counts;
}

export async function getTotalLearnerCount(): Promise<number> {
  const snapshot = await db.collection("users").count().get();
  return snapshot.data().count;
}

// ---------- Feedback ----------

export async function saveModuleFeedback(
  userId: string,
  categoryId: string,
  moduleId: string,
  rating: number,
  comment: string
): Promise<void> {
  const feedbackId = `${categoryId}--${moduleId}`;
  await db.collection("feedback").doc(`${userId}__${feedbackId}`).set({
    userId,
    categoryId,
    moduleId,
    rating,
    comment,
    createdAt: FieldValue.serverTimestamp(),
  });
}

// ---------- Weekly Stats ----------

export async function getWeeklyCompletedCount(userId: string): Promise<number> {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const snapshot = await db
    .collection("users")
    .doc(userId)
    .collection("progress")
    .where("completedAt", ">=", monday)
    .get();

  return snapshot.size;
}

export async function getRecentModules(
  userId: string,
  limit: number = 5
): Promise<Array<{ id: string; completedAt: FirebaseFirestore.Timestamp }>> {
  const snapshot = await db
    .collection("users")
    .doc(userId)
    .collection("progress")
    .orderBy("completedAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    completedAt: doc.data().completedAt,
  }));
}
