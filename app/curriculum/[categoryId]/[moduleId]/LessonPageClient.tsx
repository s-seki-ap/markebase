"use client";

import { useState, useCallback, type ComponentPropsWithoutRef } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Category } from "@/types/curriculum";
import QuizSection from "@/components/QuizSection";
import ExerciseSection from "@/components/ExerciseSection";
import WorksheetSection from "@/components/WorksheetSection";
import InteractiveSection from "@/components/InteractiveSection";
import DiagramSection from "@/components/DiagramSection";

// コードエディタ不要のカテゴリ（ワークシート形式で表示）
const WORKSHEET_CATEGORIES = new Set([
  "advertising",
  "marketing-strategy",
  "project-management",
]);
import dynamic from "next/dynamic";
import AIChatPanel from "@/components/AIChatPanel";
import ModuleFeedback from "@/components/ModuleFeedback";
import SlideContent from "@/components/SlideContent";
import ThemeToggle from "@/components/ThemeToggle";

const SQLSandbox = dynamic(() => import("@/components/SQLSandbox"), { ssr: false });

interface LessonPageClientProps {
  category: Category;
  moduleId: string;
  lessonData: {
    title: string;
    sections: Array<{
      type: "intro" | "concept" | "exercise" | "interactive" | "sql_exercise" | "quiz" | "summary";
      data: Record<string, unknown>;
    }>;
  };
  completedSections?: Set<string>;
}

const SECTION_LABELS: Record<string, string> = {
  intro: "イントロ",
  concept: "概念理解",
  exercise: "演習",
  sql_exercise: "SQL演習",
  interactive: "体験",
  quiz: "クイズ",
  summary: "まとめ",
};

const SECTION_ICONS: Record<string, string> = {
  intro: "👋",
  concept: "💡",
  exercise: "✏️",
  sql_exercise: "🗃️",
  interactive: "🎮",
  quiz: "🧠",
  summary: "✅",
};

export default function LessonPageClient({
  category,
  moduleId,
  lessonData,
}: LessonPageClientProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [visitedSections, setVisitedSections] = useState<Set<number>>(new Set([0]));
  const [earnedXP, setEarnedXP] = useState(0);
  const [completedQuizSections, setCompletedQuizSections] = useState<Set<number>>(new Set());
  const sections = lessonData.sections;
  const currentSection = sections[currentSectionIndex];
  const currentModule = category.modules.find((m) => m.id === moduleId);
  const currentModuleIndex = category.modules.findIndex((m) => m.id === moduleId);
  const nextModule = currentModuleIndex >= 0 && currentModuleIndex < category.modules.length - 1
    ? category.modules[currentModuleIndex + 1]
    : null;

  const markSectionVisited = useCallback((index: number) => {
    setVisitedSections((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  const isQuizGated = currentSection.type === "quiz" && !completedQuizSections.has(currentSectionIndex);

  const goNext = () => {
    if (isQuizGated) return;
    if (currentSectionIndex < sections.length - 1) {
      markSectionVisited(currentSectionIndex);
      const nextIndex = currentSectionIndex + 1;
      setCurrentSectionIndex(nextIndex);

      // summaryセクションに到達 → モジュール完了を記録
      if (sections[nextIndex].type === "summary") {
        fetch("/api/progress/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categoryId: category.id, moduleId }),
        }).catch(() => {});
      }
    }
  };

  const goPrev = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const handleQuizComplete = useCallback((xp: number) => {
    setEarnedXP((prev) => prev + xp);
    setCompletedQuizSections((prev) => {
      const next = new Set(prev);
      next.add(currentSectionIndex);
      return next;
    });
  }, [currentSectionIndex]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--color-page)" }}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ backgroundColor: "var(--color-overlay)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`flex flex-col shrink-0 overflow-y-auto z-30 transition-transform duration-200
          fixed lg:relative inset-y-0 left-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{
          width: "270px",
          backgroundColor: "var(--color-page)",
          borderRight: "2px solid var(--color-border)",
        }}
      >
        {/* Logo */}
        <div className="p-4 border-b-2" style={{ borderColor: "var(--color-border)" }}>
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold"
              style={{ backgroundColor: "var(--color-green)", color: "#ffffff", boxShadow: "0 3px 0 var(--color-green-shadow)" }}
            >
              M
            </div>
            <span className="font-extrabold text-sm" style={{ color: "var(--color-text-heading)" }}>MarkeBase</span>
          </Link>
        </div>

        {/* Category & module info */}
        <div className="p-4 border-b-2" style={{ borderColor: "var(--color-border)" }}>
          <Link
            href={`/curriculum/${category.id}`}
            className="flex items-center gap-2 text-xs font-bold mb-3 transition-all hover:scale-105"
            style={{ color: "var(--color-text-muted)" }}
          >
            ← {category.icon} {category.name}
          </Link>
          <p className="text-sm font-bold" style={{ color: "var(--color-text-heading)" }}>{currentModule?.name ?? lessonData.title}</p>
          {currentModule && (
            <p className="text-xs mt-1 font-semibold" style={{ color: "var(--color-text-disabled)" }}>{currentModule.estimatedMinutes}分</p>
          )}
        </div>

        {/* Section progress bar */}
        <div className="px-4 pt-3">
          <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-border)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                backgroundColor: "var(--color-green)",
                width: `${((currentSectionIndex + 1) / sections.length) * 100}%`,
              }}
            />
          </div>
          <p className="text-xs mt-1 text-right font-bold" style={{ color: "var(--color-text-disabled)" }}>
            {currentSectionIndex + 1}/{sections.length}
          </p>
        </div>

        {/* Section list */}
        <nav className="p-3 flex-1">
          <p className="text-xs font-bold px-2 mb-2 uppercase tracking-wide" style={{ color: "var(--color-text-disabled)" }}>
            セクション
          </p>
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => { setCurrentSectionIndex(index); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-all duration-200 mb-1 hover:scale-[1.02]"
              style={{
                backgroundColor:
                  currentSectionIndex === index ? "var(--color-card)" : "transparent",
                color:
                  currentSectionIndex === index ? "var(--color-text-heading)" : "var(--color-text-muted)",
                boxShadow: currentSectionIndex === index ? "var(--color-card-shadow)" : "none",
              }}
            >
              <span
                className="text-base w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: visitedSections.has(index) && currentSectionIndex !== index ? "var(--color-green-bg)" : "transparent",
                }}
              >
                {visitedSections.has(index) && currentSectionIndex !== index ? (
                  <span style={{ color: "var(--color-green)" }}>✓</span>
                ) : (
                  SECTION_ICONS[section.type]
                )}
              </span>
              <span className="text-sm font-semibold">{SECTION_LABELS[section.type]}</span>
              {currentSectionIndex === index && (
                <span className="ml-auto w-2 h-2 rounded-full animate-pulse-glow" style={{ backgroundColor: "var(--color-green)" }} />
              )}
            </button>
          ))}
        </nav>

        {/* Theme toggle + AI button */}
        <div className="p-4 border-t-2 flex flex-col gap-2" style={{ borderColor: "var(--color-border)" }}>
          <ThemeToggle />
          <button
            onClick={() => setShowAIPanel(true)}
            className="btn-3d btn-3d-purple w-full py-2.5 text-sm"
          >
            🤖 AIに質問する
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header
          className="flex items-center justify-between px-4 lg:px-6 py-3 shrink-0 border-b-2"
          style={{ backgroundColor: "var(--color-page)", borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center gap-3">
            {/* Hamburger (mobile only) */}
            <button
              className="lg:hidden p-1.5 rounded-xl transition-all hover:scale-110"
              style={{ color: "var(--color-text-muted)" }}
              onClick={() => setSidebarOpen(true)}
              aria-label="メニューを開く"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--color-text-disabled)" }}>
              <Link href="/" className="hover:underline" style={{ color: "var(--color-text-muted)" }}>ダッシュボード</Link>
              <span>/</span>
              <Link href="/curriculum" className="hover:underline" style={{ color: "var(--color-text-muted)" }}>カリキュラム</Link>
              <span>/</span>
              <Link href={`/curriculum/${category.id}`} className="hover:underline" style={{ color: "var(--color-text-muted)" }}>{category.name}</Link>
              <span>/</span>
              <span style={{ color: "var(--color-text-heading)" }}>{currentModule?.name}</span>
            </div>
            <span className="text-sm sm:hidden font-semibold" style={{ color: "var(--color-text-disabled)" }}>
              {currentModule?.name ?? lessonData.title}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {earnedXP > 0 && (
              <span
                className="text-sm font-extrabold px-3 py-1 rounded-full animate-bounce-in"
                style={{ backgroundColor: "var(--color-yellow-bg)", color: "var(--color-yellow)", border: "2px solid var(--color-yellow)" }}
              >
                ⭐ +{earnedXP} XP
              </span>
            )}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold"
              style={{ backgroundColor: "var(--color-green)", color: "#ffffff" }}
            >
              U
            </div>
          </div>
        </header>

        {/* Section content */}
        <div className="flex-1 overflow-hidden">
          {currentSection.type === "sql_exercise" ? (
            <SQLSandbox
              sampleData={(currentSection.data as { sampleData: { tableName: string; columns: string[]; rows: (string | number | null)[][] }[] }).sampleData}
              initialSQL={(currentSection.data as { initialSQL?: string }).initialSQL}
              onNext={goNext}
            />
          ) : currentSection.type === "exercise" && WORKSHEET_CATEGORIES.has(category.id) ? (
            <WorksheetSection
              data={currentSection.data as { content: string; starterCode: string; hints: string[]; answer: string }}
              onNext={goNext}
              onAIClick={() => setShowAIPanel(true)}
            />
          ) : currentSection.type === "exercise" ? (
            <ExerciseSection
              data={currentSection.data as { content: string; starterCode: string; hints: string[]; answer: string }}
              categoryId={category.id}
              onNext={goNext}
              onAIClick={() => setShowAIPanel(true)}
            />
          ) : currentSection.type === "interactive" ? (
            <InteractiveSection
              data={currentSection.data as { content: string; htmlContent: string; checkpoints: string[] }}
              onNext={goNext}
              onAIClick={() => setShowAIPanel(true)}
            />
          ) : currentSection.type === "quiz" ? (
            <QuizSection
              data={currentSection.data as { questions: Array<{ q: string; options: string[]; correct: number; explanation: string }> }}
              onNext={goNext}
              categoryId={category.id}
              moduleId={moduleId}
              onQuizComplete={handleQuizComplete}
            />
          ) : (
            <ContentSection
              section={currentSection}
              onNext={goNext}
              onPrev={goPrev}
              isFirst={currentSectionIndex === 0}
              isLast={currentSectionIndex === sections.length - 1}
              categoryId={category.id}
              moduleId={moduleId}
              nextModuleHref={nextModule ? `/curriculum/${category.id}/${nextModule.id}` : null}
              nextModuleName={nextModule?.name ?? null}
              categoryPageHref={`/curriculum/${category.id}`}
            />
          )}
        </div>
      </div>

      {/* AI Panel */}
      {showAIPanel && (
        <AIChatPanel
          onClose={() => setShowAIPanel(false)}
          lessonTitle={currentModule?.name ?? lessonData.title}
          lessonContent={
            currentSection.data.content
              ? String(currentSection.data.content)
              : undefined
          }
        />
      )}
    </div>
  );
}

// Annotation type for ContentSection sidebar
interface AnnotationItem {
  term: string;
  desc: string;
}

// Content section (intro / concept / summary)
function ContentSection({
  section,
  onNext,
  onPrev,
  isFirst,
  isLast,
  categoryId,
  moduleId,
  nextModuleHref,
  nextModuleName,
  categoryPageHref,
}: {
  section: { type: string; data: Record<string, unknown> };
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  categoryId: string;
  moduleId: string;
  nextModuleHref: string | null;
  nextModuleName: string | null;
  categoryPageHref: string;
}) {
  const [showAnnotations, setShowAnnotations] = useState(false);
  const isSummary = section.type === "summary";
  const isSlideSection = section.type === "intro" || section.type === "concept";
  const annotations = section.data.annotations as AnnotationItem[] | undefined;
  const hasAnnotations = Array.isArray(annotations) && annotations.length > 0;

  // intro / concept はスライド形式で表示
  if (isSlideSection && !hasAnnotations) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-hidden">
          <SlideContent content={section.data.content as string} />
        </div>

        {/* Section navigation (前へ / 次へ) */}
        <div
          className="flex justify-between items-center px-8 py-4 border-t-2 shrink-0"
          style={{ borderColor: "var(--color-border)" }}
        >
          <button
            onClick={onPrev}
            disabled={isFirst}
            className="px-4 py-2 rounded-2xl text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105"
            style={{ color: "var(--color-text-muted)" }}
          >
            ← 前のセクション
          </button>
          <button
            onClick={onNext}
            disabled={isLast}
            className="btn-3d btn-3d-blue px-6 py-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            次のセクション →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[740px] mx-auto px-6 lg:px-10 py-10 lg:py-12">
          <MarkdownContent content={section.data.content as string} />
          {Boolean(section.data.diagram) && (
            <div className="mt-8">
              <DiagramSection type={section.type} categoryId={categoryId} />
            </div>
          )}
          {isSummary && <ModuleFeedback categoryId={categoryId} moduleId={moduleId} />}

          {/* Next module navigation (summary only) */}
          {isSummary && (
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {nextModuleHref ? (
                <Link
                  href={nextModuleHref}
                  className="btn-3d btn-3d-green inline-flex items-center justify-center gap-2 px-6 py-3 text-sm"
                >
                  次のモジュールへ: {nextModuleName} 🚀
                </Link>
              ) : (
                <Link
                  href={categoryPageHref}
                  className="btn-3d btn-3d-green inline-flex items-center justify-center gap-2 px-6 py-3 text-sm"
                >
                  カテゴリ一覧に戻る 🏠
                </Link>
              )}
            </div>
          )}

          {/* Collapsible annotation panel */}
          {hasAnnotations && (
            <div className="mt-8">
              <button
                onClick={() => setShowAnnotations(!showAnnotations)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all hover:scale-[1.02]"
                style={{ backgroundColor: "var(--color-blue-bg)", color: "var(--color-blue)", border: "2px solid var(--color-blue)" }}
              >
                📖 用語解説 {showAnnotations ? "を閉じる ▲" : `を見る (${annotations.length}件) ▼`}
              </button>
              {showAnnotations && (
                <div className="mt-4 space-y-3 animate-bounce-in">
                  {annotations.map((a, i) => (
                    <div
                      key={i}
                      className="rounded-2xl p-4 border-l-4"
                      style={{
                        backgroundColor: "var(--color-card)",
                        borderLeftColor: "var(--color-blue)",
                        boxShadow: "var(--color-card-shadow)",
                      }}
                    >
                      <p className="font-extrabold text-sm mb-1" style={{ color: "var(--color-text-heading)" }}>{a.term}</p>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                        {a.desc}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div
        className="flex justify-between items-center px-8 py-4 border-t-2 shrink-0"
        style={{ borderColor: "var(--color-border)" }}
      >
        <button
          onClick={onPrev}
          disabled={isFirst}
          className="px-4 py-2 rounded-2xl text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105"
          style={{ color: "var(--color-text-muted)" }}
        >
          ← 前へ
        </button>
        <button
          onClick={onNext}
          disabled={isLast}
          className="btn-3d btn-3d-blue px-6 py-2 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          次へ →
        </button>
      </div>
    </div>
  );
}

// react-markdown + remark-gfm based renderer
const markdownComponents = {
  h1: ({ children, ...props }: ComponentPropsWithoutRef<"h1">) => (
    <h1 className="text-2xl lg:text-3xl font-extrabold mt-2 mb-6 leading-tight" style={{ color: "var(--color-text-heading)" }} {...props}>{children}</h1>
  ),
  h2: ({ children, ...props }: ComponentPropsWithoutRef<"h2">) => (
    <h2 className="text-xl font-bold mt-10 mb-4 leading-snug" style={{ color: "var(--color-text-heading)" }} {...props}>{children}</h2>
  ),
  h3: ({ children, ...props }: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="text-lg font-bold mt-8 mb-3 leading-snug" style={{ color: "var(--color-text-primary)" }} {...props}>{children}</h3>
  ),
  p: ({ children, ...props }: ComponentPropsWithoutRef<"p">) => (
    <p className="text-[15px] leading-[1.9] mb-4" style={{ color: "var(--color-text-secondary)" }} {...props}>{children}</p>
  ),
  ul: ({ children, ...props }: ComponentPropsWithoutRef<"ul">) => (
    <ul className="list-disc ml-5 space-y-2 mb-4" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }: ComponentPropsWithoutRef<"ol">) => (
    <ol className="list-decimal ml-5 space-y-2 mb-4" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }: ComponentPropsWithoutRef<"li">) => (
    <li className="text-[15px] leading-[1.8] pl-1" style={{ color: "var(--color-text-secondary)" }} {...props}>{children}</li>
  ),
  blockquote: ({ children, ...props }: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="border-l-4 pl-5 py-3 my-5 rounded-r-xl text-[15px] leading-[1.8]"
      style={{ borderColor: "var(--color-blue)", backgroundColor: "var(--color-blue-bg)", color: "var(--color-text-secondary)" }}
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ className, children, ...props }: ComponentPropsWithoutRef<"code">) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className={`${className ?? ""} text-sm leading-relaxed`} {...props}>{children}</code>
      );
    }
    return (
      <code
        className="px-1.5 py-0.5 rounded-lg text-[13px] font-mono"
        style={{ backgroundColor: "var(--color-card)", color: "#93c5fd" }}
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="rounded-2xl p-5 text-sm font-mono overflow-x-auto my-6 leading-relaxed"
      style={{ backgroundColor: "var(--color-page)", color: "var(--color-text-primary)", border: "2px solid var(--color-border)" }}
      {...props}
    >
      {children}
    </pre>
  ),
  table: ({ children, ...props }: ComponentPropsWithoutRef<"table">) => (
    <div className="overflow-x-auto my-6 rounded-2xl" style={{ border: "2px solid var(--color-border)" }}>
      <table className="w-full text-[14px] border-collapse" {...props}>{children}</table>
    </div>
  ),
  thead: ({ children, ...props }: ComponentPropsWithoutRef<"thead">) => (
    <thead style={{ backgroundColor: "var(--color-card)" }} {...props}>{children}</thead>
  ),
  th: ({ children, ...props }: ComponentPropsWithoutRef<"th">) => (
    <th className="text-left font-bold px-4 py-3 border-b-2" style={{ color: "var(--color-text-heading)", borderColor: "var(--color-border)" }} {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: ComponentPropsWithoutRef<"td">) => (
    <td className="px-4 py-3 border-b-2" style={{ color: "var(--color-text-secondary)", borderColor: "var(--color-border)" }} {...props}>
      {children}
    </td>
  ),
  a: ({ children, href, ...props }: ComponentPropsWithoutRef<"a">) => (
    <a
      href={href}
      className="underline underline-offset-2 font-bold"
      style={{ color: "#93c5fd" }}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  strong: ({ children, ...props }: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-bold" style={{ color: "var(--color-text-heading)" }} {...props}>{children}</strong>
  ),
  hr: ({ ...props }: ComponentPropsWithoutRef<"hr">) => (
    <hr className="my-8 border-t-2" style={{ borderColor: "var(--color-border)" }} {...props} />
  ),
};

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="space-y-1 text-[15px]">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
