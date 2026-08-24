"use client";

import { Mail, FileText } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "../icons";
import { Annotation } from "../doodles/Annotation";
import { Doodle } from "../doodles/Doodle";
import { COPY, LINKS } from "@/content/profile";

const FOOTER_LINKS = [
  { label: "GitHub", href: LINKS.github, Icon: GitHubIcon },
  { label: "LinkedIn", href: LINKS.linkedin, Icon: LinkedInIcon },
  { label: "Email", href: LINKS.email, Icon: Mail },
  { label: "Resume", href: LINKS.resume, Icon: FileText },
];

export function Footer() {
  return (
    <footer id="contact" className="border-t border-line">
      <div className="mx-auto w-full max-w-shell px-6 py-20">
        <div className="flex flex-col items-start justify-between gap-10 sm:flex-row sm:items-center">
          <p className="max-w-2xl font-display text-4xl leading-tight text-ink sm:text-5xl">
            {COPY.footer.closing}
          </p>
          <a
            href="#chat"
            className="shrink-0 rounded-full bg-butter px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-butter/90"
          >
            Book a 30-min chat
          </a>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-6 border-t border-line pt-8">
          <nav className="flex flex-wrap gap-5">
            {FOOTER_LINKS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("/") ? undefined : "_blank"}
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-sub transition-colors hover:text-butter-deep"
              >
                <Icon className="h-4 w-4" />
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <p className="font-mono text-xs text-sub">
              Jiya Singhal · Bangalore · site + AI twin built by her
            </p>
            <span className="inline-flex items-center gap-1.5">
              <Annotation rotate={-3} className="text-butter-deep">
                {COPY.footer.signoff}
              </Annotation>
              <Doodle kind="star" delay={0.4} className="h-5 w-5 text-butter-deep" strokeWidth={2.5} />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
