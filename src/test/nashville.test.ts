import { describe, expect, it } from "vitest";
import { toNashville, isValidKey } from "@/lib/nashville";
import { transposeChord } from "@/lib/songs";

describe("nashville", () => {
  it("key of G basics", () => {
    expect(toNashville("G", "G")).toBe("1");
    expect(toNashville("C", "G")).toBe("4");
    expect(toNashville("D", "G")).toBe("5");
    expect(toNashville("Em", "G")).toBe("6m");
  });
  it("sevenths, accidentals, slash chords", () => {
    expect(toNashville("D7", "G")).toBe("57");
    expect(toNashville("Bb", "C")).toBe("b7");
    expect(toNashville("D/F#", "G")).toBe("5/7");
    expect(toNashville("Cadd9", "G")).toBe("4add9");
  });
  it("validates keys", () => {
    expect(isValidKey("F#m")).toBe(true);
    expect(isValidKey("")).toBe(false);
  });
});

describe("transpose", () => {
  it("keeps quality and slash bass", () => {
    expect(transposeChord("Am7", 2)).toBe("Bm7");
    expect(transposeChord("D/F#", 1)).toBe("D#/G");
    expect(transposeChord("Gsus4", -2)).toBe("Fsus4");
    expect(transposeChord("Cmaj9", 12)).toBe("Cmaj9");
  });
});
