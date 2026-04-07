import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import Providers from "./providers";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-BVF7R4WG1F";

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
    <html lang="ja" suppressHydrationWarning>
      <head>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body style={{ minHeight: "100vh" }}>
        <Providers>
          <Suspense fallback={null}>
            <GoogleAnalytics />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  );
}
