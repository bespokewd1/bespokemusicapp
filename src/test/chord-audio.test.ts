import { describe, expect, it } from "vitest";
import { findChord, CHORD_LIBRARY } from "@/lib/chords";
import { midiName, nearestSample, voicingMidi } from "@/lib/chord-audio";

const notes = (name: string, i = 0) => voicingMidi(findChord(name)!.voicings[i]!).map(midiName);

describe("chord playback pitches", () => {
  it.each([
    ["C", "C3 E3 G3 C4 E4"],
    ["G", "G2 B2 D3 G3 B3 G4"],
    ["D", "D3 A3 D4 F#4"],
    ["Am", "A2 E3 A3 C4 E4"],
    ["Em", "E2 B2 E3 G3 B3 E4"],
    ["F", "F2 C3 F3 A3 C4 F4"],
  ])("%s plays %s", (c, expected) => expect(notes(c).join(" ")).toBe(expected));
  it("barre shapes keep their octave (C at fret 3, A-shape)", () => expect(notes("C", 1).join(" ")).toBe("C3 G3 C4 E4 G4"));
  it("every shape stays within 1.5 semitones of a bundled sample", () => {
    CHORD_LIBRARY.forEach((c) => c.voicings.forEach((v) => voicingMidi(v).forEach((m) => expect(Math.abs(m - nearestSample(m))).toBeLessThanOrEqual(1))));
  });
});
