// types/curriculum.ts
export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface Module {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  lessons: Lesson[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  modules: Module[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  type: "intro" | "concept" | "exercise" | "interactive" | "quiz" | "summary";
  title: string;
}

export interface Annotation {
  term: string;
  desc: string;
}

export interface IntroSection {
  content: string;
  diagram?: boolean;
  annotations?: Annotation[];
}

export interface ConceptSection {
  content: string;
  diagram?: boolean;
  annotations?: Annotation[];
}

export interface SummarySection {
  content: string;
  diagram?: boolean;
  annotations?: Annotation[];
}

export interface ExerciseSection {
  content: string;
  starterCode: string;
  hints: string[];
  answer: string;
}

export interface InteractiveSection {
  content: string;
  htmlContent: string;
  checkpoints: string[];
}

// 選択式クイズ
export interface MultipleChoiceQuestion {
  type?: "multiple_choice";
  q: string;
  options: [string, string, string, string];
  correct: number;
  explanation: string;
}

// 穴埋めクイズ
export interface FillInBlankQuestion {
  type: "fill_in_blank";
  q: string;
  blanks: string[]; // 正答リスト（どれか一致でOK）
  explanation: string;
}

// SQL実行クイズ
export interface SQLQuestion {
  type: "sql";
  q: string;
  sampleData: {
    tableName: string;
    columns: string[];
    rows: (string | number | null)[][];
  }[];
  expectedColumns: string[];
  expectedRows: (string | number | null)[][];
  explanation: string;
}

export type QuizQuestion = MultipleChoiceQuestion | FillInBlankQuestion | SQLQuestion;

export interface QuizSection {
  questions: QuizQuestion[];
}

export interface SQLExerciseSection {
  content: string;
  sampleData: {
    tableName: string;
    columns: string[];
    rows: (string | number | null)[][];
  }[];
  initialSQL?: string;
}

export type LessonSection =
  | { type: "intro"; data: IntroSection }
  | { type: "concept"; data: ConceptSection }
  | { type: "exercise"; data: ExerciseSection }
  | { type: "interactive"; data: InteractiveSection }
  | { type: "sql_exercise"; data: SQLExerciseSection }
  | { type: "quiz"; data: QuizSection }
  | { type: "summary"; data: SummarySection };

export interface LessonData {
  id: string;
  moduleId: string;
  title: string;
  type: Lesson["type"];
  section: LessonSection;
}

// ---------- Roadmap / Quest ----------

export interface RoadmapModuleRef {
  categoryId: string;
  moduleId: string;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpBonus: number;
  modules: RoadmapModuleRef[];
}

export interface Chapter {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  quests: Quest[];
}

export interface Roadmap {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  estimatedWeeks: number;
  recommendedFor: string[];
  chapters: Chapter[];
}
