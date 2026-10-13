import type { Voicing } from "@/lib/chords";

/** Six-string chord diagram with finger numbers, barres, O/X markers and start fret. */
export function ChordDiagram({ name, voicing, size = "md" }: { name: string; voicing: Voicing; size?: "sm" | "md" }) {
  const played = voicing.frets.filter((f): f is number => f !== null && f > 0);
  const max = played.length ? Math.max(...played) : 0;
  const base = max > 4 ? Math.min(...played) : 1;
  const ROWS = 5;
  const x0 = 18, y0 = 26, sw = 14, fh = 17;
  const W = x0 * 2 + sw * 5, H = y0 + fh * ROWS + 8;
  const xs = (s: number) => x0 + s * sw;
  const yc = (f: number) => y0 + (f - base + 0.5) * fh;

  return (
    <figure className="flex flex-col items-center">
      <figcaption className={size === "sm" ? "font-display text-lg font-semibold" : "font-display text-xl font-semibold"}>{name}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className={size === "sm" ? "w-full max-w-[110px]" : "w-full max-w-[140px]"} role="img" aria-label={`${name} chord: ${voicing.frets.map((f) => (f === null ? "x" : f)).join(" ")}`}>
        {base === 1 ? (
          <rect x={xs(0)} y={y0 - 3} width={sw * 5} height={3.5} className="fill-foreground" />
        ) : (
          <text x={x0 - 6} y={yc(base) + 3.5} textAnchor="end" fontSize={9} className="fill-muted-foreground">{base}fr</text>
        )}
        {Array.from({ length: ROWS + 1 }).map((_, f) => (
          <line key={f} x1={xs(0)} x2={xs(5)} y1={y0 + f * fh} y2={y0 + f * fh} className="stroke-muted-foreground" strokeWidth={0.8} />
        ))}
        {[0, 1, 2, 3, 4, 5].map((s) => (
          <line key={s} x1={xs(s)} x2={xs(s)} y1={y0} y2={y0 + ROWS * fh} className="stroke-foreground" strokeWidth={0.9} />
        ))}
        {voicing.barre && (
          <rect x={xs(voicing.barre.from) - 5.5} y={yc(voicing.barre.fret) - 5.5} width={xs(voicing.barre.to) - xs(voicing.barre.from) + 11} height={11} rx={5.5} className="fill-primary" />
        )}
        {voicing.frets.map((f, s) => {
          const x = xs(s);
          if (f === null) return <text key={s} x={x} y={y0 - 9} textAnchor="middle" fontSize={10} className="fill-muted-foreground">×</text>;
          if (f === 0) return <circle key={s} cx={x} cy={y0 - 12} r={3.4} fill="none" strokeWidth={1.2} className="stroke-foreground" />;
          const finger = voicing.fingers[s] ?? 0;
          const onBarre = voicing.barre && voicing.barre.fret === f && s >= voicing.barre.from && s <= voicing.barre.to;
          return (
            <g key={s}>
              {!onBarre && <circle cx={x} cy={yc(f)} r={6} className="fill-primary" />}
              {finger > 0 && (!onBarre || s === voicing.barre!.from) && (
                <text x={x} y={yc(f) + 3.2} textAnchor="middle" fontSize={8.5} fontWeight={700} className="fill-primary-foreground">{finger}</text>
              )}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
