"use client";

import Link from "next/link";
import { navigation } from "@/data";

type SidebarProps = {
  currentPath: string;
};

export function Sidebar({ currentPath }: SidebarProps) {
  return (
    <aside className="hidden w-[14rem] shrink-0 flex-col bg-panel/28 px-2.5 py-3.5 lg:flex">
      <div className="mb-3 px-2">
        <p className="ui-micro-label">Workspace Index</p>
      </div>
      <nav className="space-y-1">
        {navigation.map((item) => {
          const active = item.href === currentPath;
          const disabled = item.href.startsWith("#");

          const content = (
            <div
              className={`flex items-center justify-between rounded-xl border px-3 py-2.5 transition ${
                active
                  ? "border-ink/20 bg-ink text-canvas"
                  : "border-transparent text-mute hover:border-line hover:bg-panel hover:text-ink"
              } ${disabled ? "opacity-55" : ""}`}
            >
              <span className="font-display text-[10px] uppercase tracking-[0.2em]">{item.label}</span>
              <span className="font-display text-[9px] opacity-65">{item.marker}</span>
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

    </aside>
  );
}
