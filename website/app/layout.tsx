import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "pawenn - Pet Services in Bratislava",
  description: "Find trusted pet services in Bratislava - groomers, vets, hotels, training and more",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold" style={{color: 'var(--brand-orange)'}}>
              pawenn
            </Link>
            <nav className="hidden md:flex gap-6 text-sm">
              <Link href="/search" className="hover:text-brand-blue transition">Browse All</Link>
              <Link href="/about" className="hover:text-brand-blue transition">How it Works</Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="bg-gray-50 border-t border-gray-200 mt-16">
          <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-foreground/60">
            <p>© 2026 pawenn.com · Trusted pet services in Bratislava</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
