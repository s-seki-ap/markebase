"use client";

import { useState } from "react";
import Link from "next/link";
import type { Roadmap } from "@/types/curriculum";

interface Props {
  roadmap: Roadmap;
  progressMap: Record<string, boolean>;
  moduleNames: Record<string, string>;
  moduleMinutes: Record<string, number>;
  moduleAvailable: Record<string, boolean>;
}

function QuestNode({
  quest,
  chapterColor,
  status,
  completedCount,
  totalCount,
  isExpanded,
  onToggle,
  progressMap,
  moduleNames,
  moduleMinutes,
  moduleAvailable,
  position,
}: {
  quest: Roadmap["chapters"][0]["quests"][0];
  chapterColor: string;
  status: "locked" | "active" | "completed";
  completedCount: number;
  totalCount: number;
  isExpanded: boolean;
  onToggle: () => void;
  progressMap: Record<string, boolean>;
  moduleNames: Record<string, string>;
  moduleMinutes: Record<string, number>;
  moduleAvailable: Record<string, boolean>;
  position: "left" | "center" | "right";
}) {
  const positionClass =
    position === "left"
      ? "mr-auto ml-4 lg:ml-16"
      : position === "right"
        ? "ml-auto mr-4 lg:mr-16"
        : "mx-auto";

  return (
    <div className={`w-full max-w-md ${positionClass}`}>
      {/* Quest Node Circle */}
      <button
        onClick={onToggle}
        disabled={status === "locked"}
        className="relative flex items-center gap-4 w-full text-left transition-all group"
        style={{ opacity: status === "locked" ? 0.4 : 1 }}
      >
        {/* Circle */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl flex-shrink-0 border-4 transition-all"
          style={{
            borderColor: status === "completed" ? "var(--color-green)" : status === "active" ? chapterColor : "var(--color-border)",
            backgroundColor: status === "completed" ? "var(--color-green)" : "var(--color-card)",
            boxShadow: status === "active" ? `var(--clay-raised), 0 0 24px ${chapterColor}30` : status === "completed" ? "var(--clay-raised)" : "var(--clay-raised)",
          }}
        >
          {status === "completed" ? "✅" : status === "locked" ? "🔒" : quest.icon}
        </div>

        {/* Label */}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[15px] truncate" style={{ color: "var(--color-text-heading)" }}>
            {quest.name}
          </div>
          <div className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            {completedCount}/{totalCount} モジュール完了
            {status === "completed" && (
              <span className="ml-2 font-bold" style={{ color: "var(--color-yellow)" }}>
                +{quest.xpBonus} XP
              </span>
            )}
          </div>
          {/* Mini progress bar */}
          <div
            className="h-2 rounded-full mt-1.5 overflow-hidden"
            style={{ backgroundColor: "var(--color-border)", maxWidth: "200px" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                backgroundColor: status === "completed" ? "var(--color-green)" : chapterColor,
              }}
            />
          </div>
        </div>

        {/* Expand chevron */}
        {status !== "locked" && (
          <span
            className="text-lg transition-transform"
            style={{
              color: "var(--color-text-muted)",
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            ▼
          </span>
        )}
      </button>

      {/* Expanded Module List */}
      {isExpanded && status !== "locked" && (
        <div
          className="mt-3 ml-8 clay-card overflow-hidden"
        >
          {quest.modules.map((ref, idx) => {
            const key = `${ref.categoryId}--${ref.moduleId}`;
            const done = progressMap[key];
            const available = moduleAvailable[key];
            const name = moduleNames[key] || ref.moduleId;
            const minutes = moduleMinutes[key] || 0;

            return (
              <div
                key={key}
                className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0"
                style={{ borderColor: "var(--color-border)" }}
              >
                {/* Step number / check */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    backgroundColor: done
                      ? "var(--color-green)"
                      : "var(--color-border)",
                    color: done ? "#fff" : "var(--color-text-muted)",
                  }}
                >
                  {done ? "✓" : idx + 1}
                </div>

                {/* Module info */}
                <div className="flex-1 min-w-0">
                  {available ? (
                    <Link
                      href={`/curriculum/${ref.categoryId}/${ref.moduleId}`}
                      className="font-semibold text-sm hover:underline truncate block"
                      style={{
                        color: done ? "var(--color-text-secondary)" : "var(--color-text-heading)",
                        textDecoration: done ? "line-through" : "none",
                      }}
                    >
                      {name}
                    </Link>
                  ) : (
                    <span
                      className="font-semibold text-sm truncate block"
                      style={{ color: "var(--color-text-disabled)" }}
                    >
                      {name}
                      <span className="text-xs ml-1">(準備中)</span>
                    </span>
                  )}
                  {minutes > 0 && (
                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      約{minutes}分
                    </span>
                  )}
                </div>

                {/* Go button */}
                {available && !done && (
                  <Link
                    href={`/curriculum/${ref.categoryId}/${ref.moduleId}`}
                    className="px-3 py-1 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
                    style={{
                      backgroundColor: chapterColor,
                      boxShadow: `0 2px 0 ${chapterColor}88`,
                    }}
                  >
                    学ぶ
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function QuestMapClient({
  roadmap,
  progressMap,
  moduleNames,
  moduleMinutes,
  moduleAvailable,
}: Props) {
  const [expandedQuest, setExpandedQuest] = useState<string | null>(null);

  // Calculate quest statuses
  type QuestStatus = { status: "locked" | "active" | "completed"; done: number; total: number };
  const questStatuses = new Map<string, QuestStatus>();
  let foundFirstIncomplete = false;

  for (const chapter of roadmap.chapters) {
    for (const quest of chapter.quests) {
      const total = quest.modules.length;
      const done = quest.modules.filter(
        (ref) => progressMap[`${ref.categoryId}--${ref.moduleId}`]
      ).length;

      let status: "locked" | "active" | "completed";
      if (done === total && total > 0) {
        status = "completed";
      } else if (!foundFirstIncomplete) {
        status = "active";
        foundFirstIncomplete = true;
      } else {
        status = "locked";
      }
      questStatuses.set(quest.id, { status, done, total });
    }
  }

  // If nothing is incomplete, unlock everything (all completed or all viewable)
  if (!foundFirstIncomplete) {
    questStatuses.forEach((qs, id) => {
      if (qs.status === "locked") {
        questStatuses.set(id, { ...qs, status: "active" });
      }
    });
  }

  // Calculate overall stats
  let totalModules = 0;
  let completedModules = 0;
  let totalXpBonus = 0;
  let earnedXpBonus = 0;

  for (const chapter of roadmap.chapters) {
    for (const quest of chapter.quests) {
      const qs = questStatuses.get(quest.id)!;
      totalModules += qs.total;
      completedModules += qs.done;
      totalXpBonus += quest.xpBonus;
      if (qs.status === "completed") earnedXpBonus += quest.xpBonus;
    }
  }

  const overallPct = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  // Zigzag pattern positions
  const positions: ("left" | "center" | "right")[] = ["center", "right", "left", "center", "right", "left"];

  return (
    <main className="min-h-screen pb-24" style={{ backgroundColor: "var(--color-page)" }}>
      {/* Hero Header */}
      <div
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${roadmap.color}22, ${roadmap.color}08)`,
        }}
      >
        <div className="max-w-2xl mx-auto px-6 pt-8 pb-6">
          {/* Breadcrumb */}
          <div
            className="flex items-center gap-2 text-sm mb-6 font-semibold"
            style={{ color: "var(--color-text-muted)" }}
          >
            <Link href="/" className="hover:scale-105 transition-all">
              ダッシュボード
            </Link>
            <span>/</span>
            <Link href="/quest" className="hover:scale-105 transition-all">
              クエスト
            </Link>
            <span>/</span>
            <span style={{ color: "var(--color-text-heading)" }}>{roadmap.name}</span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">{roadmap.icon}</span>
            <div>
              <h1
                className="text-2xl lg:text-3xl font-extrabold"
                style={{ color: "var(--color-text-heading)" }}
              >
                {roadmap.name}
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                {roadmap.description}
              </p>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="flex items-center gap-4">
            <div
              className="flex-1 h-4 rounded-full overflow-hidden"
              style={{ backgroundColor: "var(--color-border)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${overallPct}%`,
                  backgroundColor: "var(--color-green)",
                }}
              />
            </div>
            <span className="text-sm font-bold" style={{ color: "var(--color-green)" }}>
              {overallPct}%
            </span>
          </div>

          {/* Stats row */}
          <div className="flex gap-6 mt-4 text-sm">
            <div>
              <span className="font-bold" style={{ color: "var(--color-text-heading)" }}>
                {completedModules}
              </span>
              <span style={{ color: "var(--color-text-muted)" }}> / {totalModules} モジュール</span>
            </div>
            <div>
              <span className="font-bold" style={{ color: "var(--color-yellow)" }}>
                {earnedXpBonus}
              </span>
              <span style={{ color: "var(--color-text-muted)" }}> / {totalXpBonus} ボーナスXP</span>
            </div>
            <div>
              <span style={{ color: "var(--color-text-muted)" }}>
                約{roadmap.estimatedWeeks}週間
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quest Map */}
      <div className="max-w-2xl mx-auto px-6 pt-8">
        {roadmap.chapters.map((chapter, chapterIdx) => {
          // Check if all quests in chapter are completed
          const chapterComplete = chapter.quests.every(
            (q) => questStatuses.get(q.id)?.status === "completed"
          );
          // Check if any quest is active
          const chapterActive = chapter.quests.some(
            (q) => questStatuses.get(q.id)?.status === "active"
          );
          const chapterLocked = !chapterComplete && !chapterActive;

          return (
            <div key={chapter.id} className="mb-12">
              {/* Chapter header */}
              <div
                className="flex items-center gap-3 mb-6"
                style={{ opacity: chapterLocked ? 0.4 : 1 }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{
                    backgroundColor: chapterComplete ? "var(--color-green)" : `${chapter.color}22`,
                    border: `2px solid ${chapterComplete ? "var(--color-green)" : chapter.color}`,
                  }}
                >
                  {chapterComplete ? "✅" : chapter.icon}
                </div>
                <div>
                  <h2
                    className="text-lg font-extrabold"
                    style={{ color: "var(--color-text-heading)" }}
                  >
                    Chapter {chapterIdx + 1}: {chapter.name}
                  </h2>
                  <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    {chapter.description}
                  </p>
                </div>
              </div>

              {/* Quest nodes with connecting path */}
              <div className="relative">
                {chapter.quests.map((quest, questIdx) => {
                  const qs = questStatuses.get(quest.id)!;
                  const pos = positions[(chapterIdx * 3 + questIdx) % positions.length];

                  return (
                    <div key={quest.id} className="relative">
                      {/* Connecting dotted line */}
                      {questIdx > 0 && (
                        <div className="flex justify-center my-2">
                          <div
                            className="w-0.5 h-8"
                            style={{
                              background: `repeating-linear-gradient(to bottom, ${chapter.color}44 0, ${chapter.color}44 4px, transparent 4px, transparent 8px)`,
                            }}
                          />
                        </div>
                      )}

                      <QuestNode
                        quest={quest}
                        chapterColor={chapter.color}
                        status={qs.status}
                        completedCount={qs.done}
                        totalCount={qs.total}
                        isExpanded={expandedQuest === quest.id}
                        onToggle={() =>
                          setExpandedQuest(expandedQuest === quest.id ? null : quest.id)
                        }
                        progressMap={progressMap}
                        moduleNames={moduleNames}
                        moduleMinutes={moduleMinutes}
                        moduleAvailable={moduleAvailable}
                        position={pos}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Chapter divider */}
              {chapterIdx < roadmap.chapters.length - 1 && (
                <div className="flex justify-center my-8">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl border-2"
                    style={{
                      borderColor: chapterComplete ? "var(--color-green)" : "var(--color-border)",
                      backgroundColor: "var(--color-card)",
                      color: chapterComplete
                        ? "var(--color-green)"
                        : "var(--color-text-disabled)",
                    }}
                  >
                    {chapterComplete ? "⬇️" : "🔒"}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Final goal */}
        <div className="text-center pb-12">
          <div
            className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl border-2"
            style={{
              borderColor: overallPct === 100 ? "var(--color-yellow)" : "var(--color-border)",
              backgroundColor: overallPct === 100 ? "var(--color-yellow)" + "22" : "var(--color-card)",
            }}
          >
            <span className="text-3xl">{overallPct === 100 ? "👑" : "🏁"}</span>
            <div className="text-left">
              <div
                className="font-extrabold"
                style={{
                  color: overallPct === 100 ? "var(--color-yellow)" : "var(--color-text-heading)",
                }}
              >
                {overallPct === 100 ? "ロードマップ完走！" : "MOコンサルタント認定"}
              </div>
              <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                {overallPct === 100
                  ? "おめでとうございます！全クエストをクリアしました"
                  : "全クエストをクリアして認定を獲得しよう"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
