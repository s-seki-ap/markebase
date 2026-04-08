import { db } from "./firebase";
import { FieldValue } from "firebase-admin/firestore";
import badgeDefs from "@/data/badges.json";
import categories from "@/data/categories.json";

// ---------- Types ----------

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  condition:
    | { type: "category_complete"; categoryId: string }
    | { type: "modules_completed"; count: number }
    | { type: "streak"; days: number }
    | { type: "xp_threshold"; xp: number };
}

export interface EarnedBadge {
  badgeId: string;
  earnedAt: FirebaseFirestore.Timestamp;
}

// ---------- Badge definitions ----------

export function getAllBadges(): BadgeDefinition[] {
  return badgeDefs as BadgeDefinition[];
}

export function getBadgeById(id: string): BadgeDefinition | undefined {
  return getAllBadges().find((b) => b.id === id);
}

// ---------- Badge checking ----------

function getModuleCountForCategory(categoryId: string): number {
  const cat = (categories as Array<{ id: string; modules: unknown[] }>).find(
    (c) => c.id === categoryId
  );
  return cat?.modules.length ?? 0;
}

function getCompletedCountForCategory(
  progressKeys: string[],
  categoryId: string
): number {
  return progressKeys.filter((key) => key.startsWith(`${categoryId}--`)).length;
}

export async function checkAndAwardBadges(
  userId: string
): Promise<BadgeDefinition[]> {
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();
  if (!userDoc.exists) return [];

  const userData = userDoc.data()!;
  const existingBadges: string[] = userData.badges ?? [];

  // Get all progress keys
  const progressSnap = await db
    .collection("users")
    .doc(userId)
    .collection("progress")
    .get();
  const progressKeys = progressSnap.docs.map((d) => d.id);
  const totalCompleted = progressKeys.length;

  const newBadges: BadgeDefinition[] = [];

  for (const badge of getAllBadges()) {
    if (existingBadges.includes(badge.id)) continue;

    let earned = false;

    switch (badge.condition.type) {
      case "category_complete": {
        const { categoryId } = badge.condition;
        const total = getModuleCountForCategory(categoryId);
        const completed = getCompletedCountForCategory(progressKeys, categoryId);
        earned = total > 0 && completed >= total;
        break;
      }
      case "modules_completed":
        earned = totalCompleted >= badge.condition.count;
        break;
      case "streak":
        earned = (userData.streak ?? 0) >= badge.condition.days;
        break;
      case "xp_threshold":
        earned = (userData.xp ?? 0) >= badge.condition.xp;
        break;
    }

    if (earned) {
      newBadges.push(badge);
    }
  }

  if (newBadges.length > 0) {
    // Award badges
    const batch = db.batch();

    batch.update(userRef, {
      badges: FieldValue.arrayUnion(...newBadges.map((b) => b.id)),
    });

    for (const badge of newBadges) {
      const badgeRef = db
        .collection("users")
        .doc(userId)
        .collection("earnedBadges")
        .doc(badge.id);
      batch.set(badgeRef, {
        badgeId: badge.id,
        earnedAt: FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
  }

  return newBadges;
}

// ---------- Get user badges ----------

export async function getUserBadges(userId: string): Promise<string[]> {
  const userDoc = await db.collection("users").doc(userId).get();
  if (!userDoc.exists) return [];
  return userDoc.data()?.badges ?? [];
}
