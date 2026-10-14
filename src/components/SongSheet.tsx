import { parseLine, transposeChord, type Section } from "@/lib/songs";
import { toNashville } from "@/lib/nashville";

export function SongSheet({
  sections,
  fontSize = 18,
  transpose = 0,
  nashvilleKey,
  onChord,
}: {
  sections: Section[];
  fontSize?: number;
  transpose?: number;
  nashvilleKey?: string | null;
  onChord?: (chord: string) => void;
}) {
  return (
    <div className="space-y-8" style={{ fontSize }}>
      {sections.map((sec, i) => (
        <section key={i} id={`sec-${i}`} className="scroll-mt-32">
          <h3 className="mb-3 flex items-center gap-3 text-[0.7em] font-semibold uppercase tracking-[0.2em] text-accent-foreground">
            {sec.name}
            <span className="fret-line h-px flex-1" />
          </h3>
          <div className="space-y-3">
            {sec.lines.map((line, j) => (
              <div key={j} className="flex flex-wrap items-end leading-tight">
                {parseLine(line).map((seg, k) => {
                  const real = seg.chord ? transposeChord(seg.chord, transpose) : "";
                  const shown = real ? (nashvilleKey ? toNashville(real, nashvilleKey) : real) : "\u00a0";
                  return (
                    <span key={k} className="inline-flex flex-col">
                      {real && onChord ? (
                        <button
                          type="button"
                          onClick={() => onChord(real)}
                          aria-label={`Show ${real} chord diagram`}
                          className="min-h-[1.25em] self-start rounded pr-2 text-left font-mono text-[0.85em] font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                        >
                          {shown}
                        </button>
                      ) : (
                        <span className="min-h-[1.25em] pr-2 font-mono text-[0.85em] font-bold text-primary">{shown}</span>
                      )}
                      <span className="whitespace-pre">{seg.text || "\u00a0"}</span>
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
