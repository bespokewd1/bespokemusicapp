import { describe, expect, it } from "vitest";
import { isUltimateGuitarUrl, toNativeFormat, ultimateGuitarSearchUrl } from "./import";

describe("toNativeFormat", () => {
  it("places chords at their column above lyrics", () => {
    expect(toNativeFormat("G       C\nHello my friend")).toBe("[G]Hello my[C] friend");
  });
  it("converts bracket headings to sections", () => {
    expect(toNativeFormat("[Verse 1]\nG\nla la")).toBe("{Verse 1}\n[G]la la");
  });
  it("keeps chord-only lines", () => {
    expect(toNativeFormat("[Intro]\nG  C  D\n\n[Chorus]\nC\nSing")).toBe("{Intro}\n[G] [C] [D]\n\n{Chorus}\n[C]Sing");
  });
  it("leaves native text unchanged", () => {
    const t = "{Verse}\n[G]Write your words";
    expect(toNativeFormat(t)).toBe(t);
  });
});

describe("ultimate guitar urls", () => {
  it("accepts UG https hosts", () => {
    expect(isUltimateGuitarUrl("https://tabs.ultimate-guitar.com/tab/x/y-chords-1")).toBe(true);
    expect(isUltimateGuitarUrl("https://www.ultimate-guitar.com/x")).toBe(true);
  });
  it("rejects other hosts and http", () => {
    expect(isUltimateGuitarUrl("http://tabs.ultimate-guitar.com/x")).toBe(false);
    expect(isUltimateGuitarUrl("https://evil-ultimate-guitar.com/x")).toBe(false);
  });
  it("builds search url", () => {
    expect(ultimateGuitarSearchUrl("a b")).toContain("value=a%20b");
  });
});
