import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LOCALES, isLocale } from "@/lib/i18n";

const bodyFont = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const headingFont = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

// Root layout per locale: every language under its prefix (/en/, /sk/),
// language model v2 - proxy.ts.
export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <html lang={lang} className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body>
        <Header locale={lang} />
        {children}
        <Footer locale={lang} />
        <Analytics />
      </body>
    </html>
  );
}
