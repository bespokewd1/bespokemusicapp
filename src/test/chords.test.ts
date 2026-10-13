import { describe, expect, it } from "vitest";
import { CHORD_LIBRARY, findChord, normalizeChordName, QUICK_CHART } from "@/lib/chords";

describe("chord library", () => {
  it.each(["C", "D", "E", "F", "G", "A", "B", "Am", "Em", "Dm", "C7", "G7", "Am7", "Dsus4", "Cadd9", "F#m", "Bm7", "D/F#"])(
    "has %s",
    (name) => expect(findChord(name)?.name).toBe(name),
  );
  it("normalises typed input", () => {
    expect(normalizeChordName("am")).toBe("Am");
    expect(normalizeChordName("d/f#")).toBe("D/F#");
    expect(normalizeChordName("CM7")).toBe("Cmaj7");
    expect(normalizeChordName("A#")).toBe("Bb");
  });
  it("every voicing has six strings and six finger slots", () => {
    CHORD_LIBRARY.forEach((c) => c.voicings.forEach((v) => {
      expect(v.frets).toHaveLength(6);
      expect(v.fingers).toHaveLength(6);
    }));
  });
  it("well-known shapes are correct", () => {
    expect(findChord("C")!.voicings[0]!.frets).toEqual([null, 3, 2, 0, 1, 0]);
    expect(findChord("G")!.voicings[0]!.frets).toEqual([3, 2, 0, 0, 0, 3]);
    expect(findChord("F")!.voicings[0]!.barre).toEqual({ fret: 1, from: 0, to: 5 });
  });
  it("quick chart chords all exist", () => {
    QUICK_CHART.flatMap((g) => g.chords).forEach((n) => expect(findChord(n)).toBeTruthy());
  });
});
