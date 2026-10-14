import { describe, expect, it } from "vitest";
import { CHORD_LIBRARY, chordRootPc, findChord, STRING_PCS } from "@/lib/chords";

const TONES: Record<string, number[]> = { Major: [0, 4, 7], Minor: [0, 3, 7], "7th": [0, 4, 7, 10], Min7: [0, 3, 7, 10], Maj7: [0, 4, 7, 11] };
const pcs = (frets: (number | null)[]) => frets.flatMap((f, s) => (f === null ? [] : [(STRING_PCS[s]! + f) % 12]));

describe("extra chord shapes", () => {
  it("every major and minor chord has 3 full shapes plus one triad", () => {
    CHORD_LIBRARY.filter((c) => c.category === "Major" || c.category === "Minor").forEach((c) => {
      expect(c.voicings.filter((v) => v.label !== "Triad").length, c.name).toBeGreaterThanOrEqual(3);
      expect(c.voicings.filter((v) => v.label === "Triad")).toHaveLength(1);
    });
  });
  it("every shape plays only notes of its chord and includes the root", () => {
    CHORD_LIBRARY.filter((c) => TONES[c.category]).forEach((c) => {
      const root = chordRootPc(c.name)!;
      const allowed = TONES[c.category]!.map((i) => (root + i) % 12);
      c.voicings.forEach((v) => {
        const notes = pcs(v.frets);
        notes.forEach((n) => expect(allowed, `${c.name} ${v.frets.join(",")}`).toContain(n));
        expect(notes).toContain(root);
      });
    });
  });
  it("triads use exactly root, third and fifth", () => {
    const am = findChord("Am")!.voicings.find((v) => v.label === "Triad")!;
    expect(new Set(pcs(am.frets))).toEqual(new Set([9, 0, 4]));
    expect(findChord("C")!.voicings.find((v) => v.label === "Triad")!.frets).toEqual([null, null, null, 0, 1, 0]);
  });
  it("C gets its A-shape barre at fret 3 and E-shape at fret 8", () => {
    const frets = findChord("C")!.voicings.map((v) => v.frets.join(","));
    expect(frets).toContain(",3,5,5,5,3");
    expect(frets).toContain("8,10,10,9,8,8");
  });
});
