/** Display-only pace guide, not musical tempo or a change to scroll physics. */
export const SCROLL_PACE_PRESETS = [
  { label: "Slow", bpm: 60, speed: 1 },
  { label: "Ballad", bpm: 80, speed: 1.3 },
  { label: "Pop", bpm: 100, speed: 1.7 },
  { label: "Rock", bpm: 120, speed: 2 },
  { label: "Upbeat", bpm: 140, speed: 2.3 },
] as const;

/** Round to ten BPM to keep this approximate guide honest and readable. */
export function approximateScrollBpm(speed: number): number {
  return Math.round(speed * 60 / 10) * 10;
}