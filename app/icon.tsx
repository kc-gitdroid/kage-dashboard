import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#05070a",
          color: "#1df58d",
          border: "24px solid rgba(255,255,255,0.08)",
          borderRadius: 96,
          fontSize: 176,
          fontWeight: 700,
          letterSpacing: "0.08em",
        }}
      >
        KC
      </div>
    ),
    size,
  );
}
