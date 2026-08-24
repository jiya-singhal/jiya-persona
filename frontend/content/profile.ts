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
    headline: "I build systems that listen, think and respond.",
    sub: "Software engineer working across voice, AI, backend systems and product engineering.",
    current: "currently building voice experiences @ Sing One Song",
    ctaPrimary: "Explore my work",
    ctaSecondary: "Talk to my AI ↗",
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
      "I build voice, AI and backend systems, and I tend to enjoy the part where something is slow, unreliable or behaving strangely — and you have to figure out why. My work has taken me from audio pipelines and model benchmarking to retrieval systems, mobile debugging and distributed infrastructure.",
  },
  measuring: {
    number: "03",
    eyebrow: "instead of a skills section",
    title: "Things I like measuring.",
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
    sub: "Not a bolted-on chatbot — the persona is itself a portfolio project: RAG over my resume and repos, MMR retrieval, and grounding tested with adversarial prompts.",
  },
  footer: {
    still: "still curious?",
    ask: "Ask Jiya anything",
    closing: "Let's build something worth listening to.",
  },
} as const;

export const HERO_STATS: {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  egg?: "dotburst";
}[] = [
  { value: 74, suffix: "%", label: "lower onboarding latency" },
  { value: 21750, label: "benchmark runs", egg: "dotburst" },
  { value: 75, label: "tests in my open-source PyPI library" },
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
      "Every new user hit an onboarding pipeline whose serialized execution created nearly a minute of waiting — on the very first thing they experience.",
    investigation:
      "Traced the wait to independent I/O-bound steps running one after another: audio preprocessing, silence handling, uploads and orchestration all queuing politely behind each other.",
    built: ["FastAPI", "Firebase", "Cloud Run", "asyncio", "Silero VAD", "Cloud Tasks"],
    result:
      "Concurrent orchestration with asyncio.gather(), VAD-trimmed silence and retry-safe (idempotent) handlers — p50 latency 57s → 15s on the flow every new user hits first.",
    hoverDetail:
      "Every handler survives Cloud Tasks redelivery: same input → same end state, no double side-effects. p50/p95 probes shipped with the fix, so the improvement is monitored, not remembered.",
  },
  {
    id: "voicequal",
    eyebrow: "OPEN SOURCE · PYTHON / PYPI",
    headline: "How do you decide whether a recording is actually usable?",
    problem:
      "Voice apps ingest audio that is sometimes unusable — too noisy, too quiet, clipped. Rejecting good recordings punishes users; accepting bad ones wastes every downstream step.",
    investigation:
      "Framed it as measurement: SNR, spectral flatness, temporal variance and background level per frame, rolled up with hysteresis for live streams — then benchmarked against a labeled test set instead of trusting my own ears.",
    built: ["Python", "numpy / scipy", "rolling stats", "hysteresis", "CLI", "PyPI"],
    result:
      "voicequal — an audio-quality library published with its full 200-clip benchmark: 46% exact-tier accuracy, 82% within one tier. The honest number shipped; the flattering subset didn't.",
    hoverDetail:
      "The weak spot is documented too: spectral SNR reads high for loud vocals buried in noise. v0.2.0 plans VAD-gated SNR to fix exactly that. A benchmark you can't trust is decoration.",
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
      "Portfolio chatbots usually hallucinate their owner's accomplishments. Mine had to answer only with things I can defend — it speaks to recruiters on my behalf.",
    investigation:
      "Grounded generation in a corpus built from my resume and auto-summarized GitHub repo cards; tuned retrieval with MMR so five near-identical chunks don't crowd out the one useful different one.",
    built: ["FastAPI", "ChromaDB", "Voyage embeddings", "MMR retrieval", "LLM-as-judge", "Vapi voice"],
    result:
      "A voice/chat persona whose grounding is tested with 20+ adversarial prompts written to break it — an eval designed by an attacker, not a fan. You're on its portfolio right now.",
    hoverDetail:
      "The judge rubric scores groundedness against retrieved sources; the eval harness runs as a gate, and the latest scores are committed to the repo. Ask it something — sources are cited under every answer.",
  },
  {
    id: "kv-cache",
    eyebrow: "DISTRIBUTED SYSTEMS",
    headline: "Three nodes, one consistent view.",
    problem:
      "A cache is easy until it's distributed: keys must survive nodes joining and leaving, reads must agree, and memory can't grow forever.",
    investigation:
      "Chose consistent hashing so keys remap minimally on topology change, and synchronous primary-replica replication — paying write latency for strong consistency, the right trade for a read-heavy cache.",
    built: ["consistent hashing", "primary-replica replication", "TTL", "LRU eviction"],
    result:
      "A three-node sharded KV cache with strong consistency, TTL expiry and bounded LRU memory — proof the systems instinct isn't limited to AI pipelines.",
    hoverDetail:
      "Strong consistency via synchronous replication was a deliberate cost: every write waits for the replica. For a cache serving reads, that trade-off is the right one — and I can argue it.",
    links: [{ label: "GitHub", url: "https://github.com/jiya-singhal/KV-Cache" }],
  },
];

export const PHILOSOPHY: { title: string; body: string }[] = [
  {
    title: "Make the invisible visible first.",
    body:
      "A renderer and an engine each kept their own cursor, integrating error independently — riders drifted mid-air for weeks because nobody could see the gap. A debug overlay surfacing |visual − engine| made it real: worst-case desync 53px → 16px after reconciliation.",
  },
  {
    title: "Diagnose differentially, prove at the source.",
    body:
      "Mic capture died across a WebView boundary on both iOS and Android. Four plausible causes; each eliminated with an observation that split the hypothesis space, until source-level proof remained: native audio state outliving the WebView that configured it.",
  },
  {
    title: "Orphaned state needs a reaper.",
    body:
      "Any object whose only destroyer is an animation callback will eventually leak — kill the animation and the cleanup dies with it. A watchdog with a hard deadline reaps whatever the happy path forgot, and a regression test keeps it honest.",
  },
  {
    title: "A check nobody runs is decoration.",
    body:
      "Two repos mirrored generated code with a drift check that existed but wasn't in CI — so they drifted anyway. Git archaeology restored the canonical version; wiring the check into CI made drift impossible instead of merely detectable.",
  },
  {
    title: "Blast radius before cleverness.",
    body:
      "The input-lag fix shipped behind URL-toggled A/B variants with a p50/p95 probe, scoped so nine other games on the shared runtime stayed untouched. Measure before, measure after, and make the worst case boring.",
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
