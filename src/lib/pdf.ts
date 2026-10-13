import { parseLine, transposeChord, uniqueChords, type Song } from "./songs";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function lineHtml(line: string, transpose: number) {
  const segs = parseLine(line);
  const cells = segs
    .map((seg) => {
      const chord = seg.chord ? transposeChord(seg.chord, transpose) : "";
      const w = Math.max(chord.length, seg.text.length, 1);
      return `<span class="seg" style="min-width:${w}ch"><span class="ch">${esc(chord)}</span><span class="tx">${esc(seg.text) || "&nbsp;"}</span></span>`;
    })
    .join("");
  return `<div class="line">${cells}</div>`;
}

export function exportSongPdf(song: Song, opts: { transpose?: number; notes?: string } = {}) {
  const tr = opts.transpose ?? 0;
  const chords = uniqueChords(song).map((c) => transposeChord(c, tr));
  const sections = song.sections
    .map((sec) => `<h2>${esc(sec.name)}</h2>${sec.lines.map((l) => lineHtml(l, tr)).join("")}`)
    .join("");
  const notes = opts.notes?.trim()
    ? `<h2>Notes</h2><p class="notes">${esc(opts.notes).replace(/\n/g, "<br>")}</p>`
    : "";

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(song.title)} — ${esc(song.artist)}</title>
<style>
  @page { margin: 18mm; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #1c1917; max-width: 700px; margin: 0 auto; }
  h1 { font-size: 26px; margin: 0 0 2px; }
  .artist { font-size: 15px; color: #57534e; margin: 0 0 10px; }
  .meta { font-size: 12px; color: #57534e; margin-bottom: 6px; }
  .chips { margin-bottom: 18px; }
  .chip { display: inline-block; font-family: ui-monospace, monospace; font-weight: 700; font-size: 12px; border: 1px solid #d6d3d1; border-radius: 4px; padding: 1px 6px; margin: 0 4px 4px 0; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #9a3412; margin: 18px 0 6px; }
  .line { font-family: ui-monospace, 'Courier New', monospace; font-size: 13px; line-height: 1.15; margin-bottom: 10px; page-break-inside: avoid; }
  .seg { display: inline-block; vertical-align: bottom; }
  .ch { display: block; font-weight: 700; color: #9a3412; min-height: 1em; }
  .tx { display: block; white-space: pre; }
  .notes { font-size: 13px; white-space: pre-wrap; }
  .brand { margin-top: 28px; font-size: 10px; color: #a8a29e; text-align: center; }
</style></head><body>
<h1>${esc(song.title)}</h1>
<p class="artist">${esc(song.artist)}</p>
<p class="meta">Key: ${esc(transposeChord(song.key, tr))} · Capo: ${song.capo ? `Fret ${song.capo}` : "None"} · Level: ${esc(song.difficulty)} · Tempo: ${song.tempo} bpm</p>
<div class="chips">${chords.map((c) => `<span class="chip">${esc(c)}</span>`).join("")}</div>
${sections}
${notes}
<p class="brand">Exported from Bespoke Music — Your Personal Guitar Songbook</p>
</body></html>`;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.srcdoc = html;
  document.body.appendChild(iframe);
  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => iframe.remove(), 60_000);
    }, 50);
  };
}
