import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio Lab — Deep Analysis & Optimization",
  description: "Advisor-grade portfolio analysis in seconds. Stress test against historical crashes, optimize allocations, run what-if scenarios, and get actionable rebalancing recommendations.",
  openGraph: {
    title: "Portfolio Lab — Deep Analysis & Optimization",
    description: "Advisor-grade portfolio analysis in seconds. Stress test, optimize allocations, and get actionable rebalancing recommendations.",
    url: "https://mavenwealth.ai/portfolio-lab",
    images: [
      {
        url: "/og-portfolio-lab.png",
        width: 1200,
        height: 630,
        alt: "Maven Portfolio Lab — Deep Portfolio Analysis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio Lab — Deep Analysis & Optimization",
    description: "Advisor-grade portfolio analysis. Stress test, optimize allocations, and get rebalancing recommendations.",
    images: ["/og-portfolio-lab.png"],
  },
  alternates: {
    canonical: "https://mavenwealth.ai/portfolio-lab",
  },
};

export default function PortfolioLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
