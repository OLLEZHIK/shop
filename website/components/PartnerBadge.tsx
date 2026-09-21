export function PartnerBadge({ featured }: { featured: boolean }) {
  if (!featured) return null;

  return (
    <span className="inline-flex items-center rounded-full border border-brand-amber px-2.5 py-1 text-xs font-medium text-brand-amber">
      Partner
    </span>
  );
}
