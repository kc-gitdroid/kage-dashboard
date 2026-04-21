"use client";

import { ReactNode, useEffect } from "react";

type PreviewDrawerProps = {
  open: boolean;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
};

export function PreviewDrawer({ open, title, eyebrow, subtitle, onClose, children }: PreviewDrawerProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyOverscroll = document.body.style.overscrollBehavior;
    const previousBodyTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.body.style.touchAction = "pan-y";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.overscrollBehavior = previousBodyOverscroll;
      document.body.style.touchAction = previousBodyTouchAction;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-x-hidden overscroll-x-none">
      <button
        type="button"
        aria-label="Close preview"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside className="modal-sheet absolute bottom-0 left-1/2 flex max-h-[min(90vh,calc(100dvh-1rem))] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] -translate-x-1/2 flex-col overflow-x-hidden overflow-y-hidden rounded-t-[24px] border border-white/8 bg-canvas px-4 pt-4 shadow-panel md:inset-y-0 md:right-0 md:left-auto md:w-[30rem] md:max-h-none md:max-w-[92vw] md:translate-x-0 md:rounded-none md:rounded-l-[24px] md:px-5 md:pt-5">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/6 pb-4">
          <div>
            {eyebrow && <p className="font-display text-[10px] uppercase tracking-[0.28em] text-mute">{eyebrow}</p>}
            <h2 className="mt-2 text-lg font-semibold text-ink">{title}</h2>
            {subtitle && <p className="mt-2 text-sm leading-6 text-mute">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 min-w-[3.6rem] shrink-0 items-center justify-center rounded-full border border-white/8 px-3 text-center text-[11px] leading-none text-mute transition hover:border-white/14 hover:text-ink"
          >
            <span className="block leading-none">Close</span>
          </button>
        </div>
        <div className="modal-sheet__body mt-4 min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
          <div className="space-y-4 pr-1">{children}</div>
        </div>
      </aside>
    </div>
  );
}
