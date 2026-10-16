import { describe, expect, it } from "vitest";
import { parseTranspose, parseViewPrefs, playlistNeighbours } from "@/lib/view-prefs";

describe("view prefs", () => {
  it("clamps font size to 14–36 (pinch up to 200%)", () => {
    expect(parseViewPrefs('{"size":50}').size).toBe(36);
    expect(parseViewPrefs('{"size":2}').size).toBe(14);
  });
  it("defaults on bad data", () => {
    expect(parseViewPrefs("nope")).toEqual({ size: 18, nashville: false });
  });
  it("rejects transposition beyond 11 semitones", () => {
    expect(parseTranspose("12")).toBe(0);
    expect(parseTranspose("-3")).toBe(-3);
  });
});

describe("playlist navigation", () => {
  const order = ["a", "b", "c"];
  it("first song has no previous", () => {
    expect(playlistNeighbours(order, "a")).toEqual({ index: 0, total: 3, prev: null, next: "b" });
  });
  it("last song has no next", () => {
    expect(playlistNeighbours(order, "c")?.next).toBeNull();
  });
  it("song outside playlist returns null", () => {
    expect(playlistNeighbours(order, "z")).toBeNull();
  });
});

import { parsePlaybackPrefs } from "@/lib/view-prefs";
describe("per-song playback prefs", () => {
  it("only allows intro delays Off, 3s, 5s, 10s", () => {
    expect(parsePlaybackPrefs('{"delay":5}').delay).toBe(5);
    expect(parsePlaybackPrefs('{"delay":7}').delay).toBe(0);
  });
  it("clamps saved speed to 0.3–3 and defaults to account speed", () => {
    expect(parsePlaybackPrefs('{"speed":9}').speed).toBe(3);
    expect(parsePlaybackPrefs(null).speed).toBeNull();
  });
});
