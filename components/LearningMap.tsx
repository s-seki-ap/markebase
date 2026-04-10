import type { Category } from "@/types/curriculum";

interface ModuleProgressInfo {
  completed: boolean;
  quizScore: number | null;
  completedAt?: Date;
}

interface Props {
  categories: Category[];
  progressMap: Record<string, ModuleProgressInfo>;
  availableMap: Record<string, boolean>;
}

function nodeStyle(
  info: ModuleProgressInfo | undefined,
  available: boolean,
  categoryColor: string
) {
  if (!available) {
    return {
      background: "var(--color-card-alt)",
      border: "2px dashed var(--color-border)",
      color: "var(--color-text-disabled)",
    };
  }
  if (info?.completed) {
    return {
      background: `linear-gradient(145deg, ${categoryColor}, ${categoryColor}dd)`,
      border: `2px solid ${categoryColor}`,
      color: "#ffffff",
      boxShadow: `0 4px 0 ${categoryColor}66`,
    };
  }
  return {
    background: "var(--color-card)",
    border: "2px solid var(--color-border)",
    color: "var(--color-text-muted)",
  };
}

function quizBadge(score: number | null) {
  if (score === null) return null;
  if (score >= 80) return { label: `${score}点`, color: "var(--color-green)", bg: "var(--color-green-bg)" };
  if (score >= 60) return { label: `${score}点`, color: "var(--color-yellow)", bg: "var(--color-yellow-bg)" };
  return { label: `${score}点`, color: "var(--color-red)", bg: "var(--color-red-bg)" };
}

export default function LearningMap({ categories, progressMap, availableMap }: Props) {
  return (
    <div className="space-y-6">
      {categories.map((cat) => {
        const availableModules = cat.modules.filter((m) => availableMap[`${cat.id}--${m.id}`]);
        if (availableModules.length === 0 && cat.modules.length === 0) return null;

        const completedCount = cat.modules.filter(
          (m) => progressMap[`${cat.id}--${m.id}`]?.completed
        ).length;
        const availCount = availableModules.length;
        const pct = availCount > 0 ? Math.round((completedCount / availCount) * 100) : 0;

        return (
          <div
            key={cat.id}
            className="p-5 rounded-2xl"
            style={{
              backgroundColor: "var(--color-card)",
              boxShadow: "var(--color-card-shadow)",
              borderLeft: `6px solid ${cat.color}`,
            }}
          >
            {/* Category header */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0"
                  style={{ backgroundColor: `${cat.color}22`, border: `2px solid ${cat.color}` }}
                >
                  {cat.icon}
                </div>
                <div>
                  <h3 className="text-base font-extrabold" style={{ color: "var(--color-text-heading)" }}>
                    {cat.name}
                  </h3>
                  <p className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>
                    {completedCount}/{availCount} 完了 ({pct}%)
                  </p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-32 h-2 rounded-full" style={{ backgroundColor: "var(--color-border)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ backgroundColor: cat.color, width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Module path (subway-map style) */}
            <div className="relative flex flex-wrap gap-x-2 gap-y-4 items-start">
              {cat.modules.map((mod, idx) => {
                const key = `${cat.id}--${mod.id}`;
                const info = progressMap[key];
                const available = availableMap[key] ?? false;
                const style = nodeStyle(info, available, cat.color);
                const badge = info?.completed ? quizBadge(info.quizScore) : null;
                const completedDate = info?.completedAt
                  ? `${info.completedAt.getMonth() + 1}/${info.completedAt.getDate()}`
                  : null;

                return (
                  <div key={mod.id} className="flex items-center">
                    {/* Connector (except first) */}
                    {idx > 0 && (
                      <div
                        className="w-3 h-1 rounded-full mx-1"
                        style={{
                          backgroundColor: info?.completed && progressMap[`${cat.id}--${cat.modules[idx - 1].id}`]?.completed
                            ? cat.color
                            : "var(--color-border)",
                        }}
                      />
                    )}
                    {/* Node */}
                    <div className="flex flex-col items-center gap-1" title={mod.name}>
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-extrabold transition-all"
                        style={style}
                      >
                        {info?.completed ? "✓" : String(idx + 1).padStart(2, "0")}
                      </div>
                      {badge && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap"
                          style={{ backgroundColor: badge.bg, color: badge.color }}
                        >
                          {badge.label}
                        </span>
                      )}
                      {completedDate && !badge && (
                        <span className="text-[10px] font-semibold" style={{ color: "var(--color-text-disabled)" }}>
                          {completedDate}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
