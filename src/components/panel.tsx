import { ReactNode } from "react";

type PanelProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  accent?: "blue" | "yellow" | "orange" | "lime" | "purple" | "cyan";
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
};

const accentMap = {
  blue: "border-blue/28",
  yellow: "border-yellow/28",
  orange: "border-orange/28",
  purple: "border-purple/28",
  cyan: "border-cyan/28",
  lime: "border-lime/28",
};

export function Panel({
  eyebrow,
  title,
  subtitle,
  accent,
  children,
  className = "",
  headerAction,
}: PanelProps) {
  return (
    <section
      className={`min-w-0 max-w-full rounded-[20px] border bg-panel/88 p-4 shadow-panel backdrop-blur-sm md:p-5 ${
        accent ? accentMap[accent] : "border-line"
      } ${className}`}
    >
      {(eyebrow || title || subtitle) && (
        <header className="mb-4 space-y-1.5 border-b border-white/5 pb-3.5">
          {eyebrow && (
            <p className="ui-eyebrow">
              {eyebrow}
            </p>
          )}
          {(title || headerAction) && (
            <div className="flex items-start justify-between gap-3">
              {title ? <h2 className="text-balance text-lg font-semibold tracking-[0.015em] text-ink md:text-[1.35rem]">{title}</h2> : <div />}
              {headerAction}
            </div>
          )}
          {subtitle && <p className="max-w-2xl text-sm leading-5 text-mute">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
