"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", icon: "🏠", label: "ホーム" },
  { href: "/quest", icon: "🗺️", label: "クエスト" },
  { href: "/curriculum", icon: "📚", label: "学習" },
  { href: "/monster", icon: "🐣", label: "相棒" },
  { href: "/admin", icon: "📊", label: "チーム" },
];

export default function BottomNav() {
  const pathname = usePathname();

  // レッスン画面（3ペイン）では非表示
  const isLessonPage = /^\/curriculum\/[^/]+\/[^/]+$/.test(pathname);
  if (isLessonPage) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t-2"
      style={{
        backgroundColor: "var(--color-card)",
        borderColor: "var(--color-border)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-stretch justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 py-2 min-h-[56px] transition-all"
              style={{
                color: isActive ? "var(--color-green)" : "var(--color-text-muted)",
              }}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span
                className="text-[10px] mt-1 font-bold"
                style={{ color: isActive ? "var(--color-green)" : "var(--color-text-disabled)" }}
              >
                {item.label}
              </span>
              {isActive && (
                <span
                  className="absolute top-0 h-[3px] rounded-b-full"
                  style={{ backgroundColor: "var(--color-green)", width: "40px" }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
