import { readFileSync, readdirSync } from "fs";
import path from "path";
import type { Category, Roadmap } from "@/types/curriculum";

const dataDir = path.join(process.cwd(), "data");

export function getCategories(): Category[] {
  const filePath = path.join(dataDir, "categories.json");
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as Category[];
}

export function getCategoryById(id: string): Category | undefined {
  const categories = getCategories();
  return categories.find((c) => c.id === id);
}

export function getLessonData(categoryId: string, moduleId: string): object | null {
  const filename = `${categoryId}--${moduleId}.json`;
  const filePath = path.join(dataDir, "lessons", filename);
  try {
    const raw = readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isModuleAvailable(categoryId: string, moduleId: string): boolean {
  return getLessonData(categoryId, moduleId) !== null;
}

// ---------- Roadmap ----------

export function getRoadmaps(): Roadmap[] {
  const roadmapDir = path.join(dataDir, "roadmaps");
  try {
    const files = readdirSync(roadmapDir).filter((f) => f.endsWith(".json"));
    return files.map((f) => {
      const raw = readFileSync(path.join(roadmapDir, f), "utf-8");
      return JSON.parse(raw) as Roadmap;
    });
  } catch {
    return [];
  }
}

export function getRoadmapById(id: string): Roadmap | null {
  const filePath = path.join(dataDir, "roadmaps", `${id}.json`);
  try {
    const raw = readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as Roadmap;
  } catch {
    return null;
  }
}
