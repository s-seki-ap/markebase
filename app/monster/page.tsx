import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUser, getUserProgress } from "@/lib/progress";
import { getCategories } from "@/lib/curriculum";
import {
  ATTRIBUTE_META,
  LEVEL_THRESHOLDS,
  getSpeciesName,
  aggregateXpByAttribute,
  stageForLevel,
  type MonsterStage,
} from "@/lib/monster";
import MonsterClient from "./MonsterClient";

const isDevBypass =
  process.env.NODE_ENV !== "production" && !process.env.GOOGLE_CLIENT_ID;

function getUserId(session: { user?: { email?: string | null } } | null): string | null {
  if (isDevBypass) return "dev-user";
  return session?.user?.email ?? null;
}

function nextStageThreshold(stage: MonsterStage): { nextStage: MonsterStage | null; level: number | null } {
  if (stage === "egg") return { nextStage: "baby", level: LEVEL_THRESHOLDS.baby };
  if (stage === "baby") return { nextStage: "teen", level: LEVEL_THRESHOLDS.teen };
  if (stage === "teen") return { nextStage: "adult", level: LEVEL_THRESHOLDS.adult };
  return { nextStage: null, level: null };
}

const STAGE_LABEL: Record<MonsterStage, string> = {
  egg: "たまご",
  baby: "幼体",
  teen: "成長期",
  adult: "完全体",
};

export default async function MonsterPage() {
  const session = await getServerSession(authOptions);
  if (!session && !isDevBypass) redirect("/auth/signin");
  const userId = getUserId(session);
  if (!userId) redirect("/auth/signin");

  const user = await getUser(userId);
  if (!user) redirect("/onboarding");

  const progress = await getUserProgress(userId);
  const xpByAttribute = aggregateXpByAttribute(progress);
  const totalXpInAttributes = Object.values(xpByAttribute).reduce((s, v) => s + v, 0);

  const stage: MonsterStage = user.monsterStage ?? stageForLevel(user.level);
  const primary = user.monsterPrimary ?? null;
  const secondary = user.monsterSecondary ?? null;
  const speciesName = getSpeciesName(stage, primary);
  const nickname = user.monsterName ?? speciesName;

  const { nextStage, level: nextStageLevel } = nextStageThreshold(stage);

  // 覚えた技（クイズ満点モジュール）
  const QUIZ_TOTAL = 3;
  const categories = getCategories();
  const moduleNameMap = new Map<string, { catName: string; modName: string; catColor: string; catIcon: string }>();
  for (const cat of categories) {
    for (const mod of cat.modules) {
      moduleNameMap.set(`${cat.id}--${mod.id}`, {
        catName: cat.name,
        modName: mod.name,
        catColor: cat.color,
        catIcon: cat.icon,
      });
    }
  }
  const skills = Object.entries(progress)
    .filter(([, p]) => (p.quizScore ?? 0) >= QUIZ_TOTAL)
    .map(([key]) => ({ key, ...moduleNameMap.get(key) }))
    .filter((s) => s.modName);

  return (
    <main
      className="min-h-screen p-6 lg:p-8 pb-24 lg:pb-8"
      style={{ backgroundColor: "var(--color-page)" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div
          className="flex items-center gap-2 text-sm mb-6 font-semibold"
          style={{ color: "var(--color-text-muted)" }}
        >
          <Link href="/" className="hover:scale-105 transition-all">
            &larr; ホーム
          </Link>
          <span>/</span>
          <span style={{ color: "var(--color-text-heading)" }}>相棒</span>
        </div>

        <MonsterClient
          initial={{
            name: nickname,
            stage,
            primary,
            secondary,
            imageUrl: user.monsterImageUrl ?? null,
            generating: user.monsterImageGenerating ?? false,
            level: user.level,
            xp: user.xp,
          }}
          speciesName={speciesName}
          stageLabel={STAGE_LABEL[stage]}
          nextStage={nextStage ? STAGE_LABEL[nextStage] : null}
          nextStageLevel={nextStageLevel}
        />

        {/* カテゴリ別XP（属性別） */}
        <section className="clay-card p-5 lg:p-6 mt-6">
          <h2
            className="text-lg font-extrabold mb-4"
            style={{ color: "var(--color-text-heading)" }}
          >
            🧬 属性別の経験値
          </h2>
          <div className="space-y-3">
            {(["earth", "arcana", "oracle", "tactics"] as const).map((attr) => {
              const meta = ATTRIBUTE_META[attr];
              const value = xpByAttribute[attr];
              const pct =
                totalXpInAttributes > 0 ? (value / totalXpInAttributes) * 100 : 0;
              const isPrimary = primary === attr;
              const isSecondary = secondary === attr;
              return (
                <div key={attr}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="text-sm font-bold flex items-center gap-2"
                      style={{ color: meta.color }}
                    >
                      <span>{meta.icon}</span>
                      <span>{meta.label}</span>
                      {isPrimary && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-extrabold"
                          style={{
                            backgroundColor: `${meta.color}22`,
                            color: meta.color,
                            border: `1px solid ${meta.color}`,
                          }}
                        >
                          主
                        </span>
                      )}
                      {isSecondary && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-extrabold"
                          style={{
                            backgroundColor: `${meta.color}22`,
                            color: meta.color,
                            border: `1px solid ${meta.color}`,
                          }}
                        >
                          副
                        </span>
                      )}
                    </span>
                    <span
                      className="text-xs font-extrabold"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {value.toLocaleString()} XP
                    </span>
                  </div>
                  <div
                    className="h-2.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: "var(--color-border)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: meta.color,
                        width: `${Math.min(pct, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p
            className="text-xs mt-3 font-semibold"
            style={{ color: "var(--color-text-disabled)" }}
          >
            進化の瞬間に偏りが多い属性が主属性・次点が副属性になります
          </p>
        </section>

        {/* 覚えた技 */}
        <section className="clay-card p-5 lg:p-6 mt-6">
          <h2
            className="text-lg font-extrabold mb-1"
            style={{ color: "var(--color-text-heading)" }}
          >
            🎯 覚えた技
          </h2>
          <p
            className="text-xs mb-4 font-semibold"
            style={{ color: "var(--color-text-muted)" }}
          >
            クイズ全問正解したモジュールが技として身についています
          </p>
          {skills.length === 0 ? (
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--color-text-disabled)" }}
            >
              まだ技を覚えていません。クイズを全問正解すると技を覚えます。
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {skills.map((s) => (
                <div
                  key={s.key}
                  className="p-3 rounded-xl flex items-center gap-2"
                  style={{
                    backgroundColor: `${s.catColor}11`,
                    border: `1.5px solid ${s.catColor}55`,
                  }}
                >
                  <span className="text-lg shrink-0">{s.catIcon}</span>
                  <div className="min-w-0">
                    <p
                      className="text-[10px] font-bold"
                      style={{ color: s.catColor }}
                    >
                      {s.catName}
                    </p>
                    <p
                      className="text-xs font-extrabold truncate"
                      style={{ color: "var(--color-text-heading)" }}
                    >
                      {s.modName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
