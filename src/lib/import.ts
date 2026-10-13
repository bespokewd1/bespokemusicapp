// Deterministic chord-sheet import helpers (no AI). Kept separate from the UI so a
// licensed search/import API can later plug in by producing the same native text.

const CHORD_RE = /^[A-G](#|b)?(maj|min|m|M|dim|aug|sus|add|°|\+)?\d{0,2}(sus\d?|add\d{1,2}|b5|#5|b9|#9|#11|b13)*(\/[A-G](#|b)?)?$/;
const SECTION_WORDS = /^(intro|verse|pre-?chorus|chorus|bridge|outro|interlude|solo|instrumental|hook|refrain|coda|tag|ending|breakdown)(\s*\d+)?$/i;
const FILLER = /^(\||\|\||x\d+|\(x\d+\)|-+|\/|N\.?C\.?|\(|\))$/i;

export function isChordToken(t: string) {
  return CHORD_RE.test(t.replace(/[()]/g, ""));
}

export function isChordLine(line: string) {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return false;
  const chords = tokens.filter(isChordToken);
  return chords.length > 0 && tokens.every((t) => isChordToken(t) || FILLER.test(t));
}

function heading(line: string): string | null {
  const t = line.trim();
  const bracket = t.match(/^[[{(]\s*([^\]})]+?)\s*[\]})]:?$/);
  if (bracket?.[1] && !isChordToken(bracket[1])) return bracket[1];
  const plain = t.replace(/:$/, "");
  if (SECTION_WORDS.test(plain)) return plain.charAt(0).toUpperCase() + plain.slice(1);
  return null;
}

function merge(chordLine: string, lyric: string) {
  const positions: { col: number; chord: string }[] = [];
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(chordLine))) if (isChordToken(m[0])) positions.push({ col: m.index, chord: m[0].replace(/[()]/g, "") });
  let out = lyric.padEnd(Math.max(lyric.length, (positions.at(-1)?.col ?? 0)), " ");
  for (let i = positions.length - 1; i >= 0; i--) {
    const { col, chord } = positions[i]!;
    out = out.slice(0, col) + `[${chord}]` + out.slice(col);
  }
  return out.replace(/\s+$/, "");
}

/** Convert chord-over-lyrics (or already-native) text into Bespoke native format. */
export function toNativeFormat(raw: string): string {
  const lines = raw.replace(/\r\n?/g, "\n").replace(/\t/g, "    ").split("\n").map((l) => l.replace(/\s+$/, ""));
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (/^\s*\{[^}]+\}\s*$/.test(line)) { out.push(line.trim()); continue; }
    const h = line.trim() ? heading(line) : null;
    if (h) {
      if (out.length && out.at(-1) !== "") out.push("");
      out.push(`{${h}}`);
      continue;
    }
    if (isChordLine(line)) {
      const next = lines[i + 1];
      if (next !== undefined && next.trim() && !isChordLine(next) && !heading(next)) {
        out.push(merge(line, next));
        i++;
      } else {
        out.push(line.trim().split(/\s+/).filter(isChordToken).map((c) => `[${c.replace(/[()]/g, "")}]`).join(" "));
      }
      continue;
    }
    out.push(line);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function ultimateGuitarSearchUrl(query: string) {
  return `https://www.ultimate-guitar.com/search.php?search_type=title&value=${encodeURIComponent(query.trim())}`;
}

export function isUltimateGuitarUrl(value: string) {
  try {
    const u = new URL(value.trim());
    return u.protocol === "https:" && (u.hostname === "www.ultimate-guitar.com" || u.hostname === "ultimate-guitar.com" || u.hostname === "tabs.ultimate-guitar.com");
  } catch {
    return false;
  }
}
