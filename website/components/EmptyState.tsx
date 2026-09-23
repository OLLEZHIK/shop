import Link from "next/link";
import { PawIcon } from "./icons";

export function EmptyState({ resetHref }: { resetHref: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border-2 border-dashed border-line bg-surface p-10 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-orange-muted text-brand-orange">
        <PawIcon className="h-7 w-7" />
      </span>
      <p className="mt-4 font-heading text-lg font-bold text-foreground">Nothing here yet</p>
      <p className="mt-1 text-foreground/65">No places match these filters. Try another district or pet.</p>
      <Link
        href={resetHref}
        className="mt-5 inline-flex min-h-11 items-center rounded-[var(--radius-pill)] bg-ink px-5 font-semibold text-white transition hover:bg-brand-blue"
      >
        Reset filters
      </Link>
    </div>
  );
}
