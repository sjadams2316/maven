import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Demo — Try Maven Free",
  description: "Explore Maven's AI wealth intelligence with sample portfolios. See portfolio analysis, tax-loss harvesting, rebalancing insights, and more — no signup required.",
  openGraph: {
    title: "Interactive Demo — Try Maven Free",
    description: "Explore Maven's AI wealth intelligence with sample portfolios. See portfolio analysis, tax-loss harvesting, and rebalancing insights.",
    url: "https://mavenwealth.ai/demo",
    images: [
      {
        url: "/og-demo.png",
        width: 1200,
        height: 630,
        alt: "Maven Demo — AI Wealth Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Interactive Demo — Try Maven Free",
    description: "Explore Maven's AI wealth intelligence with sample portfolios. No signup required.",
    images: ["/og-demo.png"],
  },
  alternates: {
    canonical: "https://mavenwealth.ai/demo",
  },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
