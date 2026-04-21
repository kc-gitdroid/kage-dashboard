"use client";

import Link from "next/link";
import { navigation } from "@/data";

type SidebarProps = {
  currentPath: string;
};

export function Sidebar({ currentPath }: SidebarProps) {
  return (
    <aside className="hidden w-[17.5rem] flex-col border-r border-white/5 bg-black/12 px-4 py-5 lg:flex">
      <nav className="space-y-1.5">
        {navigation.map((item) => {
          const active = item.href === currentPath;
          const disabled = item.href.startsWith("#");

          const content = (
            <div
              className={`flex items-center justify-between rounded-[18px] border px-4 py-2.5 transition ${
                active
                  ? "border-blue/28 bg-blue/8 text-ink"
                  : "border-white/5 bg-white/[0.015] text-mute hover:border-white/8 hover:text-ink"
              } ${disabled ? "opacity-55" : ""}`}
            >
              <span className="font-display text-[10px] uppercase tracking-[0.26em]">{item.label}</span>
              <span className="text-xs">{item.marker}</span>
            </div>
          );

          return disabled ? (
            <div key={item.label}>{content}</div>
          ) : (
            <Link key={item.href} href={item.href}>
              {content}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[18px] border border-white/5 bg-panelMuted/92 p-4">
        <p className="font-display text-[10px] uppercase tracking-[0.24em] text-mute">System Notes</p>
        <p className="mt-2.5 text-sm leading-5 text-mute">
          Blueprint defines truth. Guidelines define execution. World defines the recurring universe.
        </p>
      </div>
    </aside>
  );
}
