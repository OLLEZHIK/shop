// Soft, out-of-focus color underneath a page's content - two or three
// organic blob shapes in muted brand tones, blurred and low-opacity.
// Purely decorative: aria-hidden, no pointer events, sits behind
// everything else on the page. Reused wherever the brief calls for an
// "ambient" backdrop (homepage hero, business detail page) instead of
// being redrawn per page.
export function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -left-24 -top-32 h-[420px] w-[420px] opacity-[0.14] blur-3xl"
        style={{
          background: "var(--brand-orange)",
          borderRadius: "42% 58% 63% 37% / 41% 45% 55% 59%",
        }}
      />
      <div
        className="absolute -right-32 top-10 h-[360px] w-[360px] opacity-[0.12] blur-3xl"
        style={{
          background: "var(--brand-blue)",
          borderRadius: "63% 37% 41% 59% / 51% 44% 56% 49%",
        }}
      />
      <div
        className="absolute left-1/3 top-[55%] h-[300px] w-[300px] opacity-[0.10] blur-3xl"
        style={{
          background: "var(--brand-green)",
          borderRadius: "55% 45% 37% 63% / 49% 59% 41% 51%",
        }}
      />
    </div>
  );
}
