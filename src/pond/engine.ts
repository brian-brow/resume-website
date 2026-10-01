/**
 * Pond simulation core: caustic water + 1-bit Bayer dither + boids.
 *
 * Plain TypeScript with no DOM or React. Everything happens in "field" units,
 * where 1 unit = one dither dot (DOT css pixels on screen). The field is the
 * size of the whole viewport; each canvas on the page is a window (a Crop)
 * onto part of it, which is why the fish swim "behind" the grid lines.
 *
 * This is the contract the Rust/WebAssembly port will implement (PondCore).
 */

export interface Crop {
  sx: number; // left edge in field units
  sy: number; // top edge in field units
  sw: number; // width in field units (= canvas.width)
  sh: number; // height in field units (= canvas.height)
}

export interface PondCore {
  /** Resize the field (in dots). Keeps boids in proportional positions. */
  resize(width: number, height: number): void;
  /** Advance the simulation. t = seconds since start, dt = seconds since last step. */
  step(t: number, dt: number): void;
  /** Paint one window of the field into a 32-bit RGBA pixel buffer (sw * sh). */
  render(buf: Uint32Array, crop: Crop): void;
  /** Pointer disturbance at a field position: spawns a ripple and scares fish. */
  poke(x: number, y: number, t: number): void;
  /** Pin the lily pad (PADS[LILY]) at a field position with radius r in dots. It stops drifting but still breathes. */
  setLily(x: number, y: number, r: number): void;
  /** Confine the boids to a field rectangle. The first tank spawns them evenly around its outside, so they rush in; null removes them. */
  setTank(tank: Crop | null): void;
}

// Colours as little-endian ABGR for Uint32 views over ImageData
const INK = 0xff87fedb;
const PAPER = 0xff534039;
// const FLAT = 0xff739083;
// const ARC = 0xff7aae7c;
const FISH = 0xff62636e;

// Light direction for slope shading
const LX = 0.6;
const LY = -0.8;

// Bayer 8x8 ordered-dither thresholds, normalised to 0..1
const BAYER = (() => {
  const b = [
    0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30,
    54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23,
    61, 29, 53, 21,
  ];
  const out = new Float32Array(64);
  for (let i = 0; i < 64; i++) out[i] = (b[i] + 0.5) / 64;
  return out;
})();

/** Floating pads as fractions of the field: [x, y, radius (in dots), phase] */
const PADS: ReadonlyArray<readonly [number, number, number, number]> = [
  [0.83, 0.23, 22, 0.0],
  [0.31, 0.8, 30, 2.1],
  [0.55, 0.62, 16, 4.0],
];

/** The PADS entry setLily moves; until then it floats like the others. */
const LILY = 1;

interface Boid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  seed: number;
}

interface Ripple {
  x: number;
  y: number;
  t0: number;
}

export interface PondOptions {
  /** How many boids a tank spawns. */
  boids?: number;
  /** Deterministic random source, handy for tests. */
  random?: () => number;
  /** Water tone per dot for time t, in the R channel of an RGBA buffer (width * height * 4). Without it the water is blank. */
  water?: (t: number, width: number, height: number) => Uint8Array;
}

export class Pond implements PondCore {
  width: number;
  height: number;
  boids: Boid[] = [];

  private t = 0;
  private rand: () => number;
  private count: number;
  private tank: Crop | null = null;
  private water: PondOptions["water"];
  private tones: Uint8Array | null = null;
  private ripples: Ripple[] = [];
  private lastRipple = -1;
  private pointer: { x: number; y: number; t: number } | null = null;
  /* private */ pads: Array<[number, number, number]> = [];
  private lily: [number, number, number] | null = null;
  private arcDist = new Float64Array(0);

  constructor(width: number, height: number, opts: PondOptions = {}) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.rand = opts.random ?? Math.random;
    this.count = opts.boids ?? 42;
    this.water = opts.water;
    this.updateShapes(0);
    this.cacheFields();
  }

  resize(width: number, height: number): void {
    width = Math.max(1, width);
    height = Math.max(1, height);
    const kx = width / this.width;
    const ky = height / this.height;
    for (const b of this.boids) {
      b.x *= kx;
      b.y *= ky;
    }
    this.width = width;
    this.height = height;
    this.updateShapes(this.t);
    this.cacheFields();
  }

  setLily(x: number, y: number, r: number): void {
    this.lily = [x, y, r];
    this.updateShapes(this.t);
  }

  setTank(tank: Crop | null): void {
    if (!tank) this.boids = [];
    else if (!this.tank) this.spawn(tank);
    this.tank = tank;
  }

  poke(x: number, y: number, t: number): void {
    this.pointer = { x, y, t };
    if (t - this.lastRipple < 0.12) return;
    this.lastRipple = t;
    this.ripples.push({ x, y, t0: t });
    if (this.ripples.length > 8) this.ripples.shift();
  }

  step(t: number, dt: number): void {
    this.t = t;
    dt = Math.min(0.1, Math.max(0.001, dt));
    this.ripples = this.ripples.filter((r) => t - r.t0 < 3.5);
    this.updateShapes(t);
    this.tones = this.water?.(t, this.width, this.height) ?? null;
    this.stepBoids(dt, t);
  }

  render(buf: Uint32Array, crop: Crop): void {
    const t = this.t;
    const W = this.width;
    const H = this.height;
    // const pads = this.pads;
    // const S = W + 1;
    const { /* arcDist, */ tones } = this;

    const rip = this.ripples.map((r) => {
      const age = t - r.t0;
      const front = age * 55;
      // squared reach, so dots outside the ring skip the sqrt
      const reach2 = front > 0.001 ? (front - 0.001) ** 2 : -1;
      return { x: r.x, y: r.y, reach2, amp: 0.55 * Math.exp(-age * 1.3), ph: -age * 6 };
    });

    // Swaying flat arcs
    // const arcR1 = H * 1.05 + 9 * Math.sin(t * 0.55);
    // const arcR2 = H * 0.8 + 7 * Math.sin(t * 0.55 + 0.8);

    let o = 0;
    for (let j = 0; j < crop.sh; j++) {
      const Y = crop.sy + j;
      // const arcSway = 5 * Math.sin(Y * 0.04 + t * 0.9);
      const waterRow = Math.min(Y, H - 1) * W;
      // const row = Math.min(Y, H) * S;
      for (let i = 0; i < crop.sw; i++, o++) {
        const X = crop.sx + i;
        // const f = row + Math.min(X, W);

        // const ad = arcDist[f] + arcSway;
        // if (Math.abs(ad - arcR1) < 5.5 || Math.abs(ad - arcR2) < 2) {
        //   buf[o] = ARC;
        //   continue;
        // }

        // let onPad = false;
        // for (let p = 0; p < pads.length; p++) {
        //   const dx = X - pads[p][0];
        //   const dy = (Y - pads[p][1]) * 1.25;
        //   if (dx * dx + dy * dy < pads[p][2]) {
        //     onPad = true;
        //     break;
        //   }
        // }
        // if (onPad) {
        //   buf[o] = FLAT;
        //   continue;
        // }

        let sx = 0;
        let sy = 0;
        for (let r = 0; r < rip.length; r++) {
          const q = rip[r];
          const dx = X - q.x;
          const dy = Y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > q.reach2) continue;
          const d = Math.sqrt(d2) + 0.001;
          const a = (q.amp * 0.3 * Math.cos(d * 0.3 + q.ph)) / (1 + d * 0.02);
          sx += (a * dx) / d;
          sy += (a * dy) / d;
        }

        const water = tones ? tones[(waterRow + Math.min(X, W - 1)) * 4] / 255 : 0;
        const tone = water + 1.5 * (sx * LX + sy * LY);
        buf[o] = tone > BAYER[(Y & 7) * 8 + (X & 7)] ? INK : PAPER;
      }
    }

    this.renderFish(buf, crop, t);
  }

  // ---------------------------------------------------------------------------

  /** Arc distance per dot, which depends only on the field size. One spare row and column covers crops that round past the edge. */
  private cacheFields(): void {
    const W = this.width;
    const H = this.height;
    const S = W + 1;
    this.arcDist = new Float64Array(S * (H + 1));
    const arcCx = W * 0.05;
    const arcCy = H * 1.35;
    for (let Y = 0; Y <= H; Y++) {
      for (let X = 0; X <= W; X++) this.arcDist[Y * S + X] = Math.hypot(X - arcCx, Y - arcCy);
    }
  }

  /** Boids evenly spaced around the tank's perimeter, OUT dots outside it, heading for its centre. */
  private spawn({ sx, sy, sw, sh }: Crop): void {
    const OUT = 20;
    const n = this.count;
    this.boids = [];
    for (let i = 0; i < n; i++) {
      let d = ((i + 0.5) / n) * 2 * (sw + sh);
      let x: number;
      let y: number;
      if (d < sw) [x, y] = [sx + d, sy - OUT];
      else if ((d -= sw) < sh) [x, y] = [sx + sw + OUT, sy + d];
      else if ((d -= sh) < sw) [x, y] = [sx + sw - d, sy + sh + OUT];
      else [x, y] = [sx - OUT, sy + sh - (d - sw)];
      const a = Math.atan2(sy + sh / 2 - y, sx + sw / 2 - x);
      this.boids.push({ x, y, vx: Math.cos(a) * 30, vy: Math.sin(a) * 30, size: 0.8 + this.rand() * 0.45, seed: this.rand() * Math.PI * 2 });
    }
  }

  private updateShapes(t: number): void {
    this.pads = PADS.map(([fx, fy, r, ph], i) => {
      const breathe = 1 + 0.06 * Math.sin(t * 0.9 + ph);
      if (i === LILY && this.lily) return [this.lily[0], this.lily[1], this.lily[2] ** 2 * breathe];
      return [fx * this.width + 10 * Math.sin(t * 0.35 + ph), fy * this.height + 5 * Math.cos(t * 0.5 + ph), r * r * breathe];
    });
  }

  private stepBoids(dt: number, t: number): void {
    const T = this.tank;
    if (!T) return;
    const B = this.boids;
    const n = B.length;
    const VIEW = 34;
    const SEP = 11;
    const MAX_SPEED = 80;
    const MIN_SPEED = 18;
    const P = this.pointer && t - this.pointer.t < 0.6 ? this.pointer : null;

    for (let i = 0; i < n; i++) {
      const b = B[i];
      let cx = 0, cy = 0, ax = 0, ay = 0, sx = 0, sy = 0, cnt = 0;
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const o = B[j];
        const dx = o.x - b.x;
        const dy = o.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > VIEW * VIEW) continue;
        cnt++;
        cx += o.x;
        cy += o.y;
        ax += o.vx;
        ay += o.vy;
        if (d2 < SEP * SEP) {
          const d = Math.sqrt(d2) + 0.01;
          sx -= (dx / d) * (SEP - d);
          sy -= (dy / d) * (SEP - d);
        }
      }

      let fx = 0;
      let fy = 0;
      if (cnt) {
        fx += (cx / cnt - b.x) * 0.6 + (ax / cnt - b.vx) * 0.9; // cohesion + alignment
        fy += (cy / cnt - b.y) * 0.6 + (ay / cnt - b.vy) * 0.9;
      }
      fx += sx * 5; // separation
      fy += sy * 5;

      // for (const [px, py, r2] of this.pads) {
      //   const dx = b.x - px;
      //   const dy = b.y - py;
      //   const d = Math.hypot(dx, dy) + 0.01;
      //   const r = Math.sqrt(r2) + 14;
      //   if (d < r) {
      //     fx += (dx / d) * (r - d) * 14;
      //     fy += (dy / d) * (r - d) * 14;
      //   }
      // }

      if (P) {
        const dx = b.x - P.x;
        const dy = b.y - P.y;
        const d = Math.hypot(dx, dy) + 0.01;
        if (d < 55) {
          fx += (dx / d) * (55 - d) * 12;
          fy += (dy / d) * (55 - d) * 12;
        }
      }

      // soft walls of the tank, much harder from outside so new boids rush in
      const out = b.x < T.sx || b.x > T.sx + T.sw || b.y < T.sy || b.y > T.sy + T.sh;
      const m = 24;
      const k = out ? 60 : 16;
      if (b.x < T.sx + m) fx += (T.sx + m - b.x) * k;
      if (b.x > T.sx + T.sw - m) fx -= (b.x - T.sx - T.sw + m) * k;
      if (b.y < T.sy + m) fy += (T.sy + m - b.y) * k;
      if (b.y > T.sy + T.sh - m) fy -= (b.y - T.sy - T.sh + m) * k;

      fx += Math.sin(t * 0.7 + b.seed * 3) * 6; // wander
      fy += Math.cos(t * 0.6 + b.seed * 2) * 6;

      b.vx += fx * dt;
      b.vy += fy * dt;
      const sp = Math.hypot(b.vx, b.vy) || 1;
      const lim = P ? MAX_SPEED * 1.8 : MAX_SPEED;
      if (sp > lim) {
        b.vx *= lim / sp;
        b.vy *= lim / sp;
      } else if (sp < MIN_SPEED) {
        b.vx *= MIN_SPEED / sp;
        b.vy *= MIN_SPEED / sp;
      }
      b.x += b.vx * dt;
      b.y += b.vy * dt;
    }
  }

  private renderFish(buf: Uint32Array, crop: Crop, t: number): void {
    for (const b of this.boids) {
      const sp = Math.hypot(b.vx, b.vy) || 1;
      const c = b.vx / sp;
      const s = b.vy / sp;
      const k = b.size;
      const wag = Math.sin(t * 9 + b.seed) * 0.35;

      const x0 = Math.floor(b.x - 10 * k) - crop.sx;
      const x1 = Math.ceil(b.x + 10 * k) - crop.sx;
      const y0 = Math.floor(b.y - 10 * k) - crop.sy;
      const y1 = Math.ceil(b.y + 10 * k) - crop.sy;
      if (x1 < 0 || y1 < 0 || x0 >= crop.sw || y0 >= crop.sh) continue;

      for (let j = Math.max(0, y0); j <= Math.min(crop.sh - 1, y1); j++) {
        for (let i = Math.max(0, x0); i <= Math.min(crop.sw - 1, x1); i++) {
          const dx = (crop.sx + i - b.x) / k;
          const dy = (crop.sy + j - b.y) / k;
          const u = dx * c + dy * s;
          const v = -dx * s + dy * c;
          const tv = u < -3.6 ? v - wag * (u + 3.6) : v; // only the tail bends as it wags, from its root
          const body = (u / 4.6) ** 2 + (v / 1.7) ** 2;
          const tail = u < -3.6 && u > -7.4 && Math.abs(tv) < (-u - 3.6) * 0.7 + 0.4;
          const idx = j * crop.sw + i;
          if (body < 1 || tail) buf[idx] = FISH;
          else if (body < 1.9 || (u < -3 && u > -8.4 && Math.abs(tv) < (-u - 3) * 0.7 + 1.4)) buf[idx] = PAPER;
        }
      }
    }
  }
}
