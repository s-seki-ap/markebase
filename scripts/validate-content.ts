#!/usr/bin/env npx tsx
/**
 * コンテンツ検証スクリプト
 * 全レッスンJSONのスキーマ検証・整合性チェックを実行する。
 *
 * Usage: npx tsx scripts/validate-content.ts
 */

import { readFileSync, readdirSync } from "fs";
import path from "path";

const dataDir = path.join(__dirname, "..", "data");
const lessonsDir = path.join(dataDir, "lessons");

interface ValidationError {
  file: string;
  message: string;
  severity: "error" | "warning";
}

const errors: ValidationError[] = [];

function addError(file: string, message: string, severity: "error" | "warning" = "error") {
  errors.push({ file, message, severity });
}

// ---------- 1. Load categories ----------
const categoriesPath = path.join(dataDir, "categories.json");
const categories = JSON.parse(readFileSync(categoriesPath, "utf-8")) as Array<{
  id: string;
  name: string;
  modules: Array<{
    id: string;
    categoryId: string;
    name: string;
    difficulty: string;
    estimatedMinutes: number;
  }>;
}>;

const allModuleKeys = new Set<string>();
for (const cat of categories) {
  for (const mod of cat.modules) {
    allModuleKeys.add(`${cat.id}--${mod.id}`);
    // Validate module fields
    if (!mod.name) addError("categories.json", `Module ${cat.id}/${mod.id} has no name`);
    if (!["beginner", "intermediate", "advanced"].includes(mod.difficulty)) {
      addError("categories.json", `Module ${cat.id}/${mod.id} has invalid difficulty: ${mod.difficulty}`);
    }
    if (!mod.estimatedMinutes || mod.estimatedMinutes <= 0) {
      addError("categories.json", `Module ${cat.id}/${mod.id} has invalid estimatedMinutes`, "warning");
    }
  }
}

// ---------- 2. Validate lesson JSON files ----------
const VALID_SECTION_TYPES = new Set(["intro", "concept", "exercise", "interactive", "sql_exercise", "quiz", "summary"]);
const VALID_QUIZ_TYPES = new Set(["multiple_choice", "fill_in_blank", "sql"]);

const lessonFiles = readdirSync(lessonsDir).filter((f) => f.endsWith(".json"));

let validCount = 0;
let missingCount = 0;
const orphanFiles: string[] = [];

for (const file of lessonFiles) {
  const filePath = path.join(lessonsDir, file);
  const moduleKey = file.replace(".json", "");

  // Check if lesson file maps to a module in categories
  if (!allModuleKeys.has(moduleKey)) {
    orphanFiles.push(file);
    addError(file, `Lesson file has no matching module in categories.json`, "warning");
  }

  let lesson: { title?: string; sections?: Array<{ type: string; data: Record<string, unknown> }> };
  try {
    lesson = JSON.parse(readFileSync(filePath, "utf-8"));
  } catch (e) {
    addError(file, `Invalid JSON: ${e instanceof Error ? e.message : String(e)}`);
    continue;
  }

  // Title
  if (!lesson.title) {
    addError(file, "Missing title field");
  }

  // Sections
  if (!Array.isArray(lesson.sections) || lesson.sections.length === 0) {
    addError(file, "Missing or empty sections array");
    continue;
  }

  for (let si = 0; si < lesson.sections.length; si++) {
    const section = lesson.sections[si];
    const sectionLabel = `section[${si}]`;

    if (!VALID_SECTION_TYPES.has(section.type)) {
      addError(file, `${sectionLabel}: Invalid section type "${section.type}"`);
      continue;
    }

    // Section-specific validation
    if (section.type === "intro" || section.type === "concept" || section.type === "summary") {
      if (!section.data.content || typeof section.data.content !== "string") {
        addError(file, `${sectionLabel} (${section.type}): Missing or non-string content`);
      }
    }

    if (section.type === "exercise") {
      if (!section.data.content) addError(file, `${sectionLabel} (exercise): Missing content`);
      if (!section.data.starterCode && section.data.starterCode !== "") {
        addError(file, `${sectionLabel} (exercise): Missing starterCode`, "warning");
      }
      if (!Array.isArray(section.data.hints)) {
        addError(file, `${sectionLabel} (exercise): Missing hints array`, "warning");
      }
    }

    if (section.type === "sql_exercise") {
      if (!Array.isArray(section.data.sampleData) || (section.data.sampleData as unknown[]).length === 0) {
        addError(file, `${sectionLabel} (sql_exercise): Missing or empty sampleData`);
      }
    }

    if (section.type === "quiz") {
      const quizData = section.data as { questions?: unknown[] };
      if (!Array.isArray(quizData.questions) || quizData.questions.length === 0) {
        addError(file, `${sectionLabel} (quiz): Missing or empty questions array`);
      } else {
        for (let qi = 0; qi < quizData.questions.length; qi++) {
          const q = quizData.questions[qi] as Record<string, unknown>;
          const qLabel = `${sectionLabel}.questions[${qi}]`;
          const qType = (q.type as string) || "multiple_choice";

          if (!VALID_QUIZ_TYPES.has(qType)) {
            addError(file, `${qLabel}: Invalid quiz type "${qType}"`);
            continue;
          }

          if (!q.q && !q.question) addError(file, `${qLabel}: Missing question text (q or question)`);
          if (!q.explanation) addError(file, `${qLabel}: Missing explanation`, "warning");

          if (qType === "multiple_choice") {
            if (!Array.isArray(q.options) || (q.options as unknown[]).length < 2) {
              addError(file, `${qLabel}: Options must have at least 2 choices`);
            }
            if (typeof q.correct !== "number") {
              addError(file, `${qLabel}: Missing or non-number correct index`);
            }
          }

          if (qType === "fill_in_blank") {
            if (!Array.isArray(q.blanks) || (q.blanks as unknown[]).length === 0) {
              addError(file, `${qLabel}: Missing or empty blanks array`);
            }
          }

          if (qType === "sql") {
            if (!Array.isArray(q.sampleData)) addError(file, `${qLabel}: Missing sampleData`);
            if (!Array.isArray(q.expectedColumns)) addError(file, `${qLabel}: Missing expectedColumns`);
            if (!Array.isArray(q.expectedRows)) addError(file, `${qLabel}: Missing expectedRows`);
          }
        }
      }
    }
  }

  validCount++;
}

// ---------- 3. Check for missing lesson files ----------
for (const key of Array.from(allModuleKeys)) {
  const expectedFile = `${key}.json`;
  if (!lessonFiles.includes(expectedFile)) {
    missingCount++;
  }
}

// ---------- 4. Report ----------
console.log("\n📋 MarkeBase コンテンツ検証レポート");
console.log("=".repeat(50));
console.log(`カテゴリ数: ${categories.length}`);
console.log(`モジュール定義数: ${allModuleKeys.size}`);
console.log(`レッスンJSON数: ${lessonFiles.length}`);
console.log(`検証OK: ${validCount}`);
console.log(`モジュール定義あり・JSON未作成: ${missingCount}`);
if (orphanFiles.length > 0) {
  console.log(`孤立JSON（カテゴリに紐付かない）: ${orphanFiles.length}`);
}

const errorCount = errors.filter((e) => e.severity === "error").length;
const warnCount = errors.filter((e) => e.severity === "warning").length;

if (errors.length > 0) {
  console.log(`\n❌ エラー: ${errorCount}件 / ⚠️ 警告: ${warnCount}件\n`);
  for (const err of errors) {
    const icon = err.severity === "error" ? "❌" : "⚠️";
    console.log(`  ${icon} ${err.file}: ${err.message}`);
  }
} else {
  console.log("\n✅ エラーなし！全コンテンツが正常です。");
}

console.log("");
process.exit(errorCount > 0 ? 1 : 0);
