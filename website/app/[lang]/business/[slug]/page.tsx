import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BusinessDetail, businessMetadata } from "@/components/BusinessDetail";
import { businessSegment } from "@/lib/categories";
import { isLocale } from "@/lib/i18n";

// /business/{slug}/ - English. Other locales use their own segment
// (see app/[lang]/podnik) so each language has one URL per business.
const SEGMENT = "business";

interface PageParams {
  lang: string;
  slug: string;
}

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang) || businessSegment(lang) !== SEGMENT) return {};
  return businessMetadata(lang, slug);
}

export default async function BusinessPage({ params }: { params: Promise<PageParams> }) {
  const { lang, slug } = await params;
  if (!isLocale(lang) || businessSegment(lang) !== SEGMENT) notFound();
  return <BusinessDetail locale={lang} slug={slug} />;
}
