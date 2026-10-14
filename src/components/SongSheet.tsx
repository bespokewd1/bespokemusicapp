import { isNoteLine, isTabLine, parseLine, transposeChord, type Section } from "@/lib/songs";
import { toNashville } from "@/lib/nashville";
import { findChord } from "@/lib/chords";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ChordDiagram } from "./ChordDiagram";
import { useT } from "@/lib/i18n";

type Block = { kind: "lyrics" | "tab" | "note"; lines: string[] };

/** Group a section's lines into consecutive blocks of the same content type. */
export function toBlocks(lines: string[]): Block[] {
  const out: Block[] = [];
  for (const line of lines) {
    const kind: Block["kind"] = isTabLine(line) ? "tab" : isNoteLine(line) ? "note" : "lyrics";
    const last = out.at(-1);
    if (last && last.kind === kind && kind !== "lyrics") last.lines.push(line);
    else out.push({ kind, lines: [line] });
  }
  return out;
}

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
  onChord?: ((chord: string) => void) | undefined;
}) {
  const { t } = useT();
  return (
    <div className="min-w-0 max-w-full space-y-8" style={{ fontSize }}>
      {sections.map((sec, i) => (
        <section key={i} id={`sec-${i}`} className="min-w-0 scroll-mt-32">
          <h3 className="mb-3 flex items-center gap-3 text-[0.7em] font-semibold uppercase tracking-[0.2em] text-accent-foreground">
            <span className="min-w-0 break-words">{sec.name}</span>
            <span className="fret-line h-px flex-1" />
          </h3>
          <div className="space-y-3">
            {toBlocks(sec.lines).map((block, j) =>
              block.kind === "tab" ? (
                <div key={j}>
                  <pre
                    className="overflow-x-auto overscroll-x-contain rounded-xl border border-border bg-secondary/40 p-3 font-mono text-[0.72em] leading-snug [touch-action:pan-x_pan-y]"
                    aria-label={t("Guitar tab")}
                  >{block.lines.join("\n")}</pre>
                  {transpose !== 0 && <p className="mt-1 text-[0.65em] text-muted-foreground">{t("Tabs show fret positions and are not transposed.")}</p>}
                </div>
              ) : block.kind === "note" ? (
                <p key={j} className="whitespace-pre-wrap break-words border-l-2 border-primary/40 pl-3 text-[0.8em] italic text-muted-foreground">
                  {block.lines.map((l) => l.replace(/^\s*>\s?/, "")).join("\n")}
                </p>
              ) : (
                <div key={j} className="flex min-w-0 flex-wrap items-end leading-tight">
                  {parseLine(block.lines[0]!).map((seg, k) => {
                    const real = seg.chord ? transposeChord(seg.chord, transpose) : "";
                    const shown = real ? (nashvilleKey ? toNashville(real, nashvilleKey) : real) : "\u00a0";
                    return (
                      <span key={k} className="inline-flex min-w-0 max-w-full flex-col">
                        {real && onChord ? (
                          <ChordButton chord={real} shown={shown} onChord={onChord} />
                        ) : (
                          <span className="min-h-[1.25em] pr-2 font-mono text-[0.85em] font-bold text-primary">{shown}</span>
                        )}
                        <span className="whitespace-pre-wrap break-words">{seg.text || "\u00a0"}</span>
                      </span>
                    );
                  })}
                </div>
              ),
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

function ChordButton({ chord, shown, onChord }: { chord: string; shown: string; onChord: (c: string) => void }) {
  const info = findChord(chord);
  const btn = (
    <button
      type="button"
      onClick={() => onChord(chord)}
      aria-label={`Show ${chord} chord diagram`}
      className="min-h-[1.25em] self-start rounded pr-2 text-left font-mono text-[0.85em] font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
    >
      {shown}
    </button>
  );
  if (!info?.voicings[0]) return btn;
  return (
    <HoverCard openDelay={120} closeDelay={60}>
      <HoverCardTrigger asChild>{btn}</HoverCardTrigger>
      <HoverCardContent className="w-auto p-3 text-base" side="top">
        <ChordDiagram name={info.name} voicing={info.voicings[0]} size="sm" />
      </HoverCardContent>
    </HoverCard>
  );
}
