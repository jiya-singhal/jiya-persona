import type { Metadata } from "next";
import { Caveat, Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT", "WONK"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "Jiya Singhal - don't just read the resume, interview it",
  description:
    "A portfolio with an AI twin that answers like Jiya, with receipts - real pipelines, benchmarks, and the numbers she can defend.",
  metadataBase: new URL("https://jiya-persona.vercel.app"),
  openGraph: {
    title: "Jiya Singhal - don't just read the resume, interview it",
    description:
      "Her AI twin answers with receipts - real pipelines, benchmarks, and a calendar it can actually book.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${jetbrains.variable} ${caveat.variable}`}
    >
      <body className="min-h-screen bg-base text-ink font-sans">
        {children}
      </body>
    </html>
  );
}
