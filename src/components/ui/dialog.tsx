"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { IconClose } from "./icons";
import { useApp } from "@/components/providers";

/** Accessible modal built on the native <dialog> (focus trap, Esc, inert background). */
export default function Dialog({ open, onClose, label, children, wide }: { open: boolean; onClose: () => void; label: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { t } = useApp();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className="vx-sheet m-auto max-h-[92dvh] w-full overflow-auto overscroll-contain border border-line bg-bg p-0 text-fg backdrop:bg-black/70 backdrop:backdrop-blur-sm max-md:mb-0 max-md:mt-auto max-md:max-h-[90dvh] max-md:!w-full max-md:max-w-none max-md:border-x-0 max-md:border-b-0"
      style={{ width: `min(96vw, ${wide ? 1100 : 760}px)` }}
    >
      {open && (
        <div className="relative">
          <button className="icon-btn absolute end-3 top-3 z-10" onClick={onClose} aria-label={t("nav.close")}><IconClose /></button>
          {children}
        </div>
      )}
    </dialog>
  );
}
