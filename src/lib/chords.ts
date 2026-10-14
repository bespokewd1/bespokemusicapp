/* Structured guitar chord voicings (standard tuning, low E → high e).
 * frets: "x" muted, "0" open, digit = fret. fingers: 0 = none, 1–4 = finger.
 * barre: "fret:fromString-toString" using string indexes 0 (low E) … 5 (high e).
 * Shapes are the standard, widely published open and barre voicings. */

export type ChordCategory = "Major" | "Minor" | "7th" | "Maj7" | "Min7" | "Sus" | "Add9" | "6th" | "Dim" | "Aug" | "Slash";

export interface Voicing {
  frets: (number | null)[]; // null = muted
  fingers: number[];
  barre?: { fret: number; from: number; to: number } | undefined;
  label?: "Triad" | undefined;
}

export interface Chord {
  name: string;
  category: ChordCategory;
  voicings: Voicing[];
}

function v(frets: string, fingers: string, barre?: string): Voicing {
  const b = barre?.match(/^(\d+):(\d)-(\d)$/);
  return {
    frets: frets.split("").map((c) => (c === "x" ? null : Number(c))),
    fingers: fingers.split("").map(Number),
    barre: b ? { fret: Number(b[1]), from: Number(b[2]), to: Number(b[3]) } : undefined,
  };
}

const RAW: [string, ChordCategory, Voicing[]][] = [
  // Major
  ["C", "Major", [v("x32010", "032010"), v("x35553", "013331", "3:1-5")]],
  ["C#", "Major", [v("x46664", "013331", "4:1-5")]],
  ["D", "Major", [v("xx0232", "000132"), v("x57775", "013331", "5:1-5")]],
  ["Eb", "Major", [v("x68886", "013331", "6:1-5")]],
  ["E", "Major", [v("022100", "023100"), v("x79997", "013331", "7:1-5")]],
  ["F", "Major", [v("133211", "134211", "1:0-5"), v("xx3211", "003211", "1:4-5")]],
  ["F#", "Major", [v("244322", "134211", "2:0-5")]],
  ["G", "Major", [v("320003", "210003"), v("320033", "210034"), v("355433", "134211", "3:0-5")]],
  ["Ab", "Major", [v("466544", "134211", "4:0-5")]],
  ["A", "Major", [v("x02220", "001230"), v("577655", "134211", "5:0-5")]],
  ["Bb", "Major", [v("x13331", "013331", "1:1-5")]],
  ["B", "Major", [v("x24442", "013331", "2:1-5"), v("799877", "134211", "7:0-5")]],
  // Minor
  ["Cm", "Minor", [v("x35543", "013421", "3:1-5")]],
  ["C#m", "Minor", [v("x46654", "013421", "4:1-5")]],
  ["Dm", "Minor", [v("xx0231", "000231"), v("x57765", "013421", "5:1-5")]],
  ["Ebm", "Minor", [v("x68876", "013421", "6:1-5")]],
  ["Em", "Minor", [v("022000", "023000"), v("x79987", "013421", "7:1-5")]],
  ["Fm", "Minor", [v("133111", "134111", "1:0-5")]],
  ["F#m", "Minor", [v("244222", "134111", "2:0-5")]],
  ["Gm", "Minor", [v("355333", "134111", "3:0-5")]],
  ["G#m", "Minor", [v("466444", "134111", "4:0-5")]],
  ["Am", "Minor", [v("x02210", "002310"), v("577555", "134111", "5:0-5")]],
  ["Bbm", "Minor", [v("x13321", "013421", "1:1-5")]],
  ["Bm", "Minor", [v("x24432", "013421", "2:1-5"), v("799777", "134111", "7:0-5")]],
  // Dominant 7th
  ["C7", "7th", [v("x32310", "032410")]],
  ["D7", "7th", [v("xx0212", "000213")]],
  ["E7", "7th", [v("020100", "020100"), v("022130", "023140")]],
  ["F7", "7th", [v("131211", "131211", "1:0-5")]],
  ["G7", "7th", [v("320001", "320001")]],
  ["A7", "7th", [v("x02020", "002030"), v("575655", "131211", "5:0-5")]],
  ["B7", "7th", [v("x21202", "021304")]],
  // Major 7th
  ["Cmaj7", "Maj7", [v("x32000", "032000")]],
  ["Dmaj7", "Maj7", [v("xx0222", "000111", "2:3-5")]],
  ["Emaj7", "Maj7", [v("021100", "031200")]],
  ["Fmaj7", "Maj7", [v("xx3210", "003210")]],
  ["Gmaj7", "Maj7", [v("320002", "320001")]],
  ["Amaj7", "Maj7", [v("x02120", "002130")]],
  // Minor 7th
  ["Am7", "Min7", [v("x02010", "002010"), v("575555", "131111", "5:0-5")]],
  ["Bm7", "Min7", [v("x24232", "013121", "2:1-5")]],
  ["Dm7", "Min7", [v("xx0211", "000211", "1:4-5")]],
  ["Em7", "Min7", [v("020000", "020000"), v("022030", "012040")]],
  ["F#m7", "Min7", [v("242222", "131111", "2:0-5")]],
  ["Gm7", "Min7", [v("353333", "131111", "3:0-5")]],
  ["Cm7", "Min7", [v("x35343", "013121", "3:1-5")]],
  // Suspended
  ["Asus2", "Sus", [v("x02200", "001200")]],
  ["Asus4", "Sus", [v("x02230", "001230")]],
  ["Dsus2", "Sus", [v("xx0230", "000130")]],
  ["Dsus4", "Sus", [v("xx0233", "000134")]],
  ["Esus4", "Sus", [v("022200", "023400")]],
  ["Csus4", "Sus", [v("x33011", "034011")]],
  ["Gsus4", "Sus", [v("330013", "230014")]],
  // Add9
  ["Cadd9", "Add9", [v("x32030", "021030")]],
  ["Gadd9", "Add9", [v("300203", "200103")]],
  ["Dadd9", "Add9", [v("xx0230", "000130")]],
  ["Eadd9", "Add9", [v("024100", "024100")]],
  // 6th
  ["C6", "6th", [v("x32210", "042310")]],
  ["D6", "6th", [v("xx0202", "000203")]],
  ["E6", "6th", [v("022120", "023140")]],
  ["G6", "6th", [v("320000", "210000")]],
  ["A6", "6th", [v("x02222", "001111", "2:2-5")]],
  // Diminished
  ["Bdim", "Dim", [v("x2343x", "012430")]],
  ["Cdim", "Dim", [v("x3424x", "023140")]],
  ["Ddim", "Dim", [v("xx0131", "000132")]],
  ["F#dim", "Dim", [v("2312xx", "231400")]],
  // Augmented
  ["Caug", "Aug", [v("x32110", "043120")]],
  ["Eaug", "Aug", [v("032110", "043120")]],
  ["Gaug", "Aug", [v("321003", "321004")]],
  ["Aaug", "Aug", [v("x03221", "004231")]],
  // Slash
  ["D/F#", "Slash", [v("200232", "100243")]],
  ["G/B", "Slash", [v("x20003", "010003")]],
  ["C/G", "Slash", [v("332010", "342010")]],
  ["C/E", "Slash", [v("032010", "032010")]],
  ["Am/G", "Slash", [v("302210", "402310")]],
  ["F/C", "Slash", [v("x33211", "034211", "1:4-5")]],
];

/* ---------- Generated movable shapes (CAGED barre shapes + triads) ---------- */
const PC: Record<string, number> = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
const OPEN = [4, 9, 2, 7, 11, 4]; // E A D G B e
export const STRING_PCS = OPEN;

/** Template: offsets from barre fret n (null = muted), fingers, barre strings, root open-string pitch class. */
type Tpl = { off: (number | null)[]; fingers: string; barre?: [number, number]; rootPc: number };
const E_ROOT = 4, A_ROOT = 9, D_ROOT = 2;
const TEMPLATES: Partial<Record<ChordCategory, Tpl[]>> = {
  Major: [
    { off: [0, 2, 2, 1, 0, 0], fingers: "134211", barre: [0, 5], rootPc: E_ROOT },
    { off: [null, 0, 2, 2, 2, 0], fingers: "013331", barre: [1, 5], rootPc: A_ROOT },
    { off: [null, null, 0, 2, 3, 2], fingers: "001243", rootPc: D_ROOT },
  ],
  Minor: [
    { off: [0, 2, 2, 0, 0, 0], fingers: "134111", barre: [0, 5], rootPc: E_ROOT },
    { off: [null, 0, 2, 2, 1, 0], fingers: "013421", barre: [1, 5], rootPc: A_ROOT },
    { off: [null, null, 0, 2, 3, 1], fingers: "001342", rootPc: D_ROOT },
  ],
  "7th": [
    { off: [0, 2, 0, 1, 0, 0], fingers: "131211", barre: [0, 5], rootPc: E_ROOT },
    { off: [null, 0, 2, 0, 2, 0], fingers: "013141", barre: [1, 5], rootPc: A_ROOT },
  ],
  Min7: [
    { off: [0, 2, 0, 0, 0, 0], fingers: "131111", barre: [0, 5], rootPc: E_ROOT },
    { off: [null, 0, 2, 0, 1, 0], fingers: "013121", barre: [1, 5], rootPc: A_ROOT },
  ],
  Maj7: [{ off: [null, 0, 2, 1, 2, 0], fingers: "013241", barre: [1, 5], rootPc: A_ROOT }],
};
const TRIAD_INTERVALS: Partial<Record<ChordCategory, number[]>> = { Major: [0, 4, 7], Minor: [0, 3, 7], Dim: [0, 3, 6], Aug: [0, 4, 8] };

export function chordRootPc(name: string): number | undefined {
  const m = name.match(/^([A-G][#b]?)/);
  return m ? PC[m[1]!] : undefined;
}

function fromTemplate(t: Tpl, root: number): Voicing | null {
  const n = (root - t.rootPc + 12) % 12;
  if (n === 0) return null; // that is the open chord, already listed
  return {
    frets: t.off.map((o) => (o === null ? null : o + n)),
    fingers: t.fingers.split("").map(Number),
    barre: t.barre ? { fret: n, from: t.barre[0], to: t.barre[1] } : undefined,
  };
}

/** Lowest-position 3-note triad on the G, B and high e strings (root, 3rd, 5th each once). */
export function triadVoicing(root: number, intervals: number[]): Voicing | undefined {
  const want = intervals.map((i) => (root + i) % 12);
  let best: number[] | undefined;
  for (let a = 0; a <= 12; a++) for (let b = 0; b <= 12; b++) for (let c = 0; c <= 12; c++) {
    const fr = [a, b, c];
    if (Math.max(...fr) - Math.min(...fr) > 3) continue;
    const pcs = fr.map((f, i) => (OPEN[3 + i]! + f) % 12);
    if (new Set(pcs).size !== 3 || !want.every((p) => pcs.includes(p))) continue;
    if (!best || Math.max(...fr) < Math.max(...best) || (Math.max(...fr) === Math.max(...best) && fr.reduce((x, y) => x + y) < best.reduce((x, y) => x + y))) best = fr;
  }
  if (!best) return undefined;
  const ranks = [...new Set(best.filter((f) => f > 0))].sort((x, y) => x - y);
  return {
    frets: [null, null, null, ...best],
    fingers: [0, 0, 0, ...best.map((f) => (f === 0 ? 0 : ranks.indexOf(f) + 1))],
    label: "Triad",
  };
}

function enrich(name: string, category: ChordCategory, base: Voicing[]): Voicing[] {
  const root = chordRootPc(name);
  if (root === undefined || name.includes("/")) return base;
  const out = [...base];
  const key = (v: Voicing) => v.frets.map((f) => (f === null ? "x" : f)).join(",");
  for (const t of TEMPLATES[category] ?? []) {
    if (out.length >= 3) break;
    const v = fromTemplate(t, root);
    if (v && !out.some((o) => key(o) === key(v))) out.push(v);
  }
  const iv = TRIAD_INTERVALS[category];
  const tri = iv && triadVoicing(root, iv);
  if (tri) out.push(tri);
  return out;
}

export const CHORD_LIBRARY: Chord[] = RAW.map(([name, category, voicings]) => ({ name, category, voicings: enrich(name, category, voicings) }));

const ENHARMONIC: Record<string, string> = { "A#": "Bb", "D#": "Eb", "G#": "Ab", Db: "C#", Gb: "F#", Cb: "B", "E#": "F", Fb: "E" };
const MINOR_ENHARMONIC: Record<string, string> = { Abm: "G#m", Dbm: "C#m", Gbm: "F#m", "A#m": "Bbm", "D#m": "Ebm" };

/** Normalise typed input ("am", "f#M", "dsus4", "d/f#", "cmaj7", "CM7") to a library name. */
export function normalizeChordName(input: string): string {
  let s = input.trim().replace(/\s+/g, "").replace(/♯/g, "#").replace(/♭/g, "b");
  if (!s) return "";
  const [main = "", bass] = s.split("/");
  const fix = (part: string) => {
    const m = part.match(/^([a-gA-G])([#b]?)(.*)$/);
    if (!m) return part;
    let [, root = "", acc = "", rest = ""] = m;
    root = root.toUpperCase();
    // "M7"/"maj7" = major seventh; lone "M" means major; other text lowercased
    if (/^(M7|maj7|Maj7|MAJ7)$/.test(rest)) rest = "maj7";
    else if (rest === "M") rest = "";
    else rest = rest.toLowerCase().replace(/^min/, "m");
    let name = root + acc;
    if (ENHARMONIC[name]) name = ENHARMONIC[name]!;
    let full = name + rest;
    if (MINOR_ENHARMONIC[root + acc + rest]) full = MINOR_ENHARMONIC[root + acc + rest]!;
    return full;
  };
  s = fix(main) + (bass ? "/" + fix(bass) : "");
  return s;
}

export function findChord(input: string): Chord | undefined {
  const n = normalizeChordName(input);
  return CHORD_LIBRARY.find((c) => c.name === n);
}

export function searchChords(input: string): Chord[] {
  const q = input.trim();
  if (!q) return CHORD_LIBRARY;
  const exact = findChord(q);
  const n = normalizeChordName(q).toLowerCase();
  const rest = CHORD_LIBRARY.filter((c) => c !== exact && c.name.toLowerCase().startsWith(n));
  return exact ? [exact, ...rest] : rest;
}

export const QUICK_CHART: { title: string; chords: string[] }[] = [
  { title: "Beginner Essentials", chords: ["C", "G", "D", "A", "E", "Am", "Em", "Dm"] },
  { title: "Common Seventh Chords", chords: ["A7", "D7", "E7", "G7", "C7", "Am7", "Em7"] },
  { title: "Other Popular Chords", chords: ["F", "Bm", "F#m", "Cadd9", "Dsus4", "Asus2"] },
];
