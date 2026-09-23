"use client";

import { useState } from "react";

interface PhotoGalleryProps {
  photoUrls: string[];
  alt: string;
  /** "card" = small square area for listing cards. "detail" = wide area
   *  for the business page (1 large + thumbnails when there's more than
   *  one photo). Shared between components/BusinessCard.tsx and
   *  app/business/[slug]/page.tsx - not two separate implementations. */
  variant?: "card" | "detail";
  className?: string;
}

export function PhotoGallery({ photoUrls, alt, variant = "card", className }: PhotoGalleryProps) {
  const [index, setIndex] = useState(0);

  if (photoUrls.length === 0) {
    return <PhotoPlaceholder variant={variant} className={className} />;
  }

  if (variant === "detail" && photoUrls.length > 1) {
    const thumbs = photoUrls.slice(1, 5);
    return (
      <div className={`grid grid-cols-4 gap-2 ${className ?? ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrls[0]}
          alt={alt}
          className="col-span-4 aspect-video w-full rounded-[var(--radius-card)] object-cover sm:col-span-3 sm:row-span-2 sm:aspect-auto sm:h-full"
        />
        {thumbs.map((url) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={url}
            src={url}
            alt={alt}
            className="hidden aspect-square w-full rounded-[var(--radius-control)] object-cover sm:block"
          />
        ))}
      </div>
    );
  }

  const aspect = variant === "card" ? "aspect-square" : "aspect-video";

  return (
    <div className={`relative overflow-hidden rounded-[var(--radius-card)] ${aspect} ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photoUrls[index]} alt={alt} className="h-full w-full object-cover" />
      {photoUrls.length > 1 && (
        <div className="pointer-events-auto absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
          {photoUrls.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setIndex(i);
              }}
              aria-label={`Photo ${i + 1} of ${photoUrls.length}`}
              className={`h-1.5 w-1.5 rounded-full transition ${i === index ? "bg-white" : "bg-white/50"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// A single paw print, drawn as a <g> (not a <symbol>+<use> with an id -
// this component renders on every card in a listing, and duplicate ids
// in the same document would make the browser resolve <use> references
// unpredictably).
function PawMark({ transform, opacity = 1 }: { transform?: string; opacity?: number }) {
  return (
    <g transform={transform} opacity={opacity}>
      <ellipse cx="10" cy="13.2" rx="4.2" ry="3.4" />
      <ellipse cx="4.6" cy="8.6" rx="1.7" ry="2.1" />
      <ellipse cx="8.3" cy="5.8" rx="1.6" ry="2" />
      <ellipse cx="11.7" cy="5.8" rx="1.6" ry="2" />
      <ellipse cx="15.4" cy="8.6" rx="1.7" ry="2.1" />
    </g>
  );
}

// Tiled paw-print pattern so the placeholder reads as a deliberate brand
// texture (several clearly visible paws at different scales/rotations)
// rather than the single faint icon lost in a gradient it replaces.
function PhotoPlaceholder({ variant, className }: { variant: "card" | "detail"; className?: string }) {
  const aspect = variant === "card" ? "aspect-square" : "aspect-video";
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-[var(--radius-card)] ${aspect} ${className ?? ""}`}
      style={{
        background: "linear-gradient(135deg, var(--brand-orange-muted), var(--brand-blue-muted))",
      }}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full text-white" fill="currentColor" aria-hidden="true">
        <PawMark transform="translate(-2 2) scale(0.7) rotate(-18 10 13)" opacity={0.35} />
        <PawMark transform="translate(76 -4) scale(0.85) rotate(22 10 13)" opacity={0.35} />
        <PawMark transform="translate(-6 68) scale(0.8) rotate(12 10 13)" opacity={0.35} />
        <PawMark transform="translate(74 74) scale(0.9) rotate(-15 10 13)" opacity={0.35} />
        <PawMark transform="translate(32 -10) scale(0.6) rotate(8 10 13)" opacity={0.3} />
      </svg>
      <svg viewBox="0 0 20 20" fill="currentColor" className="relative h-10 w-10 text-white drop-shadow-sm" aria-hidden="true">
        <PawMark />
      </svg>
    </div>
  );
}
