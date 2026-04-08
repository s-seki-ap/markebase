import { getCategories, getLessonData } from "@/lib/curriculum";
import { notFound } from "next/navigation";
import LessonPageClient from "./LessonPageClient";

export default function LessonPage({
  params,
}: {
  params: { categoryId: string; moduleId: string };
}) {
  const { categoryId, moduleId } = params;

  const categories = getCategories();
  const category = categories.find((c) => c.id === categoryId);
  if (!category) notFound();

  const lessonData = getLessonData(categoryId, moduleId);
  if (!lessonData) notFound();

  const typedLessonData = lessonData as {
    title: string;
    sections: Array<{
      type: "intro" | "concept" | "exercise" | "interactive" | "sql_exercise" | "quiz" | "summary";
      data: Record<string, unknown>;
    }>;
  };

  return (
    <LessonPageClient
      category={category}
      moduleId={moduleId}
      lessonData={typedLessonData}
    />
  );
}
