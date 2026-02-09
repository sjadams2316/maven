import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maven Oracle — AI Financial Assistant",
  description: "Ask Maven anything about your finances. Get personalized answers about tax strategies, portfolio optimization, retirement planning, and more — powered by AI that knows your full picture.",
  openGraph: {
    title: "Maven Oracle — AI Financial Assistant",
    description: "Ask anything about your finances. Get personalized answers about tax strategies, portfolio optimization, and retirement planning.",
    url: "https://mavenwealth.ai/oracle",
    images: [
      {
        url: "/og-oracle.png",
        width: 1200,
        height: 630,
        alt: "Maven Oracle — AI Financial Assistant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maven Oracle — AI Financial Assistant",
    description: "Ask anything about your finances. Personalized AI answers based on your complete financial picture.",
    images: ["/og-oracle.png"],
  },
  alternates: {
    canonical: "https://mavenwealth.ai/oracle",
  },
};

export default function OracleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
