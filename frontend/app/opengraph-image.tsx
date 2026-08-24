import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Jiya Singhal - don't just read the resume, interview it";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
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
          backgroundColor: "#F6EEDF",
          color: "#33261A",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#7C6B54",
            fontFamily: "monospace",
          }}
        >
          jiya singhal
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 84,
            lineHeight: 1.08,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>Don&apos;t just read my resume.</span>
          <span
            style={{
              display: "flex",
              flexDirection: "column",
              fontStyle: "italic",
              color: "#8F5B2E",
            }}
          >
            <span>Interview it.</span>
            <span
              style={{
                marginTop: 10,
                width: 430,
                height: 10,
                borderRadius: 6,
                backgroundColor: "#E8A87C",
              }}
            />
          </span>
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 28,
            color: "#7C6B54",
            fontFamily: "sans-serif",
          }}
        >
          An AI twin that answers like her - with receipts.
        </div>
      </div>
    ),
    size,
  );
}
