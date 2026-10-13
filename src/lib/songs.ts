export type Difficulty = "Beginner" | "Easy" | "Intermediate";

export interface Section {
  name: string;
  lines: string[]; // ChordPro-style: "[G]Words over [C]chords"
}

export interface SongImage {
  path: string;
  caption?: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  key: string;
  capo: number;
  difficulty: Difficulty;
  tempo: number;
  pickUp?: boolean;
  sections: Section[];
  ownerId?: string | null;
  published?: boolean;
  featuredOrder?: number | null;
  sortOrder?: number;
  images?: SongImage[];
}

const s = (
  id: string,
  title: string,
  artist: string,
  key: string,
  capo: number,
  difficulty: Difficulty,
  tempo: number,
  pickUp: boolean,
  sections: Section[],
): Song => ({ id, title, artist, key, capo, difficulty, tempo, pickUp, sections });

export const SONGS: Song[] = [
  s("porch-light", "Porch Light Waltz", "The Juniper Lane", "G", 0, "Beginner", 84, true, [
    { name: "Verse 1", lines: ["[G]Leave the porch light [C]burning low", "[G]I'll be home be[D]fore the snow", "[G]Every mile a [C]little song", "[G]Hum it as I [D]drive a[G]long"] },
    { name: "Chorus", lines: ["[C]Oh the night is [G]wide and kind", "[C]Keep a candle [D]in your mind", "[G]Porch light, [Em]porch light", "[C]Guide me [D]home to[G]night"] },
    { name: "Verse 2", lines: ["[G]Kettle singing [C]on the stove", "[G]Old guitar and [D]stories told", "[G]Wooden floors that [C]creak in tune", "[G]Underneath a [D]paper [G]moon"] },
  ]),
  s("river-stone", "River Stone", "Maple & Rye", "D", 2, "Easy", 96, true, [
    { name: "Intro", lines: ["[D] [A] [Bm] [G]"] },
    { name: "Verse", lines: ["[D]Skipping stones a[A]cross the bend", "[Bm]Counting ripples [G]to the end", "[D]Summer water, [A]cold and clear", "[G]Hold the moment [A]right here"] },
    { name: "Chorus", lines: ["[G]Roll on, [D]river stone", "[A]Every current [Bm]calls you home", "[G]Smooth and [D]patient, [A]never alone", "[G]Roll on, [A]river [D]stone"] },
  ]),
  s("lanterns", "Lanterns in the Rain", "Ivy Calloway", "C", 0, "Easy", 72, true, [
    { name: "Verse", lines: ["[C]Paper lanterns [Am]in the rain", "[F]Glowing softly [G]down the lane", "[C]Strangers smiling [Am]on the street", "[F]Puddles dancing [G]at our feet"] },
    { name: "Chorus", lines: ["[F]Light it [C]up, light it [G]up", "[Am]Even storms can't [F]fill the cup", "[C]Lanterns [G]in the [Am]rain", "[F]Carry us [G]home a[C]gain"] },
  ]),
  s("northbound", "Northbound Train", "Harlow Brothers", "E", 0, "Intermediate", 118, false, [
    { name: "Verse", lines: ["[E]Whistle cuts the [A]morning air", "[E]Ticket stub and [B7]nothing to spare", "[E]Pine trees blurring [A]past the glass", "[E]Let the [B7]old days [E]pass"] },
    { name: "Chorus", lines: ["[A]Northbound, [E]northbound", "[B7]Steel wheels singing [E]that sweet sound", "[A]Far from the [E]crowded town", "[B7]Ride the northbound [E]train"] },
    { name: "Bridge", lines: ["[C#m]Maybe I'll [A]find you there", "[E]Waiting by the [B7]station stair"] },
  ]),
  s("honeycomb", "Honeycomb Morning", "Sunny Ferris", "A", 0, "Beginner", 100, true, [
    { name: "Verse", lines: ["[A]Honey on the [D]windowsill", "[A]Coffee's warm and [E]time stands still", "[A]Birds are writing [D]songs outside", "[A]Open up the [E]window [A]wide"] },
    { name: "Chorus", lines: ["[D]Golden, [A]golden day", "[D]Let the [E]worries fade away"] },
  ]),
  s("tin-roof", "Tin Roof Lullaby", "The Juniper Lane", "Am", 0, "Easy", 66, false, [
    { name: "Verse", lines: ["[Am]Rain upon the [F]tin roof sings", "[C]Softer than an [G]angel's wings", "[Am]Close your eyes and [F]drift away", "[C]Dream until the [G]break of day"] },
    { name: "Chorus", lines: ["[F]Hush now, [C]hush now", "[G]Thunder's far a[Am]way", "[F]Rest now, [C]rest now", "[G]Sleep till [Am]day"] },
  ]),
  s("wildflower-road", "Wildflower Road", "Maple & Rye", "G", 3, "Intermediate", 108, false, [
    { name: "Verse", lines: ["[G]Dust and daisies [Cadd9]on my boots", "[Em]Following the [D]old dirt routes", "[G]Every fencepost [Cadd9]tells a tale", "[Em]Of a [D]summer [G]trail"] },
    { name: "Chorus", lines: ["[Cadd9]Down the wildflower [G]road", "[D]Lighter than the [Em]load", "[Cadd9]Wherever the [G]wind may go", "[D]Wildflower [G]road"] },
  ]),
  s("kitchen-table", "Kitchen Table", "Ivy Calloway", "D", 0, "Beginner", 88, true, [
    { name: "Verse", lines: ["[D]Gathered round the [G]kitchen table", "[D]Telling stories [A]while we're able", "[D]Bread and laughter, [G]mismatched chairs", "[D]Love is [A]always [D]there"] },
    { name: "Chorus", lines: ["[G]Pass the [D]plates around", "[A]Best seat in [D]town"] },
  ]),
  s("silver-line", "Silver Line", "Harlow Brothers", "Em", 0, "Easy", 92, false, [
    { name: "Verse", lines: ["[Em]Clouds roll [C]over the hill", "[G]Waiting [D]patient and still", "[Em]There's a [C]silver line", "[G]Shining [D]every time"] },
    { name: "Chorus", lines: ["[C]Hold on, [G]hold on", "[D]Dark don't [Em]last too long"] },
  ]),
  s("campfire", "Campfire Constellations", "Sunny Ferris", "C", 0, "Beginner", 80, true, [
    { name: "Verse", lines: ["[C]Sparks are rising [F]to the stars", "[C]Marshmallows and [G]old guitars", "[C]Name the shapes up [F]in the sky", "[C]You and [G]me and [C]I"] },
    { name: "Chorus", lines: ["[F]Burn bright, [C]burn bright", "[G]Campfire [C]night"] },
  ]),
  s("harbor", "Harbor Bells", "The Juniper Lane", "F", 1, "Intermediate", 76, false, [
    { name: "Verse", lines: ["[F]Harbor bells at [Bb]break of dawn", "[F]Fishing boats are [C]moving on", "[Dm]Salt and seagulls, [Bb]rope and tide", "[F]Ocean [C]open [F]wide"] },
    { name: "Chorus", lines: ["[Bb]Ring out, [F]harbor bells", "[C]Every wave has [Dm]tales to tell"] },
  ]),
  s("paper-planes", "Paper Planes", "Maple & Rye", "G", 0, "Easy", 112, false, [
    { name: "Verse", lines: ["[G]Folded wishes, [D]paper planes", "[Em]Flying over [C]window panes", "[G]Write your name on [D]every wing", "[C]Watch the [D]breezes [G]sing"] },
    { name: "Chorus", lines: ["[C]Fly a[G]way, fly a[D]way", "[Em]Land on [C]brighter [D]days"] },
  ]),
  s("slow-burn", "Slow Burn Sunday", "Ivy Calloway", "A", 2, "Intermediate", 70, false, [
    { name: "Verse", lines: ["[A]Record spinning, [C#m]afternoon", "[D]Sunlight pouring [E]through the room", "[A]Nowhere we would [C#m]rather be", "[D]Just the [E]two of [A]we"] },
    { name: "Chorus", lines: ["[D]Slow burn [A]Sunday", "[E]Stay a little [F#m]longer", "[D]Slow burn [E]Sun[A]day"] },
  ]),
  s("hometown", "Hometown Hymn", "Harlow Brothers", "D", 0, "Beginner", 78, true, [
    { name: "Verse", lines: ["[D]Steeple bells and [G]county fair", "[D]Every face is [A]smiling there", "[D]Main street lit in [G]evening gold", "[D]Stories [A]never [D]old"] },
    { name: "Chorus", lines: ["[G]Sing it [D]low, sing it [A]slow", "[G]Hometown [A]hymn, take me [D]home"] },
  ]),
];

/* ---------- Parsing ---------- */
export interface Segment {
  chord: string;
  text: string;
}
export function parseLine(line: string): Segment[] {
  const out: Segment[] = [];
  const re = /\[([^\]]+)\]/g;
  let last = 0;
  let chord = "";
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m.index > last || chord) out.push({ chord, text: line.slice(last, m.index) });
    chord = m[1] ?? "";
    last = re.lastIndex;
  }
  out.push({ chord, text: line.slice(last) });
  return out.filter((seg) => seg.chord || seg.text);
}

export function uniqueChords(song: Song): string[] {
  const set = new Set<string>();
  song.sections.forEach((sec) => sec.lines.forEach((l) => parseLine(l).forEach((x) => x.chord && set.add(x.chord))));
  return [...set];
}

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT: Record<string, string> = { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#" };
function shiftNote(n: string, by: number) {
  const idx = NOTES.indexOf(FLAT[n] ?? n);
  if (idx < 0) return n;
  return NOTES[(idx + by + 120) % 12] ?? n;
}
export function transposeChord(chord: string, by: number): string {
  if (!by) return chord;
  return chord
    .split("/")
    .map((part) => part.replace(/^([A-G][#b]?)/, (r) => shiftNote(r, by)))
    .join("/");
}

/* ---------- Text <-> sections (for Add/Edit form) ---------- */
export function sectionsToText(sections: Section[]): string {
  return sections.map((sec) => `{${sec.name}}\n${sec.lines.join("\n")}`).join("\n\n");
}
export function textToSections(text: string): Section[] {
  const sections: Section[] = [];
  let cur: Section | null = null;
  text.split("\n").forEach((raw) => {
    const line = raw.trimEnd();
    const h = line.match(/^\{(.+)\}$/);
    if (h) {
      const sec: Section = { name: h[1] ?? "Section", lines: [] };
      cur = sec;
      sections.push(sec);
    } else if (line.trim()) {
      if (!cur) {
        const sec: Section = { name: "Verse", lines: [] };
        cur = sec;
        sections.push(sec);
      }
      (cur as Section).lines.push(line);
    }
  });
  return sections;
}
