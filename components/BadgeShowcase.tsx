"use client";

import { getAllBadges, type BadgeDefinition } from "@/lib/badges-client";

interface Props {
  earnedBadgeIds: string[];
}

const tierColors: Record<string, { bg: string; border: string; text: string }> = {
  bronze: { bg: "rgba(205,127,50,0.12)", border: "#CD7F32", text: "#CD7F32" },
  silver: { bg: "rgba(192,192,192,0.12)", border: "#C0C0C0", text: "#A0A0A0" },
  gold: { bg: "rgba(255,215,0,0.12)", border: "#FFD700", text: "#DAA520" },
  platinum: { bg: "rgba(139,92,246,0.12)", border: "#8B5CF6", text: "#8B5CF6" },
};

export default function BadgeShowcase({ earnedBadgeIds }: Props) {
  const allBadges = getAllBadges();
  const earned = allBadges.filter((b) => earnedBadgeIds.includes(b.id));
  const locked = allBadges.filter((b) => !earnedBadgeIds.includes(b.id));

  if (allBadges.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-extrabold mb-4" style={{ color: "var(--color-text-heading)" }}>
        バッジ ({earned.length}/{allBadges.length})
      </h2>

      {earned.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-3 mb-4">
          {earned.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} earned />
          ))}
        </div>
      )}

      {locked.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-3">
          {locked.slice(0, 12).map((badge) => (
            <BadgeCard key={badge.id} badge={badge} earned={false} />
          ))}
          {locked.length > 12 && (
            <div className="flex items-center justify-center rounded-2xl p-3" style={{ backgroundColor: "var(--color-card)" }}>
              <span className="text-xs font-bold" style={{ color: "var(--color-text-disabled)" }}>
                +{locked.length - 12}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BadgeCard({ badge, earned }: { badge: BadgeDefinition; earned: boolean }) {
  const tier = tierColors[badge.tier] ?? tierColors.bronze;

  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl p-3 text-center transition-all"
      style={{
        backgroundColor: earned ? tier.bg : "var(--color-card)",
        border: earned ? `2px solid ${tier.border}` : "2px solid transparent",
        opacity: earned ? 1 : 0.4,
        boxShadow: earned ? "var(--color-card-shadow)" : "none",
      }}
      title={badge.description}
    >
      <span className="text-2xl mb-1">{badge.icon}</span>
      <span className="text-[10px] font-bold leading-tight" style={{ color: earned ? tier.text : "var(--color-text-disabled)" }}>
        {badge.name}
      </span>
    </div>
  );
}
