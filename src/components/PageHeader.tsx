import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">{eyebrow}</p>}
        <h1 className="truncate font-display text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
      </div>
      {children}
    </div>
  );
}
