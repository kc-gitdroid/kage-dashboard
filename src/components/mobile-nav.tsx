"use client";

import Link from "next/link";
import { mobileNavigation } from "@/data";

type MobileNavProps = {
  currentPath: string;
};

export function MobileNav({ currentPath }: MobileNavProps) {
  return (
    <div className="pointer-events-auto fixed inset-x-0 bottom-0 z-40 border-t border-line/80 bg-canvas/92 px-2.5 py-2 backdrop-blur-xl lg:hidden">
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {mobileNavigation.map((item) => {
          const active = item.href === currentPath;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`min-w-[78px] touch-manipulation rounded-xl border px-2.5 py-2 text-center ${
                active ? "border-ink/20 bg-ink text-canvas" : "border-line/70 bg-panel/70 text-mute"
              }`}
            >
              <span className="block font-display text-[9px] uppercase tracking-[0.14em]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
