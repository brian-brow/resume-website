/**
 * Pond simulation core: water surface + 1-bit Bayer dither + boids.
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
}

// Colours as little-endian ABGR for Uint32 views over ImageData
const INK = 0xff1c1c1c;
const PAPER = 0xffffffff;
const FLAT = 0xffd2d6d6;

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

/** Directional waves: [kx, ky, amplitude, speed, phase] */
const WAVES: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [0.06, 0.02, 1.3, 0.9, 0.0],
  [-0.03, 0.075, 0.8, 1.2, 1.7],
  [0.11, -0.05, 0.3, 1.4, 3.1],
];

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
  boids?: number;
  /** Deterministic random source, handy for tests. */
  random?: () => number;
}

export class Pond implements PondCore {
  width: number;
  height: number;
  boids: Boid[] = [];

  private t = 0;
  private ripples: Ripple[] = [];
  private lastRipple = -1;
  private pointer: { x: number; y: number; t: number } | null = null;
  private pads: Array<[number, number, number]> = [];
  private lily: [number, number, number] | null = null;
  private phases = new Float32Array(WAVES.length);
  private arcDist = new Float64Array(0);
  private lightFall = new Float64Array(0);
  private colCos = new Float64Array(0);
  private colSin = new Float64Array(0);
  private rowCos = new Float64Array(WAVES.length);
  private rowSin = new Float64Array(WAVES.length);

  constructor(width: number, height: number, opts: PondOptions = {}) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    const rand = opts.random ?? Math.random;
    const count = opts.boids ?? 42;
    for (let i = 0; i < count; i++) {
      const a = rand() * Math.PI * 2;
      this.boids.push({
        x: this.width * (0.1 + rand() * 0.8),
        y: this.height * (0.1 + rand() * 0.8),
        vx: Math.cos(a) * 30,
        vy: Math.sin(a) * 30,
        size: 0.8 + rand() * 0.45,
        seed: rand() * Math.PI * 2,
      });
    }
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
    for (let i = 0; i < WAVES.length; i++) this.phases[i] = WAVES[i][4] - WAVES[i][3] * t;
    this.ripples = this.ripples.filter((r) => t - r.t0 < 3.5);
    this.updateShapes(t);
    this.stepBoids(dt, t);
  }

  render(buf: Uint32Array, crop: Crop): void {
    const t = this.t;
    const W = this.width;
    const H = this.height;
    const phases = this.phases;
    const nw = WAVES.length;
    const pads = this.pads;
    const S = W + 1;
    const { arcDist, lightFall, rowCos, rowSin } = this;

    const rip = this.ripples.map((r) => {
      const age = t - r.t0;
      const front = age * 55;
      // squared reach, so dots outside the ring skip the sqrt
      const reach2 = front > 0.001 ? (front - 0.001) ** 2 : -1;
      return { x: r.x, y: r.y, reach2, amp: 0.55 * Math.exp(-age * 1.3), ph: -age * 6 };
    });

    // Swaying flat arcs
    const arcR1 = H * 1.05 + 9 * Math.sin(t * 0.55);
    const arcR2 = H * 0.8 + 7 * Math.sin(t * 0.55 + 0.8);

    // Column half of each wave angle, split out by cos(a + b) = cos a cos b - sin a sin b
    const sw = crop.sw;
    if (this.colCos.length < nw * sw) {
      this.colCos = new Float64Array(nw * sw);
      this.colSin = new Float64Array(nw * sw);
    }
    const { colCos, colSin } = this;
    for (let k = 0; k < nw; k++) {
      for (let i = 0; i < sw; i++) {
        const a = WAVES[k][0] * (crop.sx + i);
        colCos[k * sw + i] = Math.cos(a);
        colSin[k * sw + i] = Math.sin(a);
      }
    }

    let o = 0;
    for (let j = 0; j < crop.sh; j++) {
      const Y = crop.sy + j;
      const warpX = 4 * Math.sin(Y * 0.031 + t * 0.4);
      const arcSway = 5 * Math.sin(Y * 0.04 + t * 0.9);
      for (let k = 0; k < nw; k++) {
        const w = WAVES[k];
        const b = w[0] * warpX + w[1] * Y + phases[k];
        rowCos[k] = w[2] * Math.cos(b);
        rowSin[k] = w[2] * Math.sin(b);
      }
      const row = Math.min(Y, H) * S;
      for (let i = 0; i < sw; i++, o++) {
        const X = crop.sx + i;
        const f = row + Math.min(X, W);

        const ad = arcDist[f] + arcSway;
        if (Math.abs(ad - arcR1) < 5.5 || Math.abs(ad - arcR2) < 2) {
          buf[o] = FLAT;
          continue;
        }

        let onPad = false;
        for (let p = 0; p < pads.length; p++) {
          const dx = X - pads[p][0];
          const dy = (Y - pads[p][1]) * 1.25;
          if (dx * dx + dy * dy < pads[p][2]) {
            onPad = true;
            break;
          }
        }
        if (onPad) {
          buf[o] = FLAT;
          continue;
        }

        // Surface slope from the summed waves
        let sx = 0;
        let sy = 0;
        for (let k = 0; k < nw; k++) {
          const c = colCos[k * sw + i] * rowCos[k] - colSin[k * sw + i] * rowSin[k];
          sx += c * WAVES[k][0];
          sy += c * WAVES[k][1];
        }
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

        const tone = 0.06 + 0.42 * lightFall[f] + 1.5 * (sx * LX + sy * LY);
        buf[o] = tone > BAYER[(Y & 7) * 8 + (X & 7)] ? INK : PAPER;
      }
    }

    this.renderFish(buf, crop, t);
  }

  // ---------------------------------------------------------------------------

  /** Arc distance and light falloff per dot, which depend only on the field size. One spare row and column covers crops that round past the edge. */
  private cacheFields(): void {
    const W = this.width;
    const H = this.height;
    const S = W + 1;
    this.arcDist = new Float64Array(S * (H + 1));
    this.lightFall = new Float64Array(S * (H + 1));
    const arcCx = W * 0.05;
    const arcCy = H * 1.35;
    const lightX = W * 0.625;
    const lightY = H * 0.38;
    const lightR = W * 0.79;
    for (let Y = 0; Y <= H; Y++) {
      for (let X = 0; X <= W; X++) {
        const bx = X - lightX;
        const by = Y - lightY;
        this.arcDist[Y * S + X] = Math.hypot(X - arcCx, Y - arcCy);
        this.lightFall[Y * S + X] = 1 - Math.min(Math.sqrt(bx * bx + by * by) / lightR, 1);
      }
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
    const B = this.boids;
    const n = B.length;
    const VIEW = 34;
    const SEP = 11;
    const MAX_SPEED = 42;
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

      for (const [px, py, r2] of this.pads) {
        const dx = b.x - px;
        const dy = b.y - py;
        const d = Math.hypot(dx, dy) + 0.01;
        const r = Math.sqrt(r2) + 14;
        if (d < r) {
          fx += (dx / d) * (r - d) * 14;
          fy += (dy / d) * (r - d) * 14;
        }
      }

      if (P) {
        const dx = b.x - P.x;
        const dy = b.y - P.y;
        const d = Math.hypot(dx, dy) + 0.01;
        if (d < 55) {
          fx += (dx / d) * (55 - d) * 12;
          fy += (dy / d) * (55 - d) * 12;
        }
      }

      const m = 24; // soft walls
      if (b.x < m) fx += (m - b.x) * 8;
      if (b.x > this.width - m) fx -= (b.x - this.width + m) * 8;
      if (b.y < m) fy += (m - b.y) * 8;
      if (b.y > this.height - m) fy -= (b.y - this.height + m) * 8;

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
          let v = -dx * s + dy * c;
          if (u < 0) v -= wag * u * 0.5; // tail bends as it wags
          const body = (u / 4.6) ** 2 + (v / 1.7) ** 2;
          const tail = u < -3.6 && u > -7.4 && Math.abs(v) < (-u - 3.6) * 0.7 + 0.4;
          const idx = j * crop.sw + i;
          if (body < 1 || tail) buf[idx] = INK;
          else if (body < 1.9 || (u < -3 && u > -8.4 && Math.abs(v) < (-u - 3) * 0.7 + 1.4)) buf[idx] = PAPER;
        }
      }
    }
  }
}
