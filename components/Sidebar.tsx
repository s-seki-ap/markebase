"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const NAV_ITEMS = [
  { href: "/", icon: "🏠", label: "ホーム" },
  { href: "/quest", icon: "🗺️", label: "クエスト" },
  { href: "/curriculum", icon: "📚", label: "学習" },
  { href: "/admin", icon: "📊", label: "チーム" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[260px] flex-col border-r-2 z-30"
      style={{
        backgroundColor: "var(--color-card)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Logo */}
      <div className="px-6 pt-8 pb-6 flex items-center gap-2.5">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-extrabold"
          style={{
            background: "linear-gradient(145deg, #5fd97e, #42b860)",
            color: "#ffffff",
            boxShadow: "var(--clay-raised)",
          }}
        >
          M
        </div>
        <span
          className="text-xl font-extrabold"
          style={{ color: "var(--color-text-heading)" }}
        >
          MarkeBase
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 hover:scale-[1.02]"
              style={{
                backgroundColor: isActive
                  ? "var(--color-green-bg)"
                  : "transparent",
                color: isActive
                  ? "var(--color-green)"
                  : "var(--color-text-secondary)",
                border: isActive
                  ? "2px solid var(--color-green)"
                  : "2px solid transparent",
              }}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Theme toggle (bottom) */}
      <div className="px-6 py-6 border-t-2" style={{ borderColor: "var(--color-border)" }}>
        <ThemeToggle />
      </div>
    </aside>
  );
}
