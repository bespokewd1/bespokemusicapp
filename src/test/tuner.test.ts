import { describe, expect, it } from "vitest";
import { centsToTarget, detectPitch, frequencyToNote, nearestString, PRESETS, tuningState } from "@/lib/tuner";

const std = PRESETS[0]!.strings;

function tone(freq: number, sr = 48000, n = 4096) {
  const b = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    // fundamental + harmonics like a plucked string
    b[i] = 0.5 * Math.sin(2 * Math.PI * freq * t) + 0.3 * Math.sin(4 * Math.PI * freq * t) + 0.15 * Math.sin(6 * Math.PI * freq * t);
  }
  return b;
}

describe("standard tuning", () => {
  it("has the six target frequencies", () => {
    expect(std.map((s) => s.label)).toEqual(["E2", "A2", "D3", "G3", "B3", "E4"]);
    [82.41, 110, 146.83, 196, 246.94, 329.63].forEach((f, i) => expect(std[i]!.freq).toBeCloseTo(f, 1));
  });
});

describe("note maths", () => {
  it("maps frequencies to notes", () => {
    expect(frequencyToNote(82.41).label).toBe("E2");
    expect(frequencyToNote(329.63).label).toBe("E4");
    expect(frequencyToNote(440).label).toBe("A4");
  });
  it("calculates cents", () => {
    expect(Math.round(centsToTarget(110 * Math.pow(2, 12 / 1200), 110))).toBe(12);
    expect(Math.round(centsToTarget(220, 110))).toBe(0); // octave error folds back
  });
  it("uses ±5 cents tolerance", () => {
    expect(tuningState(4.9)).toBe("in-tune");
    expect(tuningState(-6)).toBe("flat");
    expect(tuningState(8)).toBe("sharp");
  });
  it("distinguishes low E from high E", () => {
    expect(std[nearestString(83, std)]!.label).toBe("E2");
    expect(std[nearestString(328, std)]!.label).toBe("E4");
  });
});

describe("pitch detection", () => {
  it.each([82.41, 110, 146.83, 196, 246.94, 329.63])("detects %f Hz", (f) => {
    const got = detectPitch(tone(f), 48000)!;
    expect(Math.abs(centsToTarget(got, f))).toBeLessThan(3);
  });
  it("ignores silence", () => {
    expect(detectPitch(new Float32Array(4096), 48000)).toBeNull();
  });
});

describe("tuning presets", () => {
  it("keeps Standard, E♭ Standard, Drop D and Drop C in order", () => {
    expect(PRESETS.map((p) => p.name)).toEqual(["Standard", "E♭ Standard", "Drop D", "Drop C"]);
    expect(PRESETS.map((p) => p.strings.map((s) => s.label).join(" "))).toEqual([
      "E2 A2 D3 G3 B3 E4",
      "E♭2 A♭2 D♭3 G♭3 B♭3 E♭4",
      "D2 A2 D3 G3 B3 E4",
      "C2 G2 C3 F3 A3 D4",
    ]);
  });
  it("uses accurate half-step-down target frequencies and flat labels", () => {
    const eb = PRESETS.find((p) => p.id === "eb-standard");
    expect(eb?.strings.map((s) => s.note)).toEqual(["E♭", "A♭", "D♭", "G♭", "B♭", "E♭"]);
    [77.78, 103.83, 138.59, 185, 233.08, 311.13].forEach((freq, i) => {
      expect(eb?.strings[i]?.freq).toBeCloseTo(freq, 1);
    });
  });
  it.each(PRESETS.flatMap((p) => p.strings.map((s, i) => ({ id: p.id, strings: p.strings, freq: s.freq, i }))))("detects and selects $id string $i", ({ strings, freq, i }) => {
    const detected = detectPitch(tone(freq, 48000, 8192), 48000);
    expect(detected).not.toBeNull();
    if (detected === null) return;
    expect(nearestString(detected, strings)).toBe(i);
    expect(tuningState(centsToTarget(detected, freq))).toBe("in-tune");
  });
  it.each([73.42, 65.41])("detects low %f Hz", (f) => {
    const got = detectPitch(tone(f, 48000, 8192), 48000)!;
    expect(Math.abs(centsToTarget(got, f))).toBeLessThan(3);
  });
});
