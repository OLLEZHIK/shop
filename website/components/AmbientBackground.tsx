// A single blurred paw silhouette - shares the same ellipse cluster as
// icons.tsx's PawIcon/PhotoGallery's PawMark, just scaled way up and run
// through a blur filter so it reads as an out-of-focus shape, not a crisp
// icon.
function PawSilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <ellipse cx="10" cy="13.2" rx="4.2" ry="3.4" />
      <ellipse cx="4.6" cy="8.6" rx="1.7" ry="2.1" />
      <ellipse cx="8.3" cy="5.8" rx="1.6" ry="2" />
      <ellipse cx="11.7" cy="5.8" rx="1.6" ry="2" />
      <ellipse cx="15.4" cy="8.6" rx="1.7" ry="2.1" />
    </svg>
  );
}

// Soft, out-of-focus color underneath a page's content - blurred,
// low-opacity paw silhouettes in muted brand tones (previously plain
// amorphous blobs, which didn't read as "pawenn" at all up close).
// Purely decorative: aria-hidden, no pointer events, sits behind
// everything else on the page. Reused wherever the brief calls for an
// "ambient" backdrop (homepage hero, business detail page) instead of
// being redrawn per page.
export function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <PawSilhouette
        className="absolute -left-28 -top-36 h-[440px] w-[440px] rotate-[-22deg] text-brand-orange opacity-[0.16] blur-3xl"
      />
      <PawSilhouette
        className="absolute -right-36 top-4 h-[380px] w-[380px] rotate-[18deg] text-brand-blue opacity-[0.14] blur-3xl"
      />
      <PawSilhouette
        className="absolute left-1/3 top-[52%] h-[320px] w-[320px] rotate-[8deg] text-brand-green opacity-[0.12] blur-3xl"
      />
    </div>
  );
}
