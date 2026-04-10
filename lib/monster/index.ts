import { db } from "@/lib/firebase";
import { FieldValue } from "firebase-admin/firestore";
import { computeEvolution } from "./evolve";
import { generateMonsterImage } from "./generate";
import { getSpeciesName, type Attribute, type MonsterStage } from "./attributes";
import type { ModuleProgress } from "@/lib/progress";

export * from "./attributes";
export * from "./evolve";

interface MonsterUserFields {
  monsterName?: string | null;
  monsterStage?: MonsterStage | null;
  monsterPrimary?: Attribute | null;
  monsterSecondary?: Attribute | null;
  monsterImageUrl?: string | null;
  monsterImageGenerating?: boolean;
}

/**
 * XP更新後に呼び出される進化チェック。
 * 段階境界を越えたときのみ Firestore を更新し、画像生成を非同期で起動する。
 */
export async function checkAndEvolveMonster(
  userId: string,
  newLevel: number
): Promise<void> {
  const userRef = db.collection("users").doc(userId);
  const snap = await userRef.get();
  if (!snap.exists) return;
  const data = snap.data() as MonsterUserFields;

  // 現在の進捗を取得
  const progressSnap = await userRef.collection("progress").get();
  const progress: Record<string, ModuleProgress> = {};
  progressSnap.forEach((doc) => {
    progress[doc.id] = doc.data() as ModuleProgress;
  });

  const result = computeEvolution(
    data.monsterStage ?? undefined,
    data.monsterPrimary ?? undefined,
    data.monsterSecondary ?? undefined,
    newLevel,
    progress
  );

  if (!result.crossedBoundary) return;

  const { stage, primary, secondary } = result.next;

  // 未設定 or 旧種族名のままならデフォルト種族名で上書き
  const defaultSpeciesName = getSpeciesName(stage, primary);
  const shouldUpdateName =
    !data.monsterName ||
    data.monsterName === getSpeciesName(data.monsterStage ?? "egg", data.monsterPrimary ?? null);

  const update: Record<string, unknown> = {
    monsterStage: stage,
    monsterPrimary: primary,
    monsterSecondary: secondary,
    monsterImageGenerating: true,
    monsterImageUpdatedAt: FieldValue.serverTimestamp(),
  };
  if (shouldUpdateName) {
    update.monsterName = defaultSpeciesName;
  }

  await userRef.update(update);

  // 画像生成は非同期（await しない）
  void generateMonsterImageAsync(userId, stage, primary, secondary);
}

async function generateMonsterImageAsync(
  userId: string,
  stage: MonsterStage,
  primary: Attribute | null,
  secondary: Attribute | null
): Promise<void> {
  try {
    const { imageUrl } = await generateMonsterImage({
      userId,
      stage,
      primary,
      secondary,
    });
    await db.collection("users").doc(userId).update({
      monsterImageUrl: imageUrl,
      monsterImageGenerating: false,
      monsterImageGeneratedAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error(`[monster] generate failed for ${userId}:`, err);
    // 失敗時はフラグだけ下ろす（既存画像は保持）
    try {
      await db.collection("users").doc(userId).update({
        monsterImageGenerating: false,
      });
    } catch {
      // ignore
    }
  }
}

/**
 * 管理者向け：状態に関係なく画像を強制再生成する
 */
export async function regenerateMonsterImage(userId: string): Promise<void> {
  const userRef = db.collection("users").doc(userId);
  const snap = await userRef.get();
  if (!snap.exists) throw new Error("user not found");
  const data = snap.data() as MonsterUserFields;

  await userRef.update({ monsterImageGenerating: true });
  void generateMonsterImageAsync(
    userId,
    data.monsterStage ?? "egg",
    data.monsterPrimary ?? null,
    data.monsterSecondary ?? null
  );
}
