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

export interface QuizQuestion {
  q: string;
  options: [string, string, string, string];
  correct: number;
  explanation: string;
}

export interface QuizSection {
  questions: QuizQuestion[];
}

export type LessonSection =
  | { type: "intro"; data: IntroSection }
  | { type: "concept"; data: ConceptSection }
  | { type: "exercise"; data: ExerciseSection }
  | { type: "interactive"; data: InteractiveSection }
  | { type: "quiz"; data: QuizSection }
  | { type: "summary"; data: SummarySection };

export interface LessonData {
  id: string;
  moduleId: string;
  title: string;
  type: Lesson["type"];
  section: LessonSection;
}
