import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maven — The Intelligence Layer for Wealth",
  description: "Maven is building the Palantir of wealth management. AI-native platform for advisors and individuals that learns continuously and gets smarter with every client.",
  openGraph: {
    title: "Maven — The Intelligence Layer for Wealth",
    description: "Maven is building the Palantir of wealth management. AI-native platform that learns continuously and gets smarter with every client.",
    url: "https://mavenwealth.ai/pitch",
    images: [
      {
        url: "/og-pitch.png",
        width: 1200,
        height: 630,
        alt: "Maven — The Intelligence Layer for Wealth",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maven — The Intelligence Layer for Wealth",
    description: "Building the Palantir of wealth management. AI-native platform that learns continuously.",
    images: ["/og-pitch.png"],
  },
  alternates: {
    canonical: "https://mavenwealth.ai/pitch",
  },
};

export default function PitchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
