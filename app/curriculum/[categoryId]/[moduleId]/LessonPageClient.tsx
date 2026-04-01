"use client";

import { useState, useCallback, type ComponentPropsWithoutRef } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Category } from "@/types/curriculum";
import QuizSection from "@/components/QuizSection";
import ExerciseSection from "@/components/ExerciseSection";
import InteractiveSection from "@/components/InteractiveSection";
import DiagramSection from "@/components/DiagramSection";
import AIChatPanel from "@/components/AIChatPanel";
import ModuleFeedback from "@/components/ModuleFeedback";

interface LessonPageClientProps {
  category: Category;
  moduleId: string;
  lessonData: {
    title: string;
    sections: Array<{
      type: "intro" | "concept" | "exercise" | "interactive" | "quiz" | "summary";
      data: Record<string, unknown>;
    }>;
  };
  completedSections?: Set<string>;
}

const SECTION_LABELS: Record<string, string> = {
  intro: "イントロ",
  concept: "概念理解",
  exercise: "演習",
  interactive: "体験",
  quiz: "クイズ",
  summary: "まとめ",
};

const SECTION_ICONS: Record<string, string> = {
  intro: "👋",
  concept: "💡",
  exercise: "✏️",
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
  const sections = lessonData.sections;
  const currentSection = sections[currentSectionIndex];
  const currentModule = category.modules.find((m) => m.id === moduleId);

  const markSectionVisited = useCallback((index: number) => {
    setVisitedSections((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  const goNext = () => {
    if (currentSectionIndex < sections.length - 1) {
      const nextIndex = currentSectionIndex + 1;
      setCurrentSectionIndex(nextIndex);
      markSectionVisited(nextIndex);

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
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#0f172a" }}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`flex flex-col shrink-0 overflow-y-auto z-30 transition-transform duration-200
          fixed lg:relative inset-y-0 left-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{
          width: "260px",
          backgroundColor: "#0f172a",
          borderRight: "1px solid #1e293b",
        }}
      >
        {/* Logo */}
        <div className="p-4 border-b" style={{ borderColor: "#1e293b" }}>
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: "#3b82f6" }}
            >
              M
            </div>
            <span className="text-white font-semibold text-sm">MarkeBase</span>
          </Link>
        </div>

        {/* Category & module info */}
        <div className="p-4 border-b" style={{ borderColor: "#1e293b" }}>
          <Link
            href={`/curriculum/${category.id}`}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs mb-3"
          >
            ← {category.icon} {category.name}
          </Link>
          <p className="text-white text-sm font-medium">{currentModule?.name ?? lessonData.title}</p>
          {currentModule && (
            <p className="text-slate-500 text-xs mt-1">{currentModule.estimatedMinutes}分</p>
          )}
        </div>

        {/* Section list */}
        <nav className="p-3 flex-1">
          <p className="text-slate-500 text-xs font-medium px-2 mb-2 uppercase tracking-wide">
            セクション
          </p>
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => { setCurrentSectionIndex(index); markSectionVisited(index); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors mb-1"
              style={{
                backgroundColor:
                  currentSectionIndex === index ? "#1e293b" : "transparent",
                color:
                  currentSectionIndex === index ? "#ffffff" : "#94a3b8",
              }}
            >
              <span className="text-base w-5 text-center">
                {visitedSections.has(index) && currentSectionIndex !== index ? (
                  <span style={{ color: "#10b981" }}>&#10003;</span>
                ) : (
                  SECTION_ICONS[section.type]
                )}
              </span>
              <span className="text-sm">{SECTION_LABELS[section.type]}</span>
              {currentSectionIndex === index && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
              )}
            </button>
          ))}
        </nav>

        {/* AI button */}
        <div className="p-4 border-t" style={{ borderColor: "#1e293b" }}>
          <button
            onClick={() => setShowAIPanel(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: "#8b5cf622", color: "#8b5cf6" }}
          >
            🤖 AIに質問する
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header
          className="flex items-center justify-between px-4 lg:px-6 py-3 shrink-0 border-b"
          style={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }}
        >
          <div className="flex items-center gap-3">
            {/* Hamburger (mobile only) */}
            <button
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="メニューを開く"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-slate-500 text-sm hidden sm:block">
              {category.name} / {currentModule?.name}
            </span>
            <span className="text-slate-500 text-sm sm:hidden">
              {currentModule?.name ?? lessonData.title}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium" style={{ color: "#fbbf24" }}>
              {earnedXP > 0 ? `+${earnedXP} XP` : ""}
            </span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: "#3b82f6" }}
            >
              U
            </div>
          </div>
        </header>

        {/* Section content */}
        <div className="flex-1 overflow-hidden">
          {currentSection.type === "exercise" ? (
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
}: {
  section: { type: string; data: Record<string, unknown> };
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  categoryId: string;
  moduleId: string;
}) {
  const isSummary = section.type === "summary";
  const annotations = section.data.annotations as AnnotationItem[] | undefined;
  const hasAnnotations = Array.isArray(annotations) && annotations.length > 0;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {hasAnnotations ? (
          /* 2-column layout: main content (65%) + annotation sidebar (35%) */
          <div className="flex flex-col lg:flex-row min-h-full">
            {/* Main content */}
            <div className="flex-1 min-w-0 px-6 lg:px-10 py-10 lg:py-12 lg:max-w-none">
              <MarkdownContent content={section.data.content as string} />
              {Boolean(section.data.diagram) && (
                <div className="mt-8">
                  <DiagramSection type={section.type} categoryId={categoryId} />
                </div>
              )}
              {isSummary && <ModuleFeedback categoryId={categoryId} moduleId={moduleId} />}
            </div>
            {/* Annotation sidebar */}
            <aside
              className="shrink-0 w-full lg:w-[35%] px-6 py-10 border-t lg:border-t-0 lg:border-l"
              style={{ borderColor: "#1e293b" }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: "#06b6d4" }}
              >
                用語解説
              </p>
              <div className="space-y-3">
                {annotations.map((a, i) => (
                  <div
                    key={i}
                    className="rounded-lg p-4 border-l-4"
                    style={{
                      backgroundColor: "#1e293b",
                      borderLeftColor: "#06b6d4",
                    }}
                  >
                    <p className="font-bold text-white text-sm mb-1">{a.term}</p>
                    <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                      {a.desc}
                    </p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        ) : (
          /* 1-column fallback (original layout) */
          <div className="max-w-[740px] mx-auto px-6 lg:px-10 py-10 lg:py-12">
            <MarkdownContent content={section.data.content as string} />
            {Boolean(section.data.diagram) && (
              <div className="mt-8">
                <DiagramSection type={section.type} categoryId={categoryId} />
              </div>
            )}
            {isSummary && <ModuleFeedback categoryId={categoryId} moduleId={moduleId} />}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div
        className="flex justify-between items-center px-8 py-4 border-t shrink-0"
        style={{ borderColor: "#1e293b" }}
      >
        <button
          onClick={onPrev}
          disabled={isFirst}
          className="px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: "#94a3b8" }}
        >
          ← 前へ
        </button>
        <button
          onClick={onNext}
          disabled={isLast}
          className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#3b82f6", color: "white" }}
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
    <h1 className="text-2xl lg:text-3xl font-bold text-white mt-2 mb-6 leading-tight" {...props}>{children}</h1>
  ),
  h2: ({ children, ...props }: ComponentPropsWithoutRef<"h2">) => (
    <h2 className="text-xl font-semibold text-white mt-10 mb-4 leading-snug" {...props}>{children}</h2>
  ),
  h3: ({ children, ...props }: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3 leading-snug" {...props}>{children}</h3>
  ),
  p: ({ children, ...props }: ComponentPropsWithoutRef<"p">) => (
    <p className="text-slate-300 text-[15px] leading-[1.9] mb-4" {...props}>{children}</p>
  ),
  ul: ({ children, ...props }: ComponentPropsWithoutRef<"ul">) => (
    <ul className="list-disc ml-5 space-y-2 mb-4" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }: ComponentPropsWithoutRef<"ol">) => (
    <ol className="list-decimal ml-5 space-y-2 mb-4" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }: ComponentPropsWithoutRef<"li">) => (
    <li className="text-slate-300 text-[15px] leading-[1.8] pl-1" {...props}>{children}</li>
  ),
  blockquote: ({ children, ...props }: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="border-l-4 pl-5 py-3 my-5 rounded-r-lg text-[15px] leading-[1.8]"
      style={{ borderColor: "#3b82f6", backgroundColor: "#1e293b80", color: "#cbd5e1" }}
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
        className="px-1.5 py-0.5 rounded text-[13px] font-mono"
        style={{ backgroundColor: "#1e293b", color: "#93c5fd" }}
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="rounded-xl p-5 text-sm font-mono overflow-x-auto my-6 leading-relaxed"
      style={{ backgroundColor: "#0f172a", color: "#e2e8f0", border: "1px solid #334155" }}
      {...props}
    >
      {children}
    </pre>
  ),
  table: ({ children, ...props }: ComponentPropsWithoutRef<"table">) => (
    <div className="overflow-x-auto my-6 rounded-lg" style={{ border: "1px solid #334155" }}>
      <table className="w-full text-[14px] border-collapse" {...props}>{children}</table>
    </div>
  ),
  thead: ({ children, ...props }: ComponentPropsWithoutRef<"thead">) => (
    <thead style={{ backgroundColor: "#1e293b" }} {...props}>{children}</thead>
  ),
  th: ({ children, ...props }: ComponentPropsWithoutRef<"th">) => (
    <th className="text-left text-white font-semibold px-4 py-3 border-b" style={{ borderColor: "#334155" }} {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: ComponentPropsWithoutRef<"td">) => (
    <td className="text-slate-300 px-4 py-3 border-b" style={{ borderColor: "#334155" }} {...props}>
      {children}
    </td>
  ),
  a: ({ children, href, ...props }: ComponentPropsWithoutRef<"a">) => (
    <a
      href={href}
      className="underline underline-offset-2"
      style={{ color: "#93c5fd" }}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  strong: ({ children, ...props }: ComponentPropsWithoutRef<"strong">) => (
    <strong className="text-white font-semibold" {...props}>{children}</strong>
  ),
  hr: ({ ...props }: ComponentPropsWithoutRef<"hr">) => (
    <hr className="my-8 border-t" style={{ borderColor: "#334155" }} {...props} />
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
