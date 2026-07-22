import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
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
          background: "linear-gradient(135deg, #2172FF 0%, #0046B8 100%)",
          borderRadius: "8px",
          color: "white",
          fontSize: "22px",
          fontWeight: 900,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        P
      </div>
    ),
    {
      ...size,
    }
  );
}
