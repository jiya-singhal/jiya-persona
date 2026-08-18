import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Jiya Singhal — engineer of systems that listen",
  description:
    "AI/ML engineer working on voice pipelines, pitch detection, and audio quality. Talk to her AI representative — grounded in her resume and GitHub — or book a call.",
  metadataBase: new URL("https://jiya-persona.vercel.app"),
  openGraph: {
    title: "Jiya Singhal — engineer of systems that listen",
    description:
      "Voice pipelines, pitch detection, audio quality. Interview her AI rep or book a call.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-stage text-ivory font-sans">
        {children}
      </body>
    </html>
  );
}
