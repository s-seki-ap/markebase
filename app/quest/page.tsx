import { getRoadmaps } from "@/lib/curriculum";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserProgress } from "@/lib/progress";
import Link from "next/link";

const isDevBypass =
  process.env.NODE_ENV !== "production" && !process.env.GOOGLE_CLIENT_ID;

export default async function QuestListPage() {
  const roadmaps = getRoadmaps();

  const session = await getServerSession(authOptions);
  const userId = isDevBypass ? "dev-user" : session?.user?.email ?? null;

  const progressMap: Record<string, boolean> = {};
  if (userId) {
    try {
      const progress = await getUserProgress(userId);
      for (const key of Object.keys(progress)) {
        progressMap[key] = true;
      }
    } catch {
      // Firestore未接続時はデフォルト値
    }
  }

  return (
    <main className="min-h-screen p-6 lg:p-8" style={{ backgroundColor: "var(--color-page)" }}>
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div
          className="flex items-center gap-2 text-sm mb-8 font-semibold"
          style={{ color: "var(--color-text-muted)" }}
        >
          <Link href="/" className="hover:scale-105 transition-all">
            ダッシュボード
          </Link>
          <span>/</span>
          <span style={{ color: "var(--color-text-heading)" }}>クエスト</span>
        </div>

        <h1
          className="text-3xl lg:text-4xl font-extrabold mb-2"
          style={{ color: "var(--color-text-heading)" }}
        >
          🗺️ クエストモード
        </h1>
        <p className="mb-8 text-base" style={{ color: "var(--color-text-muted)" }}>
          ロードマップに沿って、迷わず体系的に学ぼう。クエストを順番にクリアして認定を目指そう！
        </p>

        {/* Roadmap Cards */}
        <div className="grid gap-6">
          {roadmaps.map((rm) => {
            // Calculate progress
            let total = 0;
            let done = 0;
            for (const ch of rm.chapters) {
              for (const q of ch.quests) {
                for (const ref of q.modules) {
                  total++;
                  if (progressMap[`${ref.categoryId}--${ref.moduleId}`]) done++;
                }
              }
            }
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const totalQuests = rm.chapters.reduce((s, ch) => s + ch.quests.length, 0);

            return (
              <Link
                key={rm.id}
                href={`/quest/${rm.id}`}
                className="block p-6 clay-card transition-all hover:scale-[1.01]"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                    style={{
                      backgroundColor: `${rm.color}22`,
                      border: `2px solid ${rm.color}`,
                    }}
                  >
                    {rm.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h2
                      className="text-xl font-extrabold mb-1"
                      style={{ color: "var(--color-text-heading)" }}
                    >
                      {rm.name}
                    </h2>
                    <p
                      className="text-sm mb-3 line-clamp-2"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {rm.description}
                    </p>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
                      <span>{rm.chapters.length} チャプター</span>
                      <span>{totalQuests} クエスト</span>
                      <span>{total} モジュール</span>
                      <span>約{rm.estimatedWeeks}週間</span>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                      <div
                        className="flex-1 h-3 rounded-full overflow-hidden"
                        style={{ backgroundColor: "var(--color-border)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: "var(--color-green)",
                          }}
                        />
                      </div>
                      <span
                        className="text-sm font-bold"
                        style={{ color: pct > 0 ? "var(--color-green)" : "var(--color-text-muted)" }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <span
                    className="text-2xl flex-shrink-0 mt-4"
                    style={{ color: rm.color }}
                  >
                    →
                  </span>
                </div>

                {/* Chapter preview pills */}
                <div className="flex flex-wrap gap-2 mt-4 ml-20">
                  {rm.chapters.map((ch, i) => (
                    <span
                      key={ch.id}
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: `${ch.color}22`,
                        color: ch.color,
                      }}
                    >
                      {ch.icon} Ch.{i + 1} {ch.name}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Coming soon placeholder */}
        <div
          className="mt-6 rounded-2xl border-2 border-dashed p-6 text-center"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-card)",
          }}
        >
          <span className="text-3xl">🔮</span>
          <p
            className="text-sm font-bold mt-2"
            style={{ color: "var(--color-text-muted)" }}
          >
            今後、データアナリスト・Webディレクター向けのロードマップも追加予定
          </p>
        </div>
      </div>
    </main>
  );
}
