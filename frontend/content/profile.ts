/**
 * All site copy in one editable place — the Midnight Lab edition.
 * Source of truth for facts: data/resume.pdf (also what the AI twin's
 * RAG corpus uses). Numbers are the ones Jiya can defend out loud;
 * nothing here is inflated, including voicequal's honest benchmark.
 */

export const LINKS = {
  github: "https://github.com/jiya-singhal",
  linkedin: "https://www.linkedin.com/in/jiyasinghal/",
  leetcode: "https://leetcode.com/u/jiyasinghal_/",
  pypi: "https://pypi.org/project/voicequal/",
  email: "mailto:jiya.23bcs10043@sst.scaler.com",
  resume: "/resume.pdf",
};

export const COPY = {
  nav: {
    brand: "JIYA",
    items: [
      { label: "Work", href: "/#work" },
      { label: "Experiments", href: "/archive" },
      { label: "About", href: "/#beyond" },
      { label: "Notes", href: "/notes" },
      { label: "Resume", href: "/resume.pdf" },
    ],
    cta: "Talk to Jiya ↗",
  },
  hero: {
    name: "JIYA SINGHAL",
    headline: "I like figuring out why things behave the way they do.",
    sub: "I build voice, AI and backend systems, usually somewhere between making something work and understanding why it didn't.",
    current: "Software Engineer · Voice / AI / Systems · currently building @ Sing One Song",
    ctaPrimary: "See what I've been building",
    ctaSecondary: "Ask my AI persona ↗",
    statsNote: "numbers are nicer when they mean something.",
  },
  work: {
    number: "01",
    eyebrow: "selected work",
    title: "Four systems, measured honestly.",
  },
  think: {
    number: "02",
    eyebrow: "how I think",
    title: "I like problems where the first explanation is usually wrong.",
    body:
      "I build voice, AI and backend systems, and I especially like the part where something is slow, flaky or just weird, and you get to find out why.",
  },
  measuring: {
    number: "03",
    eyebrow: "instead of a skills section",
    title: "Things I like measuring.",
    tagline: "Measured, because vibes were inconclusive.",
  },
  beyond: {
    number: "04",
    eyebrow: "beyond code",
    statement: "There is a life outside the terminal.",
    line: "Years before I debugged distributed systems, I learned precision through rhythm.",
    credential: "Senior Diploma · Bharatanatyam",
    quiet: ["LeetCode Knight · top ~5%", "Dehradun → Bangalore", "professional rabbit-hole explorer"],
  },
  chat: {
    number: "05",
    eyebrow: "AI Jiya",
    title: "An AI that can actually answer questions about me.",
    sub: "The persona is itself a portfolio project: RAG over my resume and repos, tested with adversarial prompts.",
  },
  footer: {
    still: "Got a problem worth thinking about?",
    fields: "Voice systems. AI. Backend. Strange bugs. Good questions.",
    listening: "I'm listening.",
    ask: "Ask Jiya anything",
    askAside: "Or ask my AI first. It has read more of my GitHub than most people should.",
    resumePrefix: "Need the formal version?",
    resumeCta: "Less personal, more PDF ↗",
  },
} as const;

export const HERO_STATS: {
  display: string;
  label: string;
  egg?: "dotburst";
}[] = [
  { display: "57s → 15s", label: "voice onboarding latency" },
  { display: "21,750", label: "benchmark runs", egg: "dotburst" },
  { display: "89% → 96%", label: "retrieval relevance" },
  { display: "75 tests", label: "open-source voicequal" },
  { display: "top ~5%", label: "LeetCode Knight" },
];

/** Quick-fire personality cards — brief §10, lightly playful, never meme-y. */
export const BRAIN: { q: string; a: string; egg?: "benchmark" }[] = [
  { q: "when something breaks", a: "observe → isolate → measure → fix" },
  { q: "favourite question", a: "but why?" },
  { q: "before optimising", a: "measure it" },
  { q: "after optimising", a: "measure it again" },
  { q: "comfort zone", a: "problems with unclear causes" },
  { q: "suspicious phrase", a: "“works on my machine”" },
  { q: "weak signal", a: "probably fine.", egg: "benchmark" },
  { q: "rabbit-hole tolerance", a: "concerningly high" },
];

export type CaseStudy = {
  id: "voice-pipeline" | "voicequal" | "ai-persona" | "kv-cache";
  eyebrow: string;
  headline: string;
  metric?: { from: string; to: string; delta: string };
  problem: string;
  investigation: string;
  built: string[];
  result: string;
  hoverDetail: string;
  links?: { label: string; url: string }[];
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: "voice-pipeline",
    eyebrow: "SING ONE SONG · VOICE INFRASTRUCTURE",
    headline: "Making a voice onboarding flow feel instant.",
    metric: { from: "57 sec", to: "15 sec", delta: "74% lower p50 latency" },
    problem:
      "New users waited almost a minute inside voice onboarding, on the very first thing they experience.",
    investigation:
      "Nothing was slow. Independent I/O steps were just queuing politely behind each other.",
    built: ["FastAPI", "Firebase", "Cloud Run", "asyncio", "Silero VAD", "Cloud Tasks"],
    result:
      "Concurrent orchestration, VAD-trimmed silence, retry-safe handlers: p50 latency 57s → 15s.",
    hoverDetail:
      "Every handler survives Cloud Tasks redelivery: same input, same end state, no double side-effects. p50/p95 probes shipped with the fix, so the win stays measured.",
  },
  {
    id: "voicequal",
    eyebrow: "OPEN SOURCE · PYTHON / PYPI",
    headline: "How do you decide whether a recording is actually usable?",
    problem:
      "Reject good recordings and you punish users. Accept bad ones and you waste every downstream step.",
    investigation:
      "Turned “sounds bad” into numbers (SNR, spectral flatness, background level), then benchmarked against 200 labeled clips instead of my own ears.",
    built: ["Python", "numpy / scipy", "rolling stats", "hysteresis", "CLI", "PyPI"],
    result:
      "voicequal, on PyPI with its full benchmark: 46% exact-tier, 82% within one tier. The honest number shipped.",
    hoverDetail:
      "The weak spot is documented too: spectral SNR overrates loud vocals buried in noise. v0.2.0 plans VAD-gated SNR to fix exactly that.",
    links: [
      { label: "PyPI", url: "https://pypi.org/project/voicequal/" },
      { label: "GitHub", url: "https://github.com/jiya-singhal/voicequal" },
    ],
  },
  {
    id: "ai-persona",
    eyebrow: "AI SYSTEMS · RAG",
    headline: "An AI that can actually answer questions about me.",
    problem:
      "Portfolio chatbots love inventing their owner's accomplishments. Mine speaks to recruiters, so it only says things I can defend.",
    investigation:
      "Grounded it in my resume and auto-summarized repo cards, with MMR retrieval so near-identical chunks don't crowd out the useful one.",
    built: ["FastAPI", "ChromaDB", "Voyage embeddings", "MMR retrieval", "LLM-as-judge", "Vapi voice"],
    result:
      "A voice + chat persona tested with 20+ adversarial prompts written to break it. You're on its portfolio right now.",
    hoverDetail:
      "An LLM judge scores every answer for groundedness against retrieved sources, and the eval runs as a gate. Ask it something: sources are cited under every answer.",
  },
  {
    id: "kv-cache",
    eyebrow: "DISTRIBUTED SYSTEMS",
    headline: "Three nodes, one consistent view.",
    problem:
      "A cache is easy until it's distributed: keys must survive nodes leaving, reads must agree, memory can't grow forever.",
    investigation:
      "Consistent hashing so keys barely move when topology changes; synchronous replication, paying write latency for reads that always agree.",
    built: ["consistent hashing", "primary-replica replication", "TTL", "LRU eviction"],
    result:
      "Three nodes, strong consistency, TTL expiry, bounded LRU memory. The systems instinct isn't limited to AI.",
    hoverDetail:
      "Every write waits for the replica, a deliberate cost. For a read-heavy cache that trade is the right one, and I can argue it.",
    links: [{ label: "GitHub", url: "https://github.com/jiya-singhal/KV-Cache" }],
  },
];

export const PHILOSOPHY: { title: string; body: string }[] = [
  {
    title: "Make the invisible visible first.",
    body:
      "Two systems each kept their own cursor, and riders drifted mid-air for weeks. A debug overlay made the gap visible: worst-case desync fell 53px → 16px.",
  },
  {
    title: "Diagnose differentially.",
    body:
      "One dead microphone, four plausible causes. Each eliminated with an observation that split the hypothesis space, until only the real one survived.",
  },
  {
    title: "Orphaned state needs a reaper.",
    body:
      "If cleanup only happens in an animation callback, killing the animation kills the cleanup. A watchdog with a hard deadline reaps what the happy path forgot.",
  },
  {
    title: "A check nobody runs is decoration.",
    body:
      "Two repos had a drift check that wasn't wired into CI, so they drifted. Putting it in CI made drift impossible instead of merely detectable.",
  },
  {
    title: "Blast radius before cleverness.",
    body:
      "The input-lag fix shipped behind an A/B toggle with p50/p95 probes, scoped so nine other games stayed untouched. Make the worst case boring.",
  },
];

export const MEASURING: { thing: string; detail: string }[] = [
  { thing: "Latency", detail: "p50 / p95" },
  { thing: "Retrieval quality", detail: "89 → 96%" },
  { thing: "Model accuracy", detail: "21,750 benchmark tests" },
  { thing: "Audio quality", detail: "SNR · entropy · VAD" },
  { thing: "Regression", detail: "automated gates" },
  { thing: "Reliability", detail: "cross-platform edge cases" },
];

export const TOOLBOX: { group: string; items: string }[] = [
  { group: "Languages", items: "Python · TypeScript · JavaScript · Java · Dart · SQL" },
  { group: "AI + evaluation", items: "RAG · LLM-as-judge · agent orchestration · Voyage · Claude" },
  { group: "Backend", items: "FastAPI · asyncio · Firebase · Node" },
  { group: "Infra", items: "GCP · Docker · GitHub Actions · Playwright" },
  { group: "Interfaces", items: "React · Next.js · Flutter · Phaser" },
];

export const TERMINAL_COMMANDS: Record<string, string[]> = {
  help: ["available: whoami · ls · cat · clear", "(some commands do more than they say)"],
  whoami: ["jiya", "engineer", "dancer", "professional rabbit-hole explorer"],
  ls: ["work/  experiments/  notes/  resume.pdf", "…and a few things not listed."],
};

export const NOTES: { title: string }[] = [
  { title: "Why simple systems are harder than complicated ones." },
  { title: "What makes an eval actually trustworthy." },
  { title: "What I'm learning about building for scale." },
  { title: "Random ideas that might become useful later." },
];

/**
 * label = what the visitor sees; send = the question actually sent to the
 * AI twin, phrased so retrieval treats it as being about Jiya.
 */
export const CHAT_SUGGESTIONS: { label: string; send: string }[] = [
  {
    label: "What was the hardest engineering problem Jiya solved?",
    send: "What was the hardest engineering problem Jiya solved?",
  },
  { label: "What did she build recently?", send: "What did Jiya build recently?" },
  { label: "How does she test her AI systems?", send: "How does Jiya evaluate and test her AI systems?" },
  { label: "Book a 30-min chat next week", send: "Can I book a 30-min chat with Jiya next week?" },
];
