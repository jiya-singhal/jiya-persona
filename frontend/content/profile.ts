/**
 * Resume-derived content for the portfolio sections.
 * Source of truth: data/resume.pdf (also what the AI persona's RAG corpus uses).
 */

export const LINKS = {
  github: "https://github.com/jiya-singhal",
  linkedin: "https://www.linkedin.com/in/jiyasinghal/",
  leetcode: "https://leetcode.com/u/jiyasinghal_/",
  email: "mailto:jiya.23bcs10043@sst.scaler.com",
  resume: "/resume.pdf",
  calBooking: "#chat",
};

export const STATS = [
  { value: "57s → 15s", label: "p50 latency on the voice-onboarding flow she re-architected" },
  { value: "21,750", label: "tests in the pitch-model benchmark she keeps as a regression gate" },
  { value: "5.5% → 0.6%", label: "false positives after her audio-quality classifier" },
  { value: "top ~5%", label: "LeetCode Knight by contest rating" },
];

export type ExperienceItem = {
  company: string;
  url: string;
  role: string;
  period: string;
  location: string;
  bullets: { title: string; body: string }[];
};

export const EXPERIENCE: ExperienceItem[] = [
  {
    company: "Sing One Song",
    url: "https://singonesong.com/",
    role: "Software Engineering Intern",
    period: "Aug 2025 — present",
    location: "Bangalore",
    bullets: [
      {
        title: "Production voice pipeline",
        body:
          "Built the voice-onboarding pipeline from scratch (FastAPI + Firebase orchestration, retry-safe Cloud Tasks), then re-architected it to concurrent orchestration on GCP Cloud Run with asyncio.gather() and Silero VAD silence-trim — p50 latency 57s → 15s on the flow every new user hits first.",
      },
      {
        title: "Real-time audio-quality classifier",
        body:
          "Designed a multi-metric classifier (SNR + spectral entropy + A-weighted dB + VAD) separating clean speech from unusable recordings — false-positive warnings 5.5% → 0.6% across 355 production recordings.",
      },
      {
        title: "Benchmarking at scale",
        body:
          "Playwright-driven harness of 21,750 tests (30 singers × 150 MUSAN noise files × 5 SNR levels) comparing PESTO vs. Aubio and validating a 389KB swift-f0 migration — 97.5% size cut, 98.8% pass — kept as a standing regression gate.",
      },
      {
        title: "Game performance & input latency",
        body:
          "Traced input lag in the voice-driven games to serialized pitch inference over an oversized analysis window; shipped the fix behind URL-toggled A/B variants with a p50/p95 probe, scoped so 9 other games stayed unaffected.",
      },
      {
        title: "Cross-platform audio reliability",
        body:
          "Root-caused mic failures across the Flutter/WebView boundary on iOS and Android — a stale AVAudioSession category and an un-abandoned Android audio-focus grab — ruling out four competing hypotheses with source-level proof before shipping session-repair fixes on both platforms.",
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
    period: "Jan 2025 — Apr 2025",
    location: "Noida",
    bullets: [
      {
        title: "Hybrid search over messy data",
        body:
          "Retrieval across thousands of unstructured listings combining FAISS vector search with FuzzyWuzzy normalization under a weighted semantic-fuzzy-heuristic scoring layer — relevance 89% → 96%.",
      },
      {
        title: "Trust, safety & fraud tooling",
        body:
          "Integrated identity-verification APIs (Truecaller, IDfy, Shield) into the buyer-seller flow; drove PoC evaluation of an automated voice bot via transcript analysis and ASR tuning.",
      },
    ],
  },
];

export const ABOUT = {
  lede:
    "Jiya builds voice and audio ML systems — pitch detection, quality gates, latency work — and measures everything before she believes it.",
  body: [
    "At Sing One Song she owns the voice-onboarding pipeline end to end and keeps a 21,750-test benchmark as the bar any model change has to clear. Before that she built hybrid search and fraud tooling at Tradeindia. She publishes what she measures: voicequal, her audio-quality library, shipped to PyPI with its full 200-clip benchmark — not a favourable subset.",
    "The ear came before the engineering: she holds a senior diploma in Bharatanatyam and trains in vocals. Building systems that judge pitch and audio quality is, in a very literal sense, automating what she practices.",
  ],
  education: [
    {
      school: "Scaler School of Technology",
      detail: "Undergraduate Program in Computer Science, 2023 — present",
    },
    {
      school: "BITS Pilani",
      detail: "B.Sc. (Hons.) Computer Science, 2023 — present",
    },
  ],
  openSource: [
    { label: "NixOS/nixos-summer #51", url: "https://github.com/NixOS/nixos-summer/pull/51" },
    { label: "OneBusAway/onebusaway-docs #140", url: "https://github.com/OneBusAway/onebusaway-docs/pull/140" },
    { label: "voicequal on PyPI", url: "https://pypi.org/project/voicequal/" },
  ],
};

export const CHAT_SUGGESTIONS = [
  "Why should we hire Jiya for an AI engineering role?",
  "What did she do at Sing One Song?",
  "Tell me about voicequal",
  "What's her most technically advanced repo?",
  "Can I book a 30-min chat next week?",
];
