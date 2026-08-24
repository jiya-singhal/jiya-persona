/**
 * Fixture check for lib/audioAnalysis.ts: synthesize voice-like tone
 * bursts over white noise at known SNRs and assert the estimates land
 * within tolerance. Run: node scripts/audioAnalysis.fixture.mjs
 * (Transpiles the TS on the fly via a tiny strip — the lib is type-only TS.)
 */
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Strip TS types crudely but safely for this specific file (no generics in values).
const src = readFileSync(new URL("../lib/audioAnalysis.ts", import.meta.url), "utf8");
const js = src
  .replace(/^export type[\s\S]*?};\n/m, "")
  .replace(/: AnalysisResult\["verdict"\]/g, "")
  .replace(/: (Float32Array|Float64Array|number\[\]|number|string|boolean|void|AnalysisResult)(?=[,)\s=;{])/g, "")
  .replace(/\(sorted, p\)/, "(sorted, p)");
const dir = mkdtempSync(join(tmpdir(), "vq-"));
const mod = join(dir, "audioAnalysis.mjs");
writeFileSync(mod, js);
const { analyzeAudio } = await import(mod);

const SR = 16000;
const SECONDS = 6;

function synth(snrDb) {
  const n = SR * SECONDS;
  const samples = new Float32Array(n);
  const signalAmp = 0.3;
  const noiseAmp = signalAmp / Math.pow(10, snrDb / 20);
  let seed = 42;
  const rand = () => {
    // deterministic LCG noise
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return (seed / 0xffffffff) * 2 - 1;
  };
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    // voice-like bursts: 400ms on / 250ms off, three harmonics + vibrato
    const cycle = t % 0.65;
    const voiced = cycle < 0.4;
    let s = 0;
    if (voiced) {
      const f0 = 180 + 12 * Math.sin(2 * Math.PI * 5 * t);
      s =
        signalAmp *
        (0.6 * Math.sin(2 * Math.PI * f0 * t) +
          0.3 * Math.sin(2 * Math.PI * 2 * f0 * t) +
          0.1 * Math.sin(2 * Math.PI * 3 * f0 * t));
    }
    samples[i] = s + noiseAmp * rand() * 0.5;
  }
  return samples;
}

let failures = 0;
function check(name, ok, detail) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  ${detail}`);
  if (!ok) failures++;
}

for (const targetSnr of [25, 15, 8]) {
  const r = analyzeAudio(synth(targetSnr), SR);
  // Burst-gated tone over sustained noise: RMS-domain SNR estimate should
  // land within a few dB of the amplitude-domain target.
  check(
    `snr@${targetSnr}dB`,
    Math.abs(r.snrDb - targetSnr) <= 5,
    `estimated ${r.snrDb.toFixed(1)}dB (target ${targetSnr}±5)`,
  );
  check(
    `vad@${targetSnr}dB`,
    r.voicedRatio > 0.35 && r.voicedRatio < 0.85,
    `voiced ${(r.voicedRatio * 100).toFixed(0)}% (expected ~40-80%)`,
  );
  console.log(
    `      entropy=${r.spectralEntropy.toFixed(2)} level=${r.levelDb.toFixed(1)}dBFS verdict=${r.verdict}`,
  );
}

// silence should be TOO QUIET
const silence = new Float32Array(SR * 3).fill(0);
for (let i = 0; i < silence.length; i++) silence[i] = 0.0005 * Math.sin(i * 0.01);
const rs = analyzeAudio(silence, SR);
check("silence verdict", rs.verdict === "TOO QUIET", `got ${rs.verdict}`);

// clean loud voice should be CLEAN
const rc = analyzeAudio(synth(30), SR);
check("clean verdict", rc.verdict === "CLEAN", `got ${rc.verdict}`);

process.exit(failures > 0 ? 1 : 0);
