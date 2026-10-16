import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Stroke } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Coordinates are stored in a stable space where content width = 1000 units. */
const W = 1000;
/** The black pen follows the text colour so it stays visible in dark mode. */
export const INK = "#111827";

export type Tool = { kind: "pen"; color: string } | { kind: "eraser" };

function pathD(pts: [number, number][]) {
  if (!pts.length) return "";
  return pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ") + (pts.length === 1 ? " l0.1 0" : "");
}

/**
 * Strokes remember the song text size they were drawn at (`fs`) and are scaled
 * with it, so drawings follow the lyrics when Size or pinch-zoom changes.
 * Older strokes without `fs` render unscaled, as before.
 */
export function AnnotationLayer({ strokes, onChange, active, tool, fontSize, children }: {
  strokes: Stroke[]; onChange: (s: Stroke[]) => void; active: boolean; tool: Tool; fontSize: number; children: ReactNode;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(W);
  const [draft, setDraft] = useState<Stroke | null>(null);
  const draftRef = useRef<Stroke | null>(null);
  const pointers = useRef(new Set<number>());
  const strokesRef = useRef(strokes);
  strokesRef.current = strokes;

  const setD = (d: Stroke | null) => { draftRef.current = d; setDraft(d); };

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
  const scaleOf = (s: Stroke) => (s.fs ? fontSize / s.fs : 1);
  const erase = (p: [number, number]) => {
    const cur = strokesRef.current;
    const next = cur.filter((s) => {
      const k = scaleOf(s);
      return !s.pts.some(([x, y]) => Math.hypot(x * k - p[0], y * k - p[1]) < 14);
    });
    if (next.length !== cur.length) onChange(next);
  };
  const finish = () => {
    const d = draftRef.current;
    if (d) onChange([...strokesRef.current, d]);
    setD(null);
  };

  return (
    <div ref={wrap} className="relative">
      {children}
      <svg
        viewBox={`0 0 ${W} ${h}`}
        className={cn("absolute inset-0 h-full w-full", active ? "cursor-crosshair touch-none" : "pointer-events-none")}
        onPointerDown={(e) => {
          if (!active) return;
          pointers.current.add(e.pointerId);
          // A second finger means pinch, not drawing: drop the stroke in progress.
          if (pointers.current.size > 1) { setD(null); return; }
          if (e.pointerType === "mouse" && e.button !== 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          const p = point(e);
          if (tool.kind === "eraser") erase(p);
          else setD({ color: tool.color, w: tool.color === "#facc15" ? 14 : 3, pts: [p], fs: fontSize });
        }}
        onPointerMove={(e) => {
          if (!active || pointers.current.size !== 1 || !pointers.current.has(e.pointerId)) return;
          const p = point(e);
          if (tool.kind === "eraser") erase(p);
          else if (draftRef.current) setD({ ...draftRef.current, pts: [...draftRef.current.pts, p] });
        }}
        onPointerUp={(e) => { pointers.current.delete(e.pointerId); finish(); }}
        onPointerCancel={(e) => { pointers.current.delete(e.pointerId); setD(null); }}
      >
        {[...strokes, ...(draft ? [draft] : [])].map((s, i) => {
          const k = scaleOf(s);
          return (
            <path key={i} d={pathD(s.pts)} fill="none" stroke={s.color} strokeWidth={s.w} strokeLinecap="round" strokeLinejoin="round"
              opacity={s.w > 8 ? 0.45 : 1} transform={k !== 1 ? `scale(${k})` : undefined}
              style={s.color === INK ? { stroke: "var(--color-foreground)" } : undefined} />
          );
        })}
      </svg>
    </div>
  );
}
