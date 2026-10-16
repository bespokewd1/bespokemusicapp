import { describe, it, expect } from "vitest";
import { createInTuneGate } from "@/lib/tuner";

const run = (gate: ReturnType<typeof createInTuneGate>, seq: [number | null, number][], key = "E2") =>
  seq.filter(([c, t]) => gate(c, key, t)).length;

describe("in-tune chime gate", () => {
  it("never chimes for flat or sharp notes", () => {
    const g = createInTuneGate();
    expect(run(g, Array.from({ length: 30 }, (_, i) => [i % 2 ? -20 : 20, i * 50] as [number, number]))).toBe(0);
  });
  it("does not chime for a brief green flash", () => {
    const g = createInTuneGate();
    expect(run(g, [[2, 0], [3, 100], [2, 200], [15, 300], [2, 350], [1, 500]])).toBe(0);
  });
  it("chimes once after ~400ms stable and not again while in tune", () => {
    const g = createInTuneGate();
    expect(run(g, Array.from({ length: 60 }, (_, i) => [1, i * 50] as [number, number]))).toBe(1);
  });
  it("re-arms only after clearly leaving tune", () => {
    const g = createInTuneGate();
    const seq: [number | null, number][] = [];
    for (let t = 0; t <= 500; t += 50) seq.push([0, t]);
    for (let t = 550; t <= 1000; t += 50) seq.push([30, t]);
    for (let t = 1050; t <= 1600; t += 50) seq.push([0, t]);
    expect(run(g, seq)).toBe(2);
  });
  it("small wobble just outside tolerance does not re-arm", () => {
    const g = createInTuneGate();
    const seq: [number | null, number][] = [];
    for (let t = 0; t <= 500; t += 50) seq.push([0, t]);
    for (let t = 550; t <= 1200; t += 50) seq.push([8, t]);
    for (let t = 1250; t <= 1800; t += 50) seq.push([0, t]);
    expect(run(g, seq)).toBe(1);
  });
  it("switching string allows a new chime", () => {
    const g = createInTuneGate();
    let n = 0;
    for (let t = 0; t <= 500; t += 50) n += +g(0, "E2", t);
    for (let t = 550; t <= 1100; t += 50) n += +g(0, "A2", t);
    expect(n).toBe(2);
  });
});
