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
          background: "#12192B",
          color: "#E8E4D8",
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        {/* moon glow */}
        <div
          style={{
            position: "absolute",
            right: "-120px",
            top: "-120px",
            width: "500px",
            height: "500px",
            borderRadius: "9999px",
            background:
              "radial-gradient(circle, rgba(157,176,255,0.18), transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            fontSize: 26,
            letterSpacing: "0.35em",
            color: "#8B94A7",
            display: "flex",
          }}
        >
          JIYA SINGHAL
        </div>
        <div
          style={{
            marginTop: 30,
            fontSize: 64,
            lineHeight: 1.15,
            maxWidth: 900,
            display: "flex",
          }}
        >
          I like figuring out why things behave the way they do.
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 24,
            color: "#9DB0FF",
            display: "flex",
            gap: "40px",
          }}
        >
          <span>74% ↓ latency</span>
          <span>21,750 benchmark runs</span>
          <span>open-source PyPI author</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
