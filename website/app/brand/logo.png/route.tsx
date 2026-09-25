import { ImageResponse } from "next/og";
import { MARK_DATA_URI } from "@/lib/brand";

// Square brand logo for Organization JSON-LD on the home page (Google wants
// a raster image of at least 112x112). Same mark as components/Logo.tsx.
export async function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFFFF" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain img */}
        <img src={MARK_DATA_URI} width={420} height={388} alt="" />
      </div>
    ),
    { width: 512, height: 512, headers: { "Cache-Control": "public, max-age=604800" } }
  );
}
