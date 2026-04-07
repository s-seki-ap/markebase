"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        style={{
          width: 40,
          height: 40,
          borderRadius: 16,
          backgroundColor: "var(--color-card)",
          border: "2px solid var(--color-border)",
        }}
        aria-label="テーマ切替"
      />
    );
  }

  const cycleTheme = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("system");
    else setTheme("dark");
  };

  const icon = theme === "dark" ? "🌙" : theme === "light" ? "☀️" : "💻";
  const label =
    theme === "dark" ? "ダーク" : theme === "light" ? "ライト" : "システム";

  return (
    <button
      onClick={cycleTheme}
      title={`テーマ: ${label}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 14px",
        borderRadius: 16,
        backgroundColor: "var(--color-card)",
        border: "2px solid var(--color-border)",
        color: "var(--color-text-secondary)",
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
