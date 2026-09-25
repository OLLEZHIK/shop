import { getDictionary, type Locale } from "@/lib/i18n";

export function PartnerBadge({ featured, locale }: { featured: boolean; locale: Locale }) {
  if (!featured) return null;

  return (
    <span className="inline-flex items-center rounded-full border border-brand-amber px-2.5 py-1 text-xs font-medium text-brand-amber">
      {getDictionary(locale).badges.partner}
    </span>
  );
}
