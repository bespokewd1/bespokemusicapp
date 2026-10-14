import { describe, expect, it } from "vitest";
import { FR } from "@/lib/i18n-fr";
import { translate } from "@/lib/i18n";

describe("French translations", () => {
  it("keep every {placeholder} of the English text", () => {
    for (const [en, fr] of Object.entries(FR)) {
      const ph = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
      expect(ph(fr), en).toEqual(ph(en));
    }
  });
  it("fills placeholders and falls back to English", () => {
    expect(translate("fr", "Welcome back, {name}!", { name: "Arjiv" })).toBe("Bon retour, Arjiv!");
    expect(translate("fr", "Untranslated text")).toBe("Untranslated text");
    expect(translate("en", "{n} songs", { n: 3 })).toBe("3 songs");
  });
});
