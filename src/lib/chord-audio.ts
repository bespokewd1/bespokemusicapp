/* Chord playback: pitches come straight from the diagram's fret data (single source of truth).
 * Samples: FluidR3_GM steel-string acoustic guitar (CC BY 3.0, via gleitz/midi-js-soundfonts),
 * bundled every 3 semitones under /audio/guitar and pitch-shifted at most ±1.5 semitones. */
import type { Voicing } from "@/lib/chords";

export const STANDARD_MIDI = [40, 45, 50, 55, 59, 64]; // E2 A2 D3 G3 B3 E4
const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FILE_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
export const SAMPLE_MIDI = [40, 43, 46, 49, 52, 55, 58, 61, 64, 67, 70, 73, 76, 79];

/** MIDI notes of a voicing, low string → high, muted strings skipped. */
export function voicingMidi(v: Voicing): number[] {
  return v.frets.flatMap((f, s) => (f === null ? [] : [STANDARD_MIDI[s]! + f]));
}
export function midiName(m: number): string {
  return NAMES[m % 12]! + (Math.floor(m / 12) - 1);
}
export function nearestSample(m: number): number {
  return SAMPLE_MIDI.reduce((a, b) => (Math.abs(b - m) < Math.abs(a - m) ? b : a));
}
const fileFor = (m: number) => `/audio/guitar/${FILE_NAMES[m % 12]}${Math.floor(m / 12) - 1}.mp3`;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
const buffers = new Map<number, Promise<AudioBuffer>>();
let active: { src: AudioBufferSourceNode; gain: GainNode }[] = [];

function load(m: number): Promise<AudioBuffer> {
  let p = buffers.get(m);
  if (!p) {
    p = fetch(fileFor(m))
      .then((r) => { if (!r.ok) throw new Error("sample missing"); return r.arrayBuffer(); })
      .then((b) => ctx!.decodeAudioData(b));
    p.catch(() => buffers.delete(m)); // allow retry later
    buffers.set(m, p);
  }
  return p;
}

/** Strum a voicing (call from a tap). Rejects if samples can't load — never falls back to another sound. */
export async function playVoicing(v: Voicing): Promise<void> {
  if (!ctx) {
    ctx = new AudioContext();
    const comp = ctx.createDynamicsCompressor();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(comp).connect(ctx.destination);
  }
  if (ctx.state === "suspended") await ctx.resume();
  const notes = voicingMidi(v);
  const bufs = await Promise.all(notes.map((m) => load(nearestSample(m))));
  // Fade out anything still ringing so repeated taps never pile up.
  const now = ctx.currentTime;
  active.forEach(({ src, gain }) => { gain.gain.cancelScheduledValues(now); gain.gain.setTargetAtTime(0, now, 0.04); src.stop(now + 0.3); });
  active = [];
  const start = now + 0.03;
  notes.forEach((m, i) => {
    const src = ctx!.createBufferSource();
    src.buffer = bufs[i]!;
    src.playbackRate.value = 2 ** ((m - nearestSample(m)) / 12);
    const gain = ctx!.createGain();
    const t = start + i * (0.018 + Math.random() * 0.01);
    gain.gain.setValueAtTime(0.9 / Math.sqrt(notes.length), t);
    gain.gain.setTargetAtTime(0, t + 2.2, 0.5);
    src.connect(gain).connect(master!);
    src.start(t);
    src.stop(t + 4.5);
    const entry = { src, gain };
    active.push(entry);
    src.onended = () => { src.disconnect(); gain.disconnect(); active = active.filter((a) => a !== entry); };
  });
}
