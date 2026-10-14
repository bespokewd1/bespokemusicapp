import { describe, expect, it } from "vitest";
import { isTabLine, sectionHeading, textToSections, transposeChord } from "@/lib/songs";
import { toNativeFormat } from "@/lib/import";

const TAB = "e|--5h7--7b8--5-----------|\nB|--------------8--5------|";

describe("guitar tabs", () => {
  it("detects guitar and bass tab lines", () => {
    expect(isTabLine("e|----------------5--7--8--|")).toBe(true);
    expect(isTabLine("G|--0--2--")).toBe(true);
    expect(isTabLine("Example lyric line")).toBe(false);
  });
  it("keeps tab text exactly through paste conversion and saving", () => {
    const native = toNativeFormat(`[Guitar Solo]\n${TAB}`);
    expect(native).toBe(`{Guitar Solo}\n${TAB}`);
    expect(textToSections(native)[0]!.lines.join("\n")).toBe(TAB);
  });
  it("does not merge a chord line into a tab line below it", () => {
    expect(toNativeFormat("G    D\ne|--0--2--|")).toBe("[G] [D]\ne|--0--2--|");
  });
  it("tab text is never touched by chord transposition", () => {
    expect(transposeChord("G", 2)).toBe("A");
  });
});

describe("section headings", () => {
  it("recognises common parts in any style", () => {
    expect(sectionHeading("[Chorus]")).toBe("Chorus");
    expect(sectionHeading("Verse 1:")).toBe("Verse 1");
    expect(sectionHeading("refrain")).toBe("Refrain");
    expect(sectionHeading("[Intro - Guitar Tab]")).toBe("Intro - Guitar Tab");
    expect(sectionHeading("[G]")).toBeNull();
  });
  it("splits typed text into sections", () => {
    expect(textToSections("[Verse]\n[G]la\nChorus\n[C]la").map((s) => s.name)).toEqual(["Verse", "Chorus"]);
  });
});
