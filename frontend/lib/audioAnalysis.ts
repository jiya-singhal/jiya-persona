/**
 * Browser re-implementation of voicequal's core metrics — an estimate,
 * not the published library. Pure TypeScript over Float32Array so it can
 * be unit-tested in Node (see scripts/audioAnalysis.fixture.mjs).
 *
 * Pipeline: 30ms frames / 10ms hop, Hann window → per-frame RMS →
 * energy VAD (noise floor = 10th percentile, voiced = floor + 6dB) →
 * SNR from voiced vs unvoiced power → spectral entropy over voiced
 * frames (512-pt FFT) → A-weighted-ish level → verdict.
 */

export type AnalysisResult = {
  snrDb: number; // estimated, clamped 0–40
  spectralEntropy: number; // 0–1, normalized Shannon entropy
  voicedRatio: number; // 0–1 fraction of frames with voice activity
  levelDb: number; // A-weighted-ish dBFS (approx), <= 0
  clippingRatio: number; // fraction of samples at/near full scale
  durationSec: number;
  verdict: "CLEAN" | "USABLE" | "NOISY" | "TOO QUIET";
  reason: string;
};

const FRAME_MS = 30;
const HOP_MS = 10;
const FFT_SIZE = 512;
export const MAX_SECONDS = 30;

/* ---------- radix-2 FFT (in-place, real input convenience wrapper) ---------- */

function fft(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  if ((n & (n - 1)) !== 0) throw new Error("FFT size must be a power of 2");
  // bit reversal
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wRe = Math.cos(ang);
    const wIm = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let curRe = 1;
      let curIm = 0;
      for (let k = 0; k < len / 2; k++) {
        const uRe = re[i + k];
        const uIm = im[i + k];
        const vRe = re[i + k + len / 2] * curRe - im[i + k + len / 2] * curIm;
        const vIm = re[i + k + len / 2] * curIm + im[i + k + len / 2] * curRe;
        re[i + k] = uRe + vRe;
        im[i + k] = uIm + vIm;
        re[i + k + len / 2] = uRe - vRe;
        im[i + k + len / 2] = uIm - vIm;
        const nextRe = curRe * wRe - curIm * wIm;
        curIm = curRe * wIm + curIm * wRe;
        curRe = nextRe;
      }
    }
  }
}

/** Power spectrum (first N/2 bins) of a windowed real signal. */
function powerSpectrum(frame: Float64Array): Float64Array {
  const n = frame.length;
  const re = Float64Array.from(frame);
  const im = new Float64Array(n);
  fft(re, im);
  const half = n / 2;
  const power = new Float64Array(half);
  for (let i = 0; i < half; i++) power[i] = re[i] * re[i] + im[i] * im[i];
  return power;
}

/* ---------- helpers ---------- */

function hannWindow(n: number): Float64Array {
  const w = new Float64Array(n);
  for (let i = 0; i < n; i++) w[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (n - 1)));
  return w;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor(p * sorted.length)));
  return sorted[idx];
}

/** IEC 61672-inspired A-weighting gain (linear) for frequency f — approximate. */
function aWeightGain(f: number): number {
  if (f <= 0) return 0;
  const f2 = f * f;
  const num = 12194 ** 2 * f2 * f2;
  const den =
    (f2 + 20.6 ** 2) *
    Math.sqrt((f2 + 107.7 ** 2) * (f2 + 737.9 ** 2)) *
    (f2 + 12194 ** 2);
  return (num / den) * 1.2589; // +2dB normalization at 1kHz
}

/* ---------- main analysis ---------- */

export function analyzeAudio(samples: Float32Array, sampleRate: number): AnalysisResult {
  const maxSamples = Math.min(samples.length, MAX_SECONDS * sampleRate);
  const durationSec = maxSamples / sampleRate;

  const frameLen = Math.round((FRAME_MS / 1000) * sampleRate);
  const hopLen = Math.round((HOP_MS / 1000) * sampleRate);
  const nFrames = Math.max(0, Math.floor((maxSamples - frameLen) / hopLen) + 1);

  if (nFrames < 5) {
    return {
      snrDb: 0,
      spectralEntropy: 0,
      voicedRatio: 0,
      levelDb: -Infinity,
      clippingRatio: 0,
      durationSec,
      verdict: "TOO QUIET",
      reason: "Recording too short to analyze.",
    };
  }

  // Per-frame RMS energy + clipping
  const rms = new Float64Array(nFrames);
  let clipped = 0;
  for (let i = 0; i < maxSamples; i++) if (Math.abs(samples[i]) >= 0.985) clipped++;
  const clippingRatio = clipped / maxSamples;

  for (let f = 0; f < nFrames; f++) {
    const start = f * hopLen;
    let sum = 0;
    for (let i = 0; i < frameLen; i++) {
      const s = samples[start + i];
      sum += s * s;
    }
    rms[f] = Math.sqrt(sum / frameLen);
  }

  // Energy VAD: noise floor = 10th percentile RMS; voiced = floor + 6dB
  const sortedRms = Array.from(rms).sort((a, b) => a - b);
  const noiseFloor = Math.max(percentile(sortedRms, 0.1), 1e-8);
  const voicedThreshold = noiseFloor * Math.pow(10, 6 / 20);
  const voicedFrames: number[] = [];
  const unvoicedFrames: number[] = [];
  for (let f = 0; f < nFrames; f++) {
    if (rms[f] >= voicedThreshold) voicedFrames.push(f);
    else unvoicedFrames.push(f);
  }
  const voicedRatio = voicedFrames.length / nFrames;

  // SNR: mean voiced power over mean unvoiced power, clamped 0–40 dB
  const meanPower = (frames: number[]) =>
    frames.length === 0
      ? 0
      : frames.reduce((acc, f) => acc + rms[f] * rms[f], 0) / frames.length;
  const signalPower = meanPower(voicedFrames);
  const noisePower = Math.max(meanPower(unvoicedFrames), 1e-12);
  let snrDb =
    voicedFrames.length === 0 ? 0 : 10 * Math.log10(signalPower / noisePower);
  snrDb = Math.min(40, Math.max(0, snrDb));

  // Spectral entropy over (a sample of) voiced frames
  const window = hannWindow(FFT_SIZE);
  const entStep = Math.max(1, Math.floor(voicedFrames.length / 60)); // ≤60 FFTs
  let entropySum = 0;
  let entropyCount = 0;
  for (let vi = 0; vi < voicedFrames.length; vi += entStep) {
    const start = voicedFrames[vi] * hopLen;
    if (start + FFT_SIZE > maxSamples) continue;
    const frame = new Float64Array(FFT_SIZE);
    for (let i = 0; i < FFT_SIZE; i++) frame[i] = samples[start + i] * window[i];
    const power = powerSpectrum(frame);
    let total = 0;
    for (let i = 1; i < power.length; i++) total += power[i];
    if (total <= 0) continue;
    let h = 0;
    for (let i = 1; i < power.length; i++) {
      const p = power[i] / total;
      if (p > 0) h -= p * Math.log2(p);
    }
    entropySum += h / Math.log2(power.length - 1); // normalize to 0–1
    entropyCount++;
  }
  const spectralEntropy = entropyCount > 0 ? entropySum / entropyCount : 0;

  // A-weighted-ish level: weight the average voiced spectrum, express dBFS
  let levelDb = -Infinity;
  if (voicedFrames.length > 0) {
    const binHz = sampleRate / FFT_SIZE;
    // reuse one representative mid-energy voiced frame set: average power spectrum
    const avgPower = new Float64Array(FFT_SIZE / 2);
    let used = 0;
    for (let vi = 0; vi < voicedFrames.length; vi += entStep) {
      const start = voicedFrames[vi] * hopLen;
      if (start + FFT_SIZE > maxSamples) continue;
      const frame = new Float64Array(FFT_SIZE);
      for (let i = 0; i < FFT_SIZE; i++) frame[i] = samples[start + i] * window[i];
      const power = powerSpectrum(frame);
      for (let i = 0; i < avgPower.length; i++) avgPower[i] += power[i];
      used++;
    }
    if (used > 0) {
      let weighted = 0;
      for (let i = 1; i < avgPower.length; i++) {
        const g = aWeightGain(i * binHz);
        weighted += (avgPower[i] / used) * g * g;
      }
      // scale: power spectrum of full-scale sine ≈ (N/2 · window gain)²·(1/2)
      const ref = (FFT_SIZE / 4) ** 2;
      levelDb = 10 * Math.log10(Math.max(weighted / ref, 1e-12));
      levelDb = Math.min(0, levelDb);
    }
  }

  // Verdict rubric — honest tiers, same spirit as voicequal's
  let verdict: AnalysisResult["verdict"];
  let reason: string;
  if (voicedRatio < 0.08 || levelDb < -55) {
    verdict = "TOO QUIET";
    reason = "Barely any voice activity detected above the noise floor.";
  } else if (snrDb >= 20 && voicedRatio >= 0.35 && clippingRatio < 0.01) {
    verdict = "CLEAN";
    reason = "Strong voiced energy well above the noise floor, minimal clipping.";
  } else if (snrDb >= 12 && clippingRatio < 0.03) {
    verdict = "USABLE";
    reason = "Voice is present and separable, but the noise floor is audible.";
  } else {
    verdict = "NOISY";
    reason =
      clippingRatio >= 0.03
        ? "Significant clipping is distorting the signal."
        : "Noise energy is close to the voiced energy.";
  }

  return {
    snrDb,
    spectralEntropy,
    voicedRatio,
    levelDb,
    clippingRatio,
    durationSec,
    verdict,
    reason,
  };
}
