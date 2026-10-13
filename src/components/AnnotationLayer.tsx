import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Stroke } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Coordinates are stored in a stable space where content width = 1000 units. */
const W = 1000;

export type Tool = { kind: "pen"; color: string } | { kind: "eraser" };

function pathD(pts: [number, number][]) {
  if (!pts.length) return "";
  return pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ") + (pts.length === 1 ? " l0.1 0" : "");
}

export function AnnotationLayer({ strokes, onChange, active, tool, children }: {
  strokes: Stroke[]; onChange: (s: Stroke[]) => void; active: boolean; tool: Tool; children: ReactNode;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(W);
  const [draft, setDraft] = useState<Stroke | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setH((el.offsetHeight / Math.max(1, el.offsetWidth)) * W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const point = (e: React.PointerEvent): [number, number] => {
    const r = wrap.current!.getBoundingClientRect();
    const k = W / r.width;
    return [(e.clientX - r.left) * k, (e.clientY - r.top) * k];
  };
  const erase = (p: [number, number]) => {
    const next = strokes.filter((s) => !s.pts.some(([x, y]) => Math.hypot(x - p[0], y - p[1]) < 14));
    if (next.length !== strokes.length) onChange(next);
  };

  return (
    <div ref={wrap} className="relative">
      {children}
      <svg
        viewBox={`0 0 ${W} ${h}`}
        className={cn("absolute inset-0 h-full w-full", active ? "cursor-crosshair touch-none" : "pointer-events-none")}
        onPointerDown={(e) => {
          if (!active) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          const p = point(e);
          if (tool.kind === "eraser") erase(p);
          else setDraft({ color: tool.color, w: tool.color === "#facc15" ? 14 : 3, pts: [p] });
        }}
        onPointerMove={(e) => {
          if (!active || e.buttons === 0) return;
          const p = point(e);
          if (tool.kind === "eraser") erase(p);
          else setDraft((d) => (d ? { ...d, pts: [...d.pts, p] } : d));
        }}
        onPointerUp={() => {
          if (draft) onChange([...strokes, draft]);
          setDraft(null);
        }}
        onPointerCancel={() => setDraft(null)}
      >
        {[...strokes, ...(draft ? [draft] : [])].map((s, i) => (
          <path key={i} d={pathD(s.pts)} fill="none" stroke={s.color} strokeWidth={s.w} strokeLinecap="round" strokeLinejoin="round" opacity={s.w > 8 ? 0.45 : 1} />
        ))}
      </svg>
    </div>
  );
}
