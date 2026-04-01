"use client";

import { useState, type ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SlideContentProps {
  content: string;
}

// Markdownをh2区切りでスライドに分割する
function splitIntoSlides(content: string): string[] {
  const lines = content.split("\n");
  const slides: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## ") && current.length > 0) {
      slides.push(current.join("\n").trim());
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) {
    slides.push(current.join("\n").trim());
  }

  return slides.filter((s) => s.length > 0);
}

// スライド専用のMarkdownコンポーネント（大きめフォント）
const slideMarkdownComponents = {
  h1: ({ children, ...props }: ComponentPropsWithoutRef<"h1">) => (
    <h1
      className="text-2xl lg:text-3xl font-bold text-white mb-6 leading-tight"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: ComponentPropsWithoutRef<"h2">) => (
    <h2
      className="text-xl lg:text-2xl font-bold text-white mb-5 leading-snug"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: ComponentPropsWithoutRef<"h3">) => (
    <h3
      className="text-lg font-semibold text-slate-100 mt-6 mb-3 leading-snug"
      {...props}
    >
      {children}
    </h3>
  ),
  p: ({ children, ...props }: ComponentPropsWithoutRef<"p">) => (
    <p
      className="text-slate-300 text-base leading-[1.9] mb-4"
      {...props}
    >
      {children}
    </p>
  ),
  ul: ({ children, ...props }: ComponentPropsWithoutRef<"ul">) => (
    <ul className="list-disc ml-5 space-y-2.5 mb-5" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: ComponentPropsWithoutRef<"ol">) => (
    <ol className="list-decimal ml-5 space-y-2.5 mb-5" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: ComponentPropsWithoutRef<"li">) => (
    <li className="text-slate-300 text-base leading-[1.8] pl-1" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="border-l-4 pl-5 py-3 my-5 rounded-r-lg text-base leading-[1.8]"
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
        <code className={`${className ?? ""} text-sm leading-relaxed`} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="px-1.5 py-0.5 rounded text-sm font-mono"
        style={{ backgroundColor: "#1e293b", color: "#93c5fd" }}
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="rounded-xl p-5 text-sm font-mono overflow-x-auto my-5 leading-relaxed"
      style={{ backgroundColor: "#0f172a", color: "#e2e8f0", border: "1px solid #334155" }}
      {...props}
    >
      {children}
    </pre>
  ),
  table: ({ children, ...props }: ComponentPropsWithoutRef<"table">) => (
    <div className="overflow-x-auto my-5 rounded-lg" style={{ border: "1px solid #334155" }}>
      <table className="w-full text-sm border-collapse" {...props}>{children}</table>
    </div>
  ),
  thead: ({ children, ...props }: ComponentPropsWithoutRef<"thead">) => (
    <thead style={{ backgroundColor: "#1e293b" }} {...props}>{children}</thead>
  ),
  th: ({ children, ...props }: ComponentPropsWithoutRef<"th">) => (
    <th
      className="text-left text-white font-semibold px-4 py-3 border-b"
      style={{ borderColor: "#334155" }}
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: ComponentPropsWithoutRef<"td">) => (
    <td
      className="text-slate-300 px-4 py-3 border-b"
      style={{ borderColor: "#334155" }}
      {...props}
    >
      {children}
    </td>
  ),
  strong: ({ children, ...props }: ComponentPropsWithoutRef<"strong">) => (
    <strong className="text-white font-semibold" {...props}>{children}</strong>
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
  hr: ({ ...props }: ComponentPropsWithoutRef<"hr">) => (
    <hr className="my-6 border-t" style={{ borderColor: "#334155" }} {...props} />
  ),
};

export default function SlideContent({ content }: SlideContentProps) {
  const slides = splitIntoSlides(content);
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = slides.length;

  // 1枚しかない場合はスライドUIを出さずそのまま表示
  if (totalSlides <= 1) {
    return (
      <div className="max-w-[760px] mx-auto">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={slideMarkdownComponents}>
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  const goNextSlide = () => {
    if (currentSlide < totalSlides - 1) setCurrentSlide(currentSlide + 1);
  };
  const goPrevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Slide content */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-8 lg:py-10">
        <div className="max-w-[760px] mx-auto">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={slideMarkdownComponents}>
            {slides[currentSlide]}
          </ReactMarkdown>
        </div>
      </div>

      {/* Slide navigation */}
      <div
        className="flex items-center justify-between px-6 lg:px-10 py-3 border-t shrink-0"
        style={{ borderColor: "#1e293b" }}
      >
        {/* Prev */}
        <button
          onClick={goPrevSlide}
          disabled={currentSlide === 0}
          className="px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          style={{ color: "#94a3b8" }}
        >
          ← 前へ
        </button>

        {/* Slide indicators */}
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className="transition-all"
              style={{
                width: i === currentSlide ? "24px" : "8px",
                height: "8px",
                borderRadius: "4px",
                backgroundColor: i === currentSlide ? "#3b82f6" : i < currentSlide ? "#10b981" : "#334155",
              }}
              aria-label={`スライド ${i + 1}`}
            />
          ))}
          <span className="text-slate-500 text-xs ml-2">
            {currentSlide + 1}/{totalSlides}
          </span>
        </div>

        {/* Next */}
        <button
          onClick={goNextSlide}
          disabled={currentSlide === totalSlides - 1}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          style={{ backgroundColor: currentSlide === totalSlides - 1 ? "transparent" : "#3b82f6", color: "white" }}
        >
          次へ →
        </button>
      </div>
    </div>
  );
}
