import type { Metadata, Viewport } from "next";
import { Caveat, DM_Mono, Fraunces, Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

/* Fraunces with its SOFT axis: rounded, friendly display curves. */
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "opsz"],
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jiya Singhal · I like figuring out why things behave the way they do",
  description:
    "Software engineering intern working across voice, real-time audio, game and backend systems. Measured work, honest numbers, and an AI persona you can actually talk to.",
  metadataBase: new URL("https://jiya-persona.vercel.app"),
  openGraph: {
    title: "Jiya Singhal · I like figuring out why things behave the way they do",
    description:
      "Voice, real-time audio and game systems. 196 merged PRs, a 21,750-case benchmark, an open-source audio library, and an AI persona grounded in all of it.",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFAF3",
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
      className={`${nunito.variable} ${fraunces.variable} ${caveat.variable} ${dmMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: twoAmScript }} />
      </head>
      <body className="min-h-screen bg-paper font-sans text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
