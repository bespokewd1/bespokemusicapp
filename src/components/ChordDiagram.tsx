// frets: low E -> high e. -1 = muted, 0 = open
export const CHORDS: { name: string; frets: number[]; type: string }[] = [
  { name: "C", frets: [-1, 3, 2, 0, 1, 0], type: "Major" },
  { name: "D", frets: [-1, -1, 0, 2, 3, 2], type: "Major" },
  { name: "E", frets: [0, 2, 2, 1, 0, 0], type: "Major" },
  { name: "G", frets: [3, 2, 0, 0, 0, 3], type: "Major" },
  { name: "A", frets: [-1, 0, 2, 2, 2, 0], type: "Major" },
  { name: "F", frets: [1, 3, 3, 2, 1, 1], type: "Major" },
  { name: "Am", frets: [-1, 0, 2, 2, 1, 0], type: "Minor" },
  { name: "Em", frets: [0, 2, 2, 0, 0, 0], type: "Minor" },
  { name: "Dm", frets: [-1, -1, 0, 2, 3, 1], type: "Minor" },
  { name: "Bm", frets: [-1, 2, 4, 4, 3, 2], type: "Minor" },
  { name: "B7", frets: [-1, 2, 1, 2, 0, 2], type: "7th" },
  { name: "A7", frets: [-1, 0, 2, 0, 2, 0], type: "7th" },
  { name: "D7", frets: [-1, -1, 0, 2, 1, 2], type: "7th" },
  { name: "E7", frets: [0, 2, 0, 1, 0, 0], type: "7th" },
  { name: "Cadd9", frets: [-1, 3, 2, 0, 3, 0], type: "Add" },
];

export function ChordDiagram({ name, frets }: { name: string; frets: number[] }) {
  const W = 100, H = 120, x0 = 15, y0 = 22, sw = 14, fh = 18;
  return (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-3 shadow-soft">
      <span className="font-display text-xl font-semibold">{name}</span>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[120px]" aria-label={`${name} chord diagram`}>
        <rect x={x0} y={y0 - 3} width={sw * 5} height={3} className="fill-foreground" />
        {[0, 1, 2, 3, 4].map((f) => (
          <line key={f} x1={x0} x2={x0 + sw * 5} y1={y0 + f * fh} y2={y0 + f * fh} className="stroke-muted-foreground" strokeWidth={1} />
        ))}
        {[0, 1, 2, 3, 4, 5].map((s) => (
          <line key={s} x1={x0 + s * sw} x2={x0 + s * sw} y1={y0} y2={y0 + 4 * fh} className="stroke-foreground" strokeWidth={1} />
        ))}
        {frets.map((f, s) => {
          const x = x0 + s * sw;
          if (f === -1) return <text key={s} x={x} y={y0 - 8} textAnchor="middle" fontSize={9} className="fill-muted-foreground">×</text>;
          if (f === 0) return <circle key={s} cx={x} cy={y0 - 10} r={3} fill="none" className="stroke-foreground" />;
          return <circle key={s} cx={x} cy={y0 + (f - 0.5) * fh} r={5.5} className="fill-primary" />;
        })}
      </svg>
    </div>
  );
}
