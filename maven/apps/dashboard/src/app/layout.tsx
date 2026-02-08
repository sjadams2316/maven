import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Providers } from "@/providers/Providers";
import DemoBanner from "./components/DemoBanner";
import { KeyboardShortcuts } from "./components/KeyboardShortcuts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maven — AI Wealth Partner",
  description: "AI-native wealth intelligence for financial advisors and individuals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <DemoBanner />
          <KeyboardShortcuts />
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
