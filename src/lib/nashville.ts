const PC: Record<string, number> = {
  C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11, Cb: 11, "E#": 5, Fb: 4, "B#": 0,
};
const DEGREE = ["1", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7"];

/** Root pitch class of a key or chord like "G", "Em", "F#m7". */
export function rootOf(name: string): number | null {
  const m = name.trim().match(/^([A-G][#b]?)/);
  return m ? (PC[m[1]!] ?? null) : null;
}

export function isValidKey(key: string): boolean {
  return /^[A-G][#b]?m?$/.test(key.trim());
}

function degree(note: string, tonic: number): string | null {
  const pc = rootOf(note);
  return pc === null ? null : DEGREE[(pc - tonic + 12) % 12]!;
}

/** Convert a chord symbol to a Nashville number relative to the key's tonic. G in G → 1, Em → 6m, D/F# → 5/7. */
export function toNashville(chord: string, key: string): string {
  const tonic = rootOf(key);
  if (tonic === null) return chord;
  const [main = "", bass] = chord.split("/");
  const m = main.match(/^([A-G][#b]?)(.*)$/);
  if (!m) return chord;
  const num = degree(m[1]!, tonic);
  if (!num) return chord;
  let out = num + m[2]!;
  if (bass) out += "/" + (degree(bass, tonic) ?? bass);
  return out;
}

export const KEY_OPTIONS = ["C", "C#", "Db", "D", "Eb", "E", "F", "F#", "Gb", "G", "Ab", "A", "Bb", "B", "Cm", "C#m", "Dm", "Ebm", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "Bbm", "Bm"];
