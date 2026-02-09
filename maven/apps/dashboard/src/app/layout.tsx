import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Providers } from "@/providers/Providers";
import DemoBanner from "./components/DemoBanner";
import { KeyboardShortcuts } from "./components/KeyboardShortcuts";
import "./globals.css";

const siteUrl = "https://mavenwealth.ai";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Maven — AI Wealth Intelligence Platform",
    template: "%s | Maven",
  },
  description: "AI-native wealth intelligence that gives you family-office clarity without the complexity. Portfolio analysis, tax optimization, and personalized financial guidance.",
  keywords: ["wealth management", "AI financial advisor", "portfolio analysis", "tax optimization", "retirement planning", "investment intelligence"],
  authors: [{ name: "Maven Wealth" }],
  creator: "Maven Wealth",
  publisher: "Maven Wealth",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Maven",
    title: "Maven — AI Wealth Intelligence Platform",
    description: "AI-native wealth intelligence that gives you family-office clarity without the complexity. Portfolio analysis, tax optimization, and personalized financial guidance.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Maven — AI Wealth Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maven — AI Wealth Intelligence Platform",
    description: "AI-native wealth intelligence that gives you family-office clarity without the complexity.",
    images: ["/og-image.png"],
    creator: "@mavenwealth",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
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
