/* Structured guitar chord voicings (standard tuning, low E → high e).
 * frets: "x" muted, "0" open, digit = fret. fingers: 0 = none, 1–4 = finger.
 * barre: "fret:fromString-toString" using string indexes 0 (low E) … 5 (high e).
 * Shapes are the standard, widely published open and barre voicings. */

export type ChordCategory = "Major" | "Minor" | "7th" | "Maj7" | "Min7" | "Sus" | "Add9" | "6th" | "Dim" | "Aug" | "Slash";

export interface Voicing {
  frets: (number | null)[]; // null = muted
  fingers: number[];
  barre?: { fret: number; from: number; to: number };
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

export const CHORD_LIBRARY: Chord[] = RAW.map(([name, category, voicings]) => ({ name, category, voicings }));

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
