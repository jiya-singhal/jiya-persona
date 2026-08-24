import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jiya Singhal — I build systems that listen, think and respond",
  description:
    "Software engineer working across voice, AI, backend systems and product engineering. Measured work, honest numbers, and an AI persona you can actually talk to.",
  metadataBase: new URL("https://jiya-persona.vercel.app"),
  openGraph: {
    title: "Jiya Singhal — I build systems that listen, think and respond",
    description:
      "Voice, AI and backend systems. 74% lower onboarding latency, a 21,750-test benchmark, an open-source audio library — and an AI persona grounded in all of it.",
  },
};

export const viewport: Viewport = {
  themeColor: "#080B14",
};

/* Applies 2 AM mode before first paint so there is no theme flash. */
const twoAmScript = `try{if(localStorage.getItem("jiya-2am")==="1")document.documentElement.classList.add("two-am")}catch(e){}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable} ${jetbrains.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: twoAmScript }} />
      </head>
      <body className="min-h-screen bg-night font-sans text-ivory">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
