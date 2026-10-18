import { describe, expect, it } from "vitest";
import { approximateScrollBpm, SCROLL_PACE_PRESETS } from "@/lib/scroll-pace";
import { parsePlaybackPrefs } from "@/lib/view-prefs";

describe("approximate auto-scroll pace guide", () => {
  it.each([[1, 60], [1.5, 90], [2, 120], [2.5, 150], [3, 180]])("maps %s× to approximately %s BPM", (speed, bpm) => {
    expect(approximateScrollBpm(speed)).toBe(bpm);
  });
  it.each([["Slow", 60], ["Ballad", 80], ["Pop", 100], ["Rock", 120], ["Upbeat", 140]])("keeps %s preset at approximately %s BPM after saving", (label, bpm) => {
    const preset = SCROLL_PACE_PRESETS.find((p) => p.label === label);
    expect(preset).toBeDefined();
    const saved = parsePlaybackPrefs(JSON.stringify({ speed: preset?.speed }));
    expect(saved.speed).toBe(preset?.speed);
    expect(approximateScrollBpm(saved.speed ?? 0)).toBe(bpm);
  });
  it("preserves the existing 0.3–3 multiplier range", () => {
    expect(parsePlaybackPrefs('{"speed":0.3}').speed).toBe(0.3);
    expect(approximateScrollBpm(0.3)).toBe(20);
    expect(approximateScrollBpm(3)).toBe(180);
  });
});