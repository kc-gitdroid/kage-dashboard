"use client";

import Link from "next/link";
import { mobileNavigation } from "@/data";

type MobileNavProps = {
  currentPath: string;
};

export function MobileNav({ currentPath }: MobileNavProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/6 bg-canvas/94 px-3 py-2.5 backdrop-blur lg:hidden pointer-events-auto">
      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {mobileNavigation.map((item) => {
          const active = item.href === currentPath;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`min-w-[84px] touch-manipulation rounded-[18px] border px-3 py-2.5 text-center ${
                active ? "border-blue/30 bg-blue/8 text-ink" : "border-white/6 bg-white/[0.02] text-mute"
              }`}
            >
              <span className="block font-display text-[10px] uppercase tracking-[0.18em]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
