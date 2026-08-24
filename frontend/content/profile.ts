/**
 * All site copy and resume-derived content, in one editable place.
 * Source of truth for facts: data/resume.pdf (also what the AI twin's RAG corpus uses).
 * Tone rules: confident about evidence, humble about self. Exactly five puns
 * sitewide (see COPY) - do not add more.
 */

export const LINKS = {
  github: "https://github.com/jiya-singhal",
  linkedin: "https://www.linkedin.com/in/jiyasinghal/",
  leetcode: "https://leetcode.com/u/jiyasinghal_/",
  email: "mailto:jiya.23bcs10043@sst.scaler.com",
  resume: "/resume.pdf",
  calBooking: "#chat",
};

export const COPY = {
  hero: {
    headline: ["Don't just read my resume.", "Interview it."],
    sub: "I built an AI twin that answers like me - grounded in my real pipelines, my benchmarks, and the numbers I can defend.",
    ctaPrimary: "ask my AI twin",
    ctaSecondary: "see the numbers",
    resumeJoke: "prefer the boring version?",
    resumeLabel: "here's the PDF",
    marquee: ["build", "test", "break", "fix", "ship"],
  },
  work: {
    eyebrow: "internships - real systems, measured honestly",
    title: "Where the numbers come from.",
    annotation: "Numbers don't lie. I still double-check them.",
    framing:
      "I'm an intern aiming squarely at AI engineering - these are the parts I owned, and the numbers I can defend.",
    arcade: {
      lead: "I build the audio games themselves, too.",
      cta: "playtest the arcade",
      url: "https://sos-arcade.web.app/",
      joke: "fair warning: they judge your singing. gently.",
    },
  },
  projects: {
    eyebrow: "personal projects",
    title: "Built on my own time.",
    sub: "Smaller experiments - auto-summarized from the actual code, tradeoffs included.",
    outro: "I've made a few more things. Some of them even worked on the first try.",
    archiveCta: "browse archive",
  },
  notes: {
    eyebrow: "half-finished thoughts",
    title: "Things I'm figuring out.",
    annotation: "half notes, half therapy.",
  },
  about: {
    eyebrow: "hello",
    title: "I'm Jiya. Nice to meet you.",
    wave: "👋",
    rootsTitle: "Dehradun → Bangalore",
    annotation: "swapped mountain air for Bangalore traffic. worth it, mostly.",
  },
  chat: {
    eyebrow: "ask her anything",
    title: "Curious about my work?",
    sub: "My AI twin knows the details. She has the receipts.",
  },
  footer: {
    closing: "Let's build something worth listening to.",
    signoff: "still curious.",
  },
} as const;

export const STATS = [
  { value: "57s → 15s", label: "p50 latency on the voice-onboarding flow I re-architected" },
  { value: "21,750", label: "tests in the pitch-model benchmark I keep as a regression gate" },
  { value: "5.5% → 0.6%", label: "false positives after my audio-quality classifier" },
  { value: "97.5%", label: "model size cut in the swift-f0 migration, at a 98.8% pass rate" },
];

export type ExperienceItem = {
  company: string;
  url: string;
  role: string;
  period: string;
  location: string;
  metric?: { value: string; label: string };
  bullets: { title: string; body: string }[];
};

export const EXPERIENCE: ExperienceItem[] = [
  {
    company: "Sing One Song",
    url: "https://singonesong.com/",
    role: "Software Engineering Intern",
    period: "Aug 2025 - present",
    location: "Bangalore",
    bullets: [
      {
        title: "Production voice pipeline",
        body:
          "Built the voice-onboarding pipeline from scratch (FastAPI + Firebase orchestration, retry-safe Cloud Tasks), then re-architected it to concurrent orchestration on GCP Cloud Run with asyncio.gather() and Silero VAD silence-trim - p50 latency 57s → 15s on the flow every new user hits first.",
      },
      {
        title: "Real-time audio-quality classifier",
        body:
          "Designed a multi-metric classifier (SNR + spectral entropy + A-weighted dB + VAD) separating clean speech from unusable recordings - false-positive warnings 5.5% → 0.6% across 355 production recordings.",
      },
      {
        title: "Benchmarking at scale",
        body:
          "Playwright-driven harness of 21,750 tests (30 singers × 150 MUSAN noise files × 5 SNR levels) comparing PESTO vs. Aubio and validating a 389KB swift-f0 migration - 97.5% size cut, 98.8% pass - kept as a standing regression gate.",
      },
      {
        title: "Game performance & input latency",
        body:
          "Traced input lag in the voice-driven games to serialized pitch inference over an oversized analysis window; shipped the fix behind URL-toggled A/B variants with a p50/p95 probe, scoped so 9 other games stayed unaffected.",
      },
      {
        title: "Cross-platform audio reliability",
        body:
          "Root-caused mic failures across the Flutter/WebView boundary on iOS and Android - a stale AVAudioSession category and an un-abandoned Android audio-focus grab - ruling out four competing hypotheses with source-level proof before shipping session-repair fixes on both platforms.",
      },
      {
        title: "CI screenshot automation",
        body:
          "Playwright runner booting every game headless across device profiles with injected safe-area values, attaching captures to each PR; instrumented ~20 games with PostHog analytics.",
      },
    ],
  },
  {
    company: "Tradeindia",
    url: "https://tradeindia.com/",
    role: "Product & Tech Intern",
    period: "Jan 2025 - Apr 2025",
    location: "Noida",
    metric: { value: "89% → 96%", label: "search relevance on hybrid retrieval" },
    bullets: [
      {
        title: "Hybrid search over messy data",
        body:
          "Retrieval across thousands of unstructured listings combining FAISS vector search with FuzzyWuzzy normalization under a weighted semantic-fuzzy-heuristic scoring layer - relevance 89% → 96%.",
      },
      {
        title: "Trust, safety & fraud tooling",
        body:
          "Integrated identity-verification APIs (Truecaller, IDfy, Shield) into the buyer-seller flow; drove PoC evaluation of an automated voice bot via transcript analysis and ASR tuning.",
      },
    ],
  },
];

export const WORK_CARDS = [
  { repo: "voicequal", display: "VoiceQual", oneLiner: "An experiment in making audio evaluation a little less fuzzy." },
  { repo: "jiya-persona", display: "Jiya Persona", oneLiner: "A portfolio that decided it wanted to talk back." },
  { repo: "KV-Cache", display: "KV Cache", oneLiner: "Making inference lighter, faster, smarter." },
];

export const NOTES: { title: string; color: "linen" | "butter" | "sage" | "blush" }[] = [
  { title: "Why simple systems are harder than complicated ones.", color: "butter" },
  { title: "What I'm learning about building for scale.", color: "sage" },
  { title: "Random ideas that might become useful later.", color: "linen" },
  { title: "What makes an eval actually trustworthy.", color: "blush" },
];

export const ABOUT = {
  body: [
    "I like turning messy ideas into things that actually work. I overthink a little, iterate a lot, measure everything, and then usually make another version. Most of what I know came from shipping something slightly too hard for me and figuring it out on the way.",
    "I'm early in my career and honest about it - what I bring is the work above, and the habit of checking my numbers before I believe them.",
  ],
  roots: [
    "I grew up in Dehradun, in the Uttarakhand hills - where I finished a Bharatanatyam degree, volunteered with NGOs, and taught myself technology back when it hadn't really arrived in my city.",
    "Classes 11 and 12 came with health setbacks and average grades. What they actually taught me was resilience - I held on to computer science anyway.",
    "Now I'm in Bangalore, studying CS at Scaler and interning at Sing One Song - doing the exact thing I promised myself back then.",
  ],
  education: [
    {
      school: "Scaler School of Technology",
      detail: "Undergraduate Program in Computer Science, 2023 - present",
    },
    {
      school: "BITS Pilani",
      detail: "B.Sc. (Hons.) Computer Science, 2023 - present",
    },
  ],
  openSource: [
    { label: "NixOS/nixos-summer #51", url: "https://github.com/NixOS/nixos-summer/pull/51" },
    { label: "OneBusAway/onebusaway-docs #140", url: "https://github.com/OneBusAway/onebusaway-docs/pull/140" },
    { label: "voicequal on PyPI", url: "https://pypi.org/project/voicequal/" },
  ],
};

/**
 * label = what the visitor sees (Jiya's voice, verbatim from her brief);
 * send = the question actually sent to the AI twin, phrased so retrieval
 * and the persona prompt interpret it as being about Jiya.
 */
export const CHAT_SUGGESTIONS: { label: string; send: string }[] = [
  { label: "What am I good at?", send: "What is Jiya good at?" },
  { label: "What did I build recently?", send: "What did Jiya build recently?" },
  { label: "What am I figuring out?", send: "What is Jiya still learning or figuring out?" },
  { label: "Can I book a 30-min chat next week?", send: "Can I book a 30-min chat with Jiya next week?" },
];
