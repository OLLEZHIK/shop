import Link from "next/link";

export function EmptyState({ resetHref }: { resetHref: string }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
      <p className="text-foreground/70">No results match your filters.</p>
      <Link href={resetHref} className="mt-2 inline-block text-brand-blue hover:underline">
        Reset filters
      </Link>
    </div>
  );
}
