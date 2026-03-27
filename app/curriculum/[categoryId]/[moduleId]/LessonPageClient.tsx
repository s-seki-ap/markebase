"use client";

import { useState } from "react";
import Link from "next/link";
import type { Category } from "@/types/curriculum";
import QuizSection from "@/components/QuizSection";
import ExerciseSection from "@/components/ExerciseSection";
import InteractiveSection from "@/components/InteractiveSection";
import DiagramSection from "@/components/DiagramSection";
import AIChatPanel from "@/components/AIChatPanel";

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
  const sections = lessonData.sections;
  const currentSection = sections[currentSectionIndex];
  const currentModule = category.modules.find((m) => m.id === moduleId);

  const goNext = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

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
              onClick={() => setCurrentSectionIndex(index)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors mb-1"
              style={{
                backgroundColor:
                  currentSectionIndex === index ? "#1e293b" : "transparent",
                color:
                  currentSectionIndex === index ? "#ffffff" : "#94a3b8",
              }}
            >
              <span className="text-base w-5 text-center">
                {SECTION_ICONS[section.type]}
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
              ⭐ 0 XP
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
            />
          ) : (
            <ContentSection
              section={currentSection}
              onNext={goNext}
              onPrev={goPrev}
              isFirst={currentSectionIndex === 0}
              isLast={currentSectionIndex === sections.length - 1}
              categoryId={category.id}
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
}: {
  section: { type: string; data: Record<string, unknown> };
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  categoryId: string;
}) {
  const annotations = section.data.annotations as AnnotationItem[] | undefined;
  const hasAnnotations = Array.isArray(annotations) && annotations.length > 0;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {hasAnnotations ? (
          /* 2-column layout: main content (65%) + annotation sidebar (35%) */
          <div className="flex flex-col lg:flex-row min-h-full">
            {/* Main content */}
            <div className="flex-1 min-w-0 px-8 py-10 lg:max-w-none">
              <MarkdownContent content={section.data.content as string} />
              {Boolean(section.data.diagram) && (
                <div className="mt-8">
                  <DiagramSection type={section.type} categoryId={categoryId} />
                </div>
              )}
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
          <div className="max-w-[680px] mx-auto px-8 py-10">
            <MarkdownContent content={section.data.content as string} />
            {Boolean(section.data.diagram) && (
              <div className="mt-8">
                <DiagramSection type={section.type} categoryId={categoryId} />
              </div>
            )}
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

// Simple markdown-like renderer
function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");

  // Extract code blocks first to avoid double rendering
  const codeBlockNodes = renderCodeBlocks(content);

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (line.startsWith("# ")) {
          return (
            <h1 key={i} className="text-2xl font-bold text-white mt-2 mb-4">
              {line.slice(2)}
            </h1>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h2 key={i} className="text-lg font-semibold text-white mt-6 mb-2">
              {line.slice(3)}
            </h2>
          );
        }
        if (line.startsWith("### ")) {
          return (
            <h3 key={i} className="text-base font-semibold text-slate-200 mt-4 mb-1">
              {line.slice(4)}
            </h3>
          );
        }
        if (line.startsWith("```")) {
          return null;
        }
        if (line.startsWith("> ")) {
          return (
            <blockquote
              key={i}
              className="border-l-4 pl-4 py-1 text-slate-400 text-sm italic"
              style={{ borderColor: "#3b82f6" }}
            >
              {line.slice(2)}
            </blockquote>
          );
        }
        if (line.startsWith("| ")) {
          return null;
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <li key={i} className="text-slate-300 text-sm ml-4 list-disc">
              <InlineMarkdown text={line.slice(2)} />
            </li>
          );
        }
        if (line.startsWith("✅") || line.startsWith("💡") || line.startsWith("**")) {
          return (
            <p key={i} className="text-slate-300 text-sm leading-relaxed">
              <InlineMarkdown text={line} />
            </p>
          );
        }
        if (line.trim() === "") {
          return <div key={i} className="h-2" />;
        }
        return (
          <p key={i} className="text-slate-300 text-sm leading-relaxed">
            <InlineMarkdown text={line} />
          </p>
        );
      })}
      {/* Code blocks */}
      {codeBlockNodes}
    </div>
  );
}

function renderCodeBlocks(content: string): React.ReactNode[] {
  const blocks: React.ReactNode[] = [];
  const parts = content.split(/```(\w*)\n([\s\S]*?)```/g);

  for (let i = 1; i < parts.length; i += 3) {
    const code = parts[i + 1];
    blocks.push(
      <pre
        key={i}
        className="rounded-xl p-4 text-xs font-mono overflow-x-auto"
        style={{ backgroundColor: "#0f172a", color: "#e2e8f0", border: "1px solid #334155" }}
      >
        <code>{code}</code>
      </pre>
    );
  }
  return blocks;
}

function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} className="px-1 rounded text-xs font-mono" style={{ backgroundColor: "#1e293b", color: "#93c5fd" }}>
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
