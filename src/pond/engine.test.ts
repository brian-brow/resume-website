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
  test("boids only exist while there is a tank", () => {
    const pond = new Pond(480, 300, { random: seeded(1) });
    expect(pond.boids.length).toBe(0);
    pond.setTank({ sx: 0, sy: 0, sw: 240, sh: 300 });
    expect(pond.boids.length).toBe(42);
    pond.setTank(null);
    expect(pond.boids.length).toBe(0);
  });

  test("boids spawn outside the tank, rush in, and stay", () => {
    const tank = { sx: 0, sy: 20, sw: 240, sh: 280 };
    const inside = (b: { x: number; y: number }) =>
      b.x > tank.sx - 10 && b.x < tank.sx + tank.sw + 10 && b.y > tank.sy - 10 && b.y < tank.sy + tank.sh + 10;
    const pond = new Pond(480, 300, { random: seeded(4) });
    pond.setTank(tank);
    expect(pond.boids.some(inside)).toBe(false);
    for (let i = 1; i <= 900; i++) pond.step(i / 30, 1 / 30);
    expect(pond.boids.every(inside)).toBe(true);
  });

  test("render is a 1-bit dither plus flat shape and fish colours", () => {
    const pond = new Pond(480, 300, { random: seeded(2) });
    pond.step(1, 1 / 30);
    const buf = new Uint32Array(240 * 150);
    pond.render(buf, { sx: 120, sy: 60, sw: 240, sh: 150 });
    const colours = new Set(buf);
    expect(colours.size).toBeLessThanOrEqual(5);
    expect(colours.has(0)).toBe(false); // every pixel written
  });

  test("resize keeps boids proportional", () => {
    const pond = new Pond(480, 300, { random: seeded(3) });
    pond.setTank({ sx: 0, sy: 0, sw: 240, sh: 300 });
    const before = pond.boids[0].x / 480;
    pond.resize(960, 600);
    expect(pond.boids[0].x / 960).toBeCloseTo(before, 6);
  });
});
