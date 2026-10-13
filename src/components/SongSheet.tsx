import { parseLine, transposeChord, type Section } from "@/lib/songs";
import { toNashville } from "@/lib/nashville";

export function SongSheet({ sections, fontSize = 18, transpose = 0, nashvilleKey }: { sections: Section[]; fontSize?: number; transpose?: number; nashvilleKey?: string | null }) {
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
                      {seg.chord ? (nashvilleKey ? toNashville(transposeChord(seg.chord, transpose), nashvilleKey) : transposeChord(seg.chord, transpose)) : "\u00a0"}
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
