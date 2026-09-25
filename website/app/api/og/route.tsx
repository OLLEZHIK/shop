import { ImageResponse } from "next/og";
import type { BusinessCategory } from "@prisma/client";
import { CATEGORY_HEX, MARK_DATA_URI } from "@/lib/brand";

// Link preview image (Open Graph / Twitter, SEO audit T27), 1200x630, one
// template for every page: brand, a big title, a subtitle line and the
// category colour. Text comes from our own generateMetadata via query
// parameters (lib/seo.ts, ogImageUrl); lengths are capped. Under /api so
// proxy.ts leaves it alone.
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const title = (params.get("title") ?? "Pawenn").slice(0, 90);
  const subtitle = (params.get("sub") ?? "").slice(0, 120);
  const category = params.get("cat") as BusinessCategory | null;
  const accent = (category && CATEGORY_HEX[category]) || "#FF6B35";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #FFF4EC 0%, #F7F9FB 55%, #EAF3F6 100%)",
          borderTop: `16px solid ${accent}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain img */}
          <img src={MARK_DATA_URI} width={84} height={78} alt="" />
          <div style={{ display: "flex", fontSize: 48, color: "#004E89", letterSpacing: -1 }}>
            Paw<span style={{ color: "#FF6B35" }}>enn</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: title.length > 45 ? 60 : 76, color: "#1A202C", lineHeight: 1.1 }}>
            {title}
          </div>
          {subtitle && <div style={{ display: "flex", fontSize: 34, color: "#4A5568", lineHeight: 1.3 }}>{subtitle}</div>}
        </div>
        <div style={{ display: "flex", fontSize: 26, color: accent }}>pawenn.com</div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800" } }
  );
}
