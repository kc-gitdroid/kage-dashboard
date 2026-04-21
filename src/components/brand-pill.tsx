type BrandPillProps = {
  color: string;
  children: React.ReactNode;
  className?: string;
};

export function BrandPill({ color, children, className = "" }: BrandPillProps) {
  return (
    <span
      className={`ui-pill max-w-full border text-center font-display text-[10px] uppercase tracking-[0.18em] ${className}`}
      style={{
        color,
        borderColor: `${color}38`,
        backgroundColor: `${color}16`,
      }}
    >
      {children}
    </span>
  );
}
