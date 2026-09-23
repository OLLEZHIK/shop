import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE_URL } from "@/lib/site";

const headingFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

const title = "pawenn - Pet Services in Bratislava";
const description = "Find trusted pet services in Bratislava - groomers, vets, hotels, training and more";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // No title.template here - every page (this one included) already
  // spells out its own "X - pawenn" string, so a template would double
  // up the suffix instead of composing with it.
  title,
  description,
  openGraph: {
    title,
    description,
    url: SITE_URL,
    siteName: "pawenn",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={headingFont.variable}>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
