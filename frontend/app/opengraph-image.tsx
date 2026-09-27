import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Jiya Singhal · I like figuring out why things behave the way they do.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#FFFAF3",
          backgroundImage: "radial-gradient(circle, #ECDCCD 2px, transparent 2.5px)",
          backgroundSize: "30px 30px",
          color: "#2D2640",
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        {/* a waveform drawn in pastel bars, top right */}
        <div
          style={{
            position: "absolute",
            right: "80px",
            top: "80px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {[40, 90, 150, 70, 180, 110, 60, 130, 50].map((h, i) => (
            <div
              key={i}
              style={{
                width: "22px",
                height: `${h}px`,
                borderRadius: "9999px",
                background: ["#FFC6D5", "#FFE38F", "#BFE9D2", "#BCDCFF", "#DCCFFF"][i % 5],
                border: "3px solid #2D2640",
                display: "flex",
              }}
            />
          ))}
        </div>
        <div
          style={{
            fontSize: 24,
            fontFamily: "monospace",
            letterSpacing: "0.16em",
            fontWeight: 700,
            color: "#2D2640",
            background: "#FFCFAE",
            border: "3px solid #2D2640",
            borderRadius: "9999px",
            padding: "8px 24px",
            alignSelf: "flex-start",
            display: "flex",
          }}
        >
          JIYA SINGHAL
        </div>
        <div
          style={{
            marginTop: 34,
            fontSize: 68,
            lineHeight: 1.1,
            maxWidth: 880,
            fontWeight: 700,
            display: "flex",
          }}
        >
          I like figuring out why things behave the way they do.
        </div>
        <div style={{ marginTop: 40, display: "flex", gap: "20px", fontFamily: "sans-serif", fontWeight: 700 }}>
          {[
            ["74% ↓ latency", "#BFE9D2"],
            ["21,750 benchmark runs", "#BCDCFF"],
            ["open-source PyPI author", "#DCCFFF"],
          ].map(([t, c]) => (
            <span
              key={t}
              style={{
                fontSize: 24,
                background: c,
                border: "3px solid #2D2640",
                borderRadius: "9999px",
                padding: "8px 20px",
                display: "flex",
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
