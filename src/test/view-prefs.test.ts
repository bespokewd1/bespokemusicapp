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
