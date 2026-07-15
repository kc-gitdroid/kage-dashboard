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

export function Panel({
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
  headerAction,
}: PanelProps) {
  return (
    <section
      className={`min-w-0 max-w-full rounded-xl bg-panel/78 p-3 shadow-panel md:p-3.5 ${className}`}
    >
      {(eyebrow || title || subtitle) && (
        <header className="mb-2.5 space-y-1">
          {eyebrow && (
            <p className="ui-eyebrow">
              {eyebrow}
            </p>
          )}
          {(title || headerAction) && (
            <div className="flex items-start justify-between gap-3">
              {title ? <h2 className="text-balance text-[1.05rem] font-semibold tracking-[0.01em] text-ink md:text-xl">{title}</h2> : <div />}
              {headerAction}
            </div>
          )}
          {subtitle && <p className="max-w-2xl text-[13px] leading-5 text-mute md:text-sm">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
