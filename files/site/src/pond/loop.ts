import type { Crop, PondCore } from "./engine";

/** CSS pixels per dither dot. 3 = chunky, 2 = finer. */
export const DOT = 3;

export interface PondWindowHandle {
  canvas: HTMLCanvasElement;
  crop: Crop;
  active: boolean;
  image: ImageData | null;
  pixels: Uint32Array | null;
}

/**
 * Owns the animation loop. One simulation step per frame, then each active
 * window renders its crop of the shared field. Framework-agnostic: React only
 * registers canvases with it.
 */
export class PondLoop {
  private windows = new Set<PondWindowHandle>();
  private raf = 0;
  private t0 = performance.now();
  private lastStep = 0;
  private lastFrame = 0;
  private readonly still: boolean;

  constructor(
    private core: PondCore,
    private fps = 30,
  ) {
    this.still = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  now(): number {
    return (performance.now() - this.t0) / 1000;
  }

  resizeField(cssWidth: number, cssHeight: number): void {
    this.core.resize(Math.ceil(cssWidth / DOT), Math.ceil(cssHeight / DOT));
    this.requestStill();
  }

  add(canvas: HTMLCanvasElement): PondWindowHandle {
    const w: PondWindowHandle = { canvas, crop: { sx: 0, sy: 0, sw: 1, sh: 1 }, active: true, image: null, pixels: null };
    this.windows.add(w);
    return w;
  }

  remove(w: PondWindowHandle): void {
    this.windows.delete(w);
  }

  setCrop(w: PondWindowHandle, crop: Crop): void {
    const { sw, sh } = crop;
    if (w.canvas.width !== sw || w.canvas.height !== sh || !w.image) {
      w.canvas.width = sw;
      w.canvas.height = sh;
      const ctx = w.canvas.getContext("2d");
      w.image = ctx ? ctx.createImageData(sw, sh) : null;
      w.pixels = w.image ? new Uint32Array(w.image.data.buffer) : null;
    }
    w.crop = crop;
    this.requestStill();
  }

  /** Pin the lily pad at a centre and horizontal radius in css px, in the same space as window crops. */
  setLily(cssX: number, cssY: number, cssR: number): void {
    this.core.setLily(cssX / DOT, cssY / DOT, cssR / DOT);
    this.requestStill();
  }

  setActive(w: PondWindowHandle, active: boolean): void {
    w.active = active;
    if (active) this.requestStill();
  }

  /** Field coordinates for a pointer event over a window. */
  poke(w: PondWindowHandle, clientX: number, clientY: number): void {
    const r = w.canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const x = w.crop.sx + ((clientX - r.left) / r.width) * w.crop.sw;
    const y = w.crop.sy + ((clientY - r.top) / r.height) * w.crop.sh;
    this.core.poke(x, y, this.now());
  }

  start(): void {
    if (this.raf) return;
    const tick = (ms: number) => {
      this.raf = requestAnimationFrame(tick);
      if (ms - this.lastFrame < 1000 / this.fps - 1) return;
      this.lastFrame = ms;
      this.frame();
    };
    if (this.still) this.frame();
    else this.raf = requestAnimationFrame(tick);
  }

  stop(): void {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private frame(): void {
    const t = this.still ? 2 : this.now();
    this.core.step(t, t - this.lastStep);
    this.lastStep = t;
    for (const w of this.windows) {
      if (!w.active || !w.image || !w.pixels) continue;
      this.core.render(w.pixels, w.crop);
      w.canvas.getContext("2d")?.putImageData(w.image, 0, 0);
    }
  }

  /** With reduced motion there is no loop, so repaint once when layout changes. */
  private stillQueued = false;
  private requestStill(): void {
    if (!this.still || this.stillQueued) return;
    this.stillQueued = true;
    requestAnimationFrame(() => {
      this.stillQueued = false;
      this.frame();
    });
  }
}
