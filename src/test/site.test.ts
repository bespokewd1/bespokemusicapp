import { describe, expect, it } from "vitest";
import { siteUrl } from "@/lib/site";

describe("custom domain addresses", () => {
  it("uses the requested domain for the homepage", () => {
    expect(siteUrl()).toBe("https://bespokemusic.app/");
  });
  it("preserves deep links on the requested domain", () => {
    expect(siteUrl("/song/demo-id")).toBe("https://bespokemusic.app/song/demo-id");
    expect(siteUrl("privacy")).toBe("https://bespokemusic.app/privacy");
  });
});