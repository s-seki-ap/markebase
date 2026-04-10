"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

const NO_SHELL_PATTERNS: RegExp[] = [
  /^\/auth(\/|$)/,
  /^\/onboarding(\/|$)/,
  /^\/why-learn(\/|$)/,
  /^\/curriculum\/[^/]+\/[^/]+$/,
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noShell = NO_SHELL_PATTERNS.some((p) => p.test(pathname));

  if (noShell) return <>{children}</>;

  return (
    <>
      <Sidebar />
      <div className="lg:pl-[260px]">{children}</div>
    </>
  );
}
