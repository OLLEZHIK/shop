import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const headingFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

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
    <html lang="en" className={headingFont.variable}>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
