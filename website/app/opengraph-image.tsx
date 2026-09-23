import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "pawenn - Pet services in Bratislava";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Site-wide OG/social share image, picked up automatically by Next for
// any page that doesn't define its own - same brand palette as
// AmbientBackground/the header logo, built as flat shapes (Satori, which
// ImageResponse runs on, doesn't render arbitrary SVG paths, and this
// project never uses emoji as icon stand-ins - see icons.tsx) rather
// than a generated photo, to stay consistent with the rest of the site.
export default function Image() {
  const toe = (left: number, top: number, w: number, h: number) => ({
    position: "absolute" as const,
    left,
    top,
    width: w,
    height: h,
    borderRadius: "50%",
    background: "#FF6B35",
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FDE9DE 0%, #F7F9FB 50%, #DCE9F5 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 110,
            height: 110,
            borderRadius: "50%",
            background: "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 28,
            boxShadow: "0 12px 32px rgba(23,23,23,0.12)",
          }}
        >
          <div style={{ position: "relative", width: 72, height: 64 }}>
            <div style={toe(19, 34, 34, 28)} />
            <div style={toe(0, 16, 16, 20)} />
            <div style={toe(16, 2, 15, 19)} />
            <div style={toe(41, 2, 15, 19)} />
            <div style={toe(56, 16, 16, 20)} />
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 104, fontWeight: 800, color: "#004E89" }}>
          Paw<span style={{ color: "#FF6B35" }}>enn</span>
        </div>
        <div style={{ display: "flex", marginTop: 20, fontSize: 34, color: "#17171799" }}>
          Trusted pet services in Bratislava
        </div>
      </div>
    ),
    { ...size }
  );
}
