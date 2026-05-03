import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jiya Singhal — AI rep",
  description: "Talk to Jiya's AI representative. Grounded in her resume and GitHub.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-ink">
        {children}
      </body>
    </html>
  );
}
