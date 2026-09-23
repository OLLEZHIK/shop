import Link from "next/link";
import { PawIcon } from "./icons";

export function EmptyState({ resetHref }: { resetHref: string }) {
  return (
    <div className="rounded-[var(--radius-card)] bg-white p-10 text-center shadow-[var(--shadow-card)]">
      <PawIcon className="mx-auto h-8 w-8 text-foreground/20" />
      <p className="mt-3 text-foreground/70">No results match your filters.</p>
      <Link href={resetHref} className="mt-2 inline-block text-brand-blue hover:underline">
        Reset filters
      </Link>
    </div>
  );
}
