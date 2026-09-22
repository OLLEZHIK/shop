"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDownIcon } from "./icons";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  ariaLabel: string;
  placeholder: string;
  value: string | null;
  options: DropdownOption[];
  onChange: (value: string) => void;
  className?: string;
}

export function Dropdown({ ariaLabel, placeholder, value, options, onChange, className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-[var(--radius-control)] border-2 border-gray-200 bg-white px-4 py-3 text-left text-sm transition-colors hover:border-brand-blue-muted-border focus-visible:border-brand-blue"
      >
        {selected?.icon}
        <span className={selected ? "flex-1 text-foreground" : "flex-1 text-foreground/50"}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDownIcon className={`h-4 w-4 text-foreground/50 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-[var(--radius-control)] bg-white py-1.5 shadow-[var(--shadow-panel)]"
        >
          {options.map((option) => (
            <li key={option.value} role="option" aria-selected={option.value === value}>
              <button
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-brand-blue-muted hover:text-brand-blue"
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
