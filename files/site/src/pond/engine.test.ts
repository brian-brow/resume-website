import { describe, expect, test } from "bun:test";
import { Pond } from "./engine";

// Small deterministic PRNG so runs are repeatable
function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

describe("Pond", () => {
  test("boids stay inside the pond", () => {
    const pond = new Pond(480, 300, { random: seeded(1) });
    for (let i = 1; i <= 900; i++) pond.step(i / 30, 1 / 30);
    for (const b of pond.boids) {
      expect(b.x).toBeGreaterThan(-20);
      expect(b.x).toBeLessThan(500);
      expect(b.y).toBeGreaterThan(-20);
      expect(b.y).toBeLessThan(320);
    }
  });

  test("render is strictly 1-bit plus the flat shape colour", () => {
    const pond = new Pond(480, 300, { random: seeded(2) });
    pond.step(1, 1 / 30);
    const buf = new Uint32Array(240 * 150);
    pond.render(buf, { sx: 120, sy: 60, sw: 240, sh: 150 });
    const colours = new Set(buf);
    expect(colours.size).toBeLessThanOrEqual(3);
    expect(colours.has(0)).toBe(false); // every pixel written
  });

  test("resize keeps boids proportional", () => {
    const pond = new Pond(480, 300, { random: seeded(3) });
    const before = pond.boids[0].x / 480;
    pond.resize(960, 600);
    expect(pond.boids[0].x / 960).toBeCloseTo(before, 6);
  });
});
