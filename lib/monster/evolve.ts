import {
  type Attribute,
  type MonsterStage,
  CATEGORY_TO_ATTRIBUTE,
  LEVEL_THRESHOLDS,
} from "./attributes";
import type { ModuleProgress } from "@/lib/progress";

const MODULE_BASE_XP = 30;
const QUIZ_POINT_XP = 10;

export interface MonsterState {
  stage: MonsterStage;
  primary: Attribute | null;
  secondary: Attribute | null;
}

function xpOfProgress(p: ModuleProgress): number {
  let xp = MODULE_BASE_XP;
  if (p.quizScore !== null && p.quizScore !== undefined) {
    xp += p.quizScore * QUIZ_POINT_XP;
  }
  return xp;
}

export function aggregateXpByAttribute(
  progress: Record<string, ModuleProgress>
): Record<Attribute, number> {
  const totals: Record<Attribute, number> = {
    earth: 0,
    arcana: 0,
    oracle: 0,
    tactics: 0,
  };

  for (const [key, p] of Object.entries(progress)) {
    const [catId] = key.split("--");
    const attr = CATEGORY_TO_ATTRIBUTE[catId];
    if (!attr) continue;
    totals[attr] += xpOfProgress(p);
  }

  return totals;
}

export function sortedAttributes(
  totals: Record<Attribute, number>
): Attribute[] {
  return (Object.keys(totals) as Attribute[]).sort(
    (a, b) => totals[b] - totals[a]
  );
}

export function stageForLevel(level: number): MonsterStage {
  if (level >= LEVEL_THRESHOLDS.adult) return "adult";
  if (level >= LEVEL_THRESHOLDS.teen) return "teen";
  if (level >= LEVEL_THRESHOLDS.baby) return "baby";
  return "egg";
}

export interface EvolveResult {
  next: MonsterState;
  evolved: boolean;
  crossedBoundary: boolean;
}

/**
 * 現在の状態と新しいレベル・進捗から次のモンスター状態を決定する。
 * 段階境界を越えたときのみ属性を再計算する（同段階内の変化は無視）。
 */
export function computeEvolution(
  currentStage: MonsterStage | undefined,
  currentPrimary: Attribute | null | undefined,
  currentSecondary: Attribute | null | undefined,
  newLevel: number,
  progress: Record<string, ModuleProgress>
): EvolveResult {
  const prevStage: MonsterStage = currentStage ?? "egg";
  const nextStage = stageForLevel(newLevel);
  const crossedBoundary = nextStage !== prevStage;

  if (!crossedBoundary) {
    return {
      next: {
        stage: prevStage,
        primary: currentPrimary ?? null,
        secondary: currentSecondary ?? null,
      },
      evolved: false,
      crossedBoundary: false,
    };
  }

  // 境界越え → 属性を再計算
  const totals = aggregateXpByAttribute(progress);
  const sorted = sortedAttributes(totals);

  let nextPrimary: Attribute | null = currentPrimary ?? null;
  let nextSecondary: Attribute | null = currentSecondary ?? null;

  if (nextStage === "egg") {
    nextPrimary = null;
    nextSecondary = null;
  } else if (nextStage === "baby") {
    nextPrimary = sorted[0] ?? "earth";
    nextSecondary = null;
  } else if (nextStage === "teen" || nextStage === "adult") {
    nextPrimary = sorted[0] ?? "earth";
    nextSecondary = sorted[1] ?? null;
    // primary と同じ属性がsecondaryになるのを防ぐ
    if (nextSecondary === nextPrimary) {
      nextSecondary = sorted[2] ?? null;
    }
  }

  return {
    next: {
      stage: nextStage,
      primary: nextPrimary,
      secondary: nextSecondary,
    },
    evolved: true,
    crossedBoundary: true,
  };
}
