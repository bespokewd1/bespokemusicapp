/* Pure tuning math + pitch detection (no browser APIs) — unit tested. */

export interface GuitarString {
  label: string; // e.g. "E2"
  note: string; // e.g. "E"
  freq: number;
  name: string; // e.g. "6 · Low E"
}

export interface TuningPreset {
  id: string;
  name: string;
  strings: GuitarString[]; // low (6th) -> high (1st)
}

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function midiToFreq(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
export function freqToMidi(freq: number) {
  return 69 + 12 * Math.log2(freq / 440);
}
export function centsBetween(freq: number, target: number) {
  return 1200 * Math.log2(freq / target);
}

export function frequencyToNote(freq: number) {
  const midi = Math.round(freqToMidi(freq));
  const name = NOTE_NAMES[((midi % 12) + 12) % 12] ?? "?";
  const octave = Math.floor(midi / 12) - 1;
  return { name, octave, label: `${name}${octave}`, cents: centsBetween(freq, midiToFreq(midi)) };
}

function str(midi: number, num: number, extra = ""): GuitarString {
  const n = frequencyToNote(midiToFreq(midi));
  return { label: n.label, note: n.name, freq: midiToFreq(midi), name: `${num}${extra ? " · " + extra : ""}` };
}

export const PRESETS: TuningPreset[] = [
  {
    id: "standard",
    name: "Normal Tuning",
    strings: [str(40, 6, "Low E"), str(45, 5), str(50, 4), str(55, 3), str(59, 2), str(64, 1, "High E")],
  },
  { id: "drop-d", name: "Drop D Tuning", strings: [str(38, 6, "Low D"), str(45, 5), str(50, 4), str(55, 3), str(59, 2), str(64, 1)] },
  { id: "drop-c", name: "Drop C Tuning", strings: [str(36, 6, "Low C"), str(43, 5), str(48, 4), str(53, 3), str(57, 2), str(62, 1)] },
];

/** Closest string to a detected frequency (by cents distance). */
export function nearestString(freq: number, strings: GuitarString[]) {
  let best = 0;
  let bestDist = Infinity;
  strings.forEach((s, i) => {
    const d = Math.abs(centsBetween(freq, s.freq));
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  });
  return best;
}

/**
 * Cents offset from a chosen target. If the reading is an octave error
 * (harmonic or sub-harmonic), fold it back toward the target's octave.
 */
export function centsToTarget(freq: number, target: number) {
  let c = centsBetween(freq, target);
  while (c > 600) c -= 1200;
  while (c < -600) c += 1200;
  return c;
}

export const IN_TUNE_CENTS = 5;
export function tuningState(cents: number, tolerance = IN_TUNE_CENTS): "flat" | "sharp" | "in-tune" {
  if (Math.abs(cents) <= tolerance) return "in-tune";
  return cents < 0 ? "flat" : "sharp";
}

/**
 * YIN pitch detection. Returns frequency in Hz or null if no confident pitch.
 * Search range tuned for guitar (≈ 60 Hz – 1000 Hz).
 */
export function detectPitch(buf: Float32Array, sampleRate: number, opts: { minFreq?: number; maxFreq?: number; threshold?: number; minRms?: number } = {}): number | null {
  const { minFreq = 55, maxFreq = 1000, threshold = 0.15, minRms = 0.004 } = opts;
  let rms = 0;
  for (let i = 0; i < buf.length; i++) rms += buf[i]! * buf[i]!;
  rms = Math.sqrt(rms / buf.length);
  if (rms < minRms) return null;

  const maxTau = Math.min(Math.floor(sampleRate / minFreq), Math.floor(buf.length / 2));
  const minTau = Math.max(2, Math.floor(sampleRate / maxFreq));
  const W = buf.length - maxTau;
  const d = new Float32Array(maxTau + 1);
  for (let tau = 1; tau <= maxTau; tau++) {
    let sum = 0;
    for (let i = 0; i < W; i++) {
      const delta = buf[i]! - buf[i + tau]!;
      sum += delta * delta;
    }
    d[tau] = sum;
  }
  // cumulative mean normalized difference
  const cmnd = new Float32Array(maxTau + 1);
  cmnd[0] = 1;
  let running = 0;
  for (let tau = 1; tau <= maxTau; tau++) {
    running += d[tau]!;
    cmnd[tau] = running ? (d[tau]! * tau) / running : 1;
  }
  let tau = -1;
  for (let t = minTau; t <= maxTau; t++) {
    if (cmnd[t]! < threshold) {
      while (t + 1 <= maxTau && cmnd[t + 1]! < cmnd[t]!) t++;
      tau = t;
      break;
    }
  }
  if (tau < 0) {
    // fallback: global minimum if reasonably periodic
    let best = -1, bv = 0.3;
    for (let t = minTau; t <= maxTau; t++) if (cmnd[t]! < bv) { bv = cmnd[t]!; best = t; }
    if (best < 0) return null;
    tau = best;
  }
  // parabolic interpolation
  const x0 = tau > 1 ? cmnd[tau - 1]! : cmnd[tau]!;
  const x2 = tau < maxTau ? cmnd[tau + 1]! : cmnd[tau]!;
  const denom = 2 * (2 * cmnd[tau]! - x2 - x0);
  const better = denom ? tau + (x2 - x0) / denom : tau;
  const f = sampleRate / better;
  return f >= minFreq && f <= maxFreq ? f : null;
}

/** Median smoother for noisy readings. */
export function median(values: number[]) {
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
}
