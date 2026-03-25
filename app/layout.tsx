import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MarkeBase",
  description: "デジタルマーケターのためのインタラクティブ学習プラットフォーム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body style={{ backgroundColor: "#0f172a", color: "#f1f5f9", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
