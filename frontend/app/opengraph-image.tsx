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
        {/* pastel sticker shapes */}
        <div
          style={{
            position: "absolute",
            right: "90px",
            top: "70px",
            width: "150px",
            height: "150px",
            borderRadius: "9999px",
            background: "#FFE38F",
            border: "4px solid #2D2640",
            boxShadow: "8px 8px 0 0 #2D2640",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "270px",
            top: "40px",
            width: "90px",
            height: "200px",
            borderRadius: "9999px",
            background: "#FFC6D5",
            border: "4px solid #2D2640",
            boxShadow: "8px 8px 0 0 #2D2640",
            transform: "rotate(-12deg)",
            display: "flex",
          }}
        />
        <div
          style={{
            fontSize: 28,
            fontFamily: "sans-serif",
            fontWeight: 800,
            color: "#2D2640",
            background: "#FFCFAE",
            border: "3px solid #2D2640",
            borderRadius: "9999px",
            padding: "8px 24px",
            alignSelf: "flex-start",
            transform: "rotate(-3deg)",
            display: "flex",
          }}
        >
          hi, I&apos;m jiya ✦
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
