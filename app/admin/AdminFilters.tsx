"use client";

import Link from "next/link";
import { useState } from "react";
import type { LeaderboardEntry } from "@/lib/progress";

interface Props {
  leaderboard: LeaderboardEntry[];
  departments: string[];
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function AdminFilters({ leaderboard, departments }: Props) {
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"xp" | "completed" | "lastActive">("xp");

  let filtered = leaderboard;
  if (deptFilter !== "all") {
    filtered = filtered.filter((e) => e.department === deptFilter);
  }

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "xp") return b.xp - a.xp;
    if (sortBy === "completed") return b.completedCount - a.completedCount;
    return new Date(b.lastActiveDate).getTime() - new Date(a.lastActiveDate).getTime();
  });

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-lg font-extrabold" style={{ color: "var(--color-text-heading)" }}>
          メンバー一覧
        </h2>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="text-sm px-3 py-1.5 rounded-lg border font-semibold"
          style={{
            backgroundColor: "var(--color-card)",
            borderColor: "var(--color-border)",
            color: "var(--color-text-heading)",
          }}
        >
          <option value="all">全部門</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "xp" | "completed" | "lastActive")}
          className="text-sm px-3 py-1.5 rounded-lg border font-semibold"
          style={{
            backgroundColor: "var(--color-card)",
            borderColor: "var(--color-border)",
            color: "var(--color-text-heading)",
          }}
        >
          <option value="xp">XP順</option>
          <option value="completed">完了数順</option>
          <option value="lastActive">最終学習日順</option>
        </select>
        <span className="text-xs font-semibold ml-auto" style={{ color: "var(--color-text-disabled)" }}>
          {sorted.length}名表示
        </span>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--color-card)", boxShadow: "var(--color-card-shadow)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "var(--color-page)" }}>
              <th className="text-left font-bold px-6 py-4" style={{ color: "var(--color-text-muted)" }}>#</th>
              <th className="text-left font-bold px-6 py-4" style={{ color: "var(--color-text-muted)" }}>名前</th>
              <th className="text-left font-bold px-6 py-4" style={{ color: "var(--color-text-muted)" }}>部門</th>
              <th className="text-right font-bold px-6 py-4" style={{ color: "var(--color-text-muted)" }}>完了</th>
              <th className="text-right font-bold px-6 py-4" style={{ color: "var(--color-text-muted)" }}>XP</th>
              <th className="text-right font-bold px-6 py-4" style={{ color: "var(--color-text-muted)" }}>レベル</th>
              <th className="text-right font-bold px-6 py-4" style={{ color: "var(--color-text-muted)" }}>最終学習日</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 font-semibold" style={{ color: "var(--color-text-disabled)" }}>
                  該当するメンバーがいません
                </td>
              </tr>
            ) : (
              sorted.map((entry, i) => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                const isInactive = new Date(entry.lastActiveDate) < weekAgo;

                return (
                  <tr
                    key={entry.userId}
                    className="border-t-2"
                    style={{ borderColor: "var(--color-border)", opacity: isInactive ? 0.6 : 1 }}
                  >
                    <td className="px-6 py-4 font-extrabold" style={{
                      color: i === 0 ? "var(--color-yellow)" : i === 1 ? "var(--color-blue)" : i === 2 ? "var(--color-orange)" : "var(--color-text-disabled)",
                    }}>{i + 1}</td>
                    <td className="px-6 py-4 font-bold" style={{ color: "var(--color-text-heading)" }}>
                      <Link
                        href={`/admin/member/${encodeURIComponent(entry.userId)}`}
                        className="hover:underline transition-all hover:opacity-80"
                        style={{ color: "var(--color-text-heading)" }}
                      >
                        {entry.name}
                      </Link>
                      {isInactive && <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(251,191,36,0.15)", color: "var(--color-yellow)" }}>休止中</span>}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--color-text-muted)" }}>{entry.department ?? "-"}</td>
                    <td className="px-6 py-4 text-right font-bold" style={{ color: "var(--color-text-heading)" }}>{entry.completedCount}</td>
                    <td className="px-6 py-4 text-right font-extrabold" style={{ color: "var(--color-yellow)" }}>{entry.xp.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-bold" style={{ color: "var(--color-green)" }}>Lv.{entry.level}</td>
                    <td className="px-6 py-4 text-right" style={{ color: isInactive ? "var(--color-yellow)" : "var(--color-text-muted)" }}>
                      {formatDate(entry.lastActiveDate)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
