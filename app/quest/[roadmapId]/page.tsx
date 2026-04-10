import { getRoadmapById, getCategories, isModuleAvailable } from "@/lib/curriculum";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserProgress } from "@/lib/progress";
import { notFound } from "next/navigation";
import QuestMapClient from "./QuestMapClient";

const isDevBypass =
  process.env.NODE_ENV !== "production" && !process.env.GOOGLE_CLIENT_ID;

export default async function QuestMapPage({
  params,
}: {
  params: { roadmapId: string };
}) {
  const roadmap = getRoadmapById(params.roadmapId);
  if (!roadmap) notFound();

  const session = await getServerSession(authOptions);
  const userId = isDevBypass ? "dev-user" : session?.user?.email ?? null;

  // Get user progress
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

  // Build module name lookup from categories
  const categories = getCategories();
  const moduleNames: Record<string, string> = {};
  const moduleMinutes: Record<string, number> = {};
  for (const cat of categories) {
    for (const mod of cat.modules) {
      const key = `${cat.id}--${mod.id}`;
      moduleNames[key] = mod.name;
      moduleMinutes[key] = mod.estimatedMinutes;
    }
  }

  // Check which modules have lesson data
  const moduleAvailable: Record<string, boolean> = {};
  for (const chapter of roadmap.chapters) {
    for (const quest of chapter.quests) {
      for (const ref of quest.modules) {
        const key = `${ref.categoryId}--${ref.moduleId}`;
        moduleAvailable[key] = isModuleAvailable(ref.categoryId, ref.moduleId);
      }
    }
  }

  return (
    <QuestMapClient
      roadmap={roadmap}
      progressMap={progressMap}
      moduleNames={moduleNames}
      moduleMinutes={moduleMinutes}
      moduleAvailable={moduleAvailable}
    />
  );
}
