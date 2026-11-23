import { ImageResponse } from "next/og";
export const alt = "Margin — A journal of considered things";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#FAF9F6",
        padding: 80,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        color: "#25392e",
      }}
    >
      <div
        style={{ fontSize: 42, display: "flex", alignItems: "center", gap: 15 }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            background: "#3c5945",
            borderRadius: 3,
            display: "flex",
          }}
        />
        margin.
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 76,
          letterSpacing: -4,
          lineHeight: 1.2,
        }}
      >
        <div>A little perspective.</div>
        <div style={{ color: "#55735b" }}>A lot of curiosity.</div>
      </div>
      <div
        style={{
          display: "flex",
          borderTop: "1px solid #cdd4c8",
          paddingTop: 25,
          fontSize: 23,
        }}
      >
        DIGITAL CRAFT · EVERYDAY CURIOSITY · AN INDEPENDENT JOURNAL
      </div>
    </div>,
    { ...size },
  );
}
