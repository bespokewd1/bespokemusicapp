import { parseLine, transposeChord, type Section } from "@/lib/songs";

export function SongSheet({ sections, fontSize = 18, transpose = 0 }: { sections: Section[]; fontSize?: number; transpose?: number }) {
  return (
    <div className="space-y-8" style={{ fontSize }}>
      {sections.map((sec, i) => (
        <section key={i}>
          <h3 className="mb-3 flex items-center gap-3 text-[0.7em] font-semibold uppercase tracking-[0.2em] text-accent-foreground">
            {sec.name}
            <span className="fret-line h-px flex-1" />
          </h3>
          <div className="space-y-3">
            {sec.lines.map((line, j) => (
              <div key={j} className="flex flex-wrap items-end leading-tight">
                {parseLine(line).map((seg, k) => (
                  <span key={k} className="inline-flex flex-col">
                    <span className="min-h-[1.25em] pr-2 font-mono text-[0.85em] font-bold text-primary">
                      {seg.chord ? transposeChord(seg.chord, transpose) : "\u00a0"}
                    </span>
                    <span className="whitespace-pre">{seg.text || "\u00a0"}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
