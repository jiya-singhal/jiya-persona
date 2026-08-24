"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { analyzeAudio, type AnalysisResult, MAX_SECONDS } from "@/lib/audioAnalysis";
import { LINKS } from "@/content/profile";

type State =
  | { phase: "idle"; error?: string }
  | { phase: "recording" }
  | { phase: "analyzing" }
  | { phase: "done"; result: AnalysisResult; sourceName: string };

const VERDICT_STYLE: Record<AnalysisResult["verdict"], string> = {
  CLEAN: "text-good",
  USABLE: "text-warn",
  NOISY: "text-poor",
  "TOO QUIET": "text-mist",
};

export function VoicequalDemo() {
  const [state, setState] = useState<State>({ phase: "idle" });
  const [dragOver, setDragOver] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);

  const analyzeArrayBuffer = useCallback(async (buf: ArrayBuffer, name: string) => {
    setState({ phase: "analyzing" });
    try {
      const Ctx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      try {
        const decoded = await ctx.decodeAudioData(buf);
        const samples = decoded.getChannelData(0);
        const result = analyzeAudio(samples, decoded.sampleRate);
        setState({ phase: "done", result, sourceName: name });
      } finally {
        void ctx.close();
      }
    } catch {
      setState({
        phase: "idle",
        error: "Couldn't decode that file — try a wav, mp3 or m4a.",
      });
    }
  }, []);

  const onFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      const buf = await file.arrayBuffer();
      await analyzeArrayBuffer(buf, file.name);
    },
    [analyzeArrayBuffer],
  );

  // Feature-detected in an effect so server and client first paint match.
  const [canRecord, setCanRecord] = useState(false);
  useEffect(() => {
    setCanRecord(
      typeof window.MediaRecorder !== "undefined" &&
        !!navigator.mediaDevices?.getUserMedia,
    );
  }, []);

  const record = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      recorderRef.current = rec;
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: rec.mimeType });
        await analyzeArrayBuffer(await blob.arrayBuffer(), "your microphone");
      };
      setState({ phase: "recording" });
      rec.start();
      setTimeout(() => {
        if (rec.state !== "inactive") rec.stop();
      }, 5000);
    } catch {
      setState({ phase: "idle", error: "Microphone unavailable — drop a file instead." });
    }
  }, [analyzeArrayBuffer]);

  return (
    <div>
      {state.phase !== "done" && (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void onFile(e.dataTransfer.files?.[0]);
          }}
          className={`flex min-h-[190px] cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-8 text-center transition-colors ${
            dragOver ? "border-accent bg-accent/5" : "border-line hover:border-accent/50"
          }`}
        >
          <input
            type="file"
            accept="audio/*"
            className="sr-only"
            onChange={(e) => void onFile(e.target.files?.[0] ?? undefined)}
          />
          {state.phase === "analyzing" ? (
            <span className="font-mono text-sm text-accent">analyzing…</span>
          ) : state.phase === "recording" ? (
            <span className="font-mono text-sm text-poor">● recording 5s…</span>
          ) : (
            <>
              <span className="font-mono text-2xl text-mist" aria-hidden="true">
                ≋
              </span>
              <span className="text-sm text-ivory">
                Drop an audio file here — can software hear a bad recording?
              </span>
              <span className="font-mono text-xs text-mist">
                click to browse{canRecord ? " · or" : ""}
              </span>
              {canRecord && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    void record();
                  }}
                  className="rounded-full border border-line px-4 py-1.5 font-mono text-xs text-ivory transition-colors hover:border-accent/60 hover:text-accent"
                >
                  record 5s from your mic
                </button>
              )}
            </>
          )}
          {state.phase === "idle" && state.error && (
            <span className="font-mono text-xs text-poor">{state.error}</span>
          )}
        </label>
      )}

      {state.phase === "done" && (
        <div className="rounded-lg border border-line bg-night/50 p-5 font-mono text-sm">
          <p className="text-xs text-mist">{state.sourceName}</p>
          <dl className="mt-4 space-y-2.5">
            <Metric
              label="SNR"
              value={`${state.result.snrDb.toFixed(1)} dB`}
              note="estimated"
              bar={state.result.snrDb / 40}
            />
            <Metric
              label="ENTROPY"
              value={state.result.spectralEntropy.toFixed(2)}
              bar={state.result.spectralEntropy}
            />
            <Metric
              label="VOICE"
              value={`${Math.round(state.result.voicedRatio * 100)}%`}
              bar={state.result.voicedRatio}
            />
            <Metric
              label="LEVEL"
              value={
                state.result.levelDb === -Infinity
                  ? "—"
                  : `${state.result.levelDb.toFixed(1)} dBFS`
              }
              note="A-weighted approx"
              bar={Math.max(0, 1 + state.result.levelDb / 60)}
            />
          </dl>
          <p className="mt-5 text-base">
            <span className="text-mist">QUALITY </span>
            <span className={VERDICT_STYLE[state.result.verdict]}>
              ● {state.result.verdict}
            </span>
          </p>
          <p className="mt-1 text-xs leading-relaxed text-mist">{state.result.reason}</p>
          <button
            type="button"
            onClick={() => setState({ phase: "idle" })}
            className="mt-4 rounded-full border border-line px-4 py-1.5 text-xs text-ivory transition-colors hover:border-accent/60 hover:text-accent"
          >
            try another
          </button>
        </div>
      )}

      <p className="mt-4 text-xs leading-relaxed text-mist">
        Analyzed in your browser — nothing is uploaded. This is a browser
        re-implementation of{" "}
        <a
          href={LINKS.pypi}
          target="_blank"
          rel="noreferrer"
          className="text-accent underline-offset-2 hover:underline"
        >
          voicequal
        </a>
        &apos;s metrics: an estimate, not the published library. The real
        benchmark: 46% exact / 82% within one tier, on 200 labeled clips.
        First {MAX_SECONDS}s analyzed.
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
  note,
  bar,
}: {
  label: string;
  value: string;
  note?: string;
  bar: number;
}) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-3">
      <dt className="text-xs text-mist">{label}</dt>
      <dd className="h-1 overflow-hidden rounded-full bg-line/60">
        <div
          className="h-full rounded-full bg-accent transition-all duration-700"
          style={{ width: `${Math.round(Math.min(1, Math.max(0, bar)) * 100)}%` }}
        />
      </dd>
      <dd className="text-right text-ivory">
        {value}
        {note && <span className="ml-1.5 text-[10px] text-faint">{note}</span>}
      </dd>
    </div>
  );
}
