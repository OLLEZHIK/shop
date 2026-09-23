import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { NotFoundContent } from "@/components/NotFoundContent";

// URLs that match no route at all (the root layout lives under [lang],
// so there is no single layout to render a 404 inside).
const bodyFont = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });
const headingFont = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["700", "800"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "404 - pawenn",
  robots: { index: false, follow: true },
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body>
        <NotFoundContent />
      </body>
    </html>
  );
}
