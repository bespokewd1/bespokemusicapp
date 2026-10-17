import { describe, expect, it } from "vitest";
import { clipboardImages, insertPastedText } from "./clipboard";

describe("composition clipboard", () => {
  const image = new File(["image"], "intro.png", { type: "image/png" });
  it("reads image items when clipboard files is empty", () => {
    expect(clipboardImages({ items: [{ kind: "file", type: "image/png", getAsFile: () => image }] as unknown as DataTransferItemList, files: [] as unknown as FileList })).toEqual([image]);
  });
  it("falls back to files without duplicating item images", () => {
    expect(clipboardImages({ items: [] as unknown as DataTransferItemList, files: [image] as unknown as FileList })).toEqual([image]);
  });
  it("preserves mixed-paste text, tabs, spacing and cursor replacement", () => {
    const pasted = "G       C\nMy original words\ne|--5--7--|";
    expect(insertPastedText("beforeREMOVEafter", pasted, 6, 12)).toBe(`before${pasted}after`);
  });
  it("image-only paste leaves composition unchanged", () => {
    expect(insertPastedText("[G]My words", "", 3, 3)).toBe("[G]My words");
  });
});