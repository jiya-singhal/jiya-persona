"use client";

import { Mail, FileText, Code2 } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "../icons";
import { LINKS } from "@/content/profile";

const FOOTER_LINKS = [
  { label: "GitHub", href: LINKS.github, Icon: GitHubIcon },
  { label: "LinkedIn", href: LINKS.linkedin, Icon: LinkedInIcon },
  { label: "LeetCode", href: LINKS.leetcode, Icon: Code2 },
  { label: "Email", href: LINKS.email, Icon: Mail },
  { label: "Resume", href: LINKS.resume, Icon: FileText },
];

export function Footer() {
  return (
    <footer id="book" className="border-t border-veil">
      <div className="mx-auto w-full max-w-shell px-6 py-16">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-2xl text-ivory">
              Want the human instead?
            </p>
            <p className="mt-2 text-mist max-w-md text-[15px] leading-relaxed">
              Ask the AI rep to book you a slot — it checks her real calendar
              and confirms with a Meet link, end to end.
            </p>
          </div>
          <a
            href="#chat"
            className="rounded-full bg-kumkum px-6 py-3 text-sm font-medium text-ivory hover:bg-kumkum/85 transition-colors"
          >
            Book a 30-min chat
          </a>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-veil pt-8">
          <nav className="flex flex-wrap gap-5">
            {FOOTER_LINKS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("/") ? undefined : "_blank"}
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-mist hover:text-gold transition-colors"
              >
                <Icon className="h-4 w-4" />
                {label}
              </a>
            ))}
          </nav>
          <p className="font-mono text-xs text-mist">
            Jiya Singhal · Bangalore · site + AI rep built by her
          </p>
        </div>
      </div>
    </footer>
  );
}
