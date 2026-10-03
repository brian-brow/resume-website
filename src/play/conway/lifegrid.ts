// Grid stores cell values directly as numbers (0 = dead, 1 = alive); edges wrap

export class LifeGrid {
  readonly cols: number
  readonly rows: number
  readonly scale: number
  private cells: Uint8Array

  constructor(canvasWidth: number, canvasHeight: number, scale: number) {
    this.scale = scale;
    this.cols = Math.floor(canvasWidth / scale);
    this.rows = Math.floor(canvasHeight / scale);
    this.cells = new Uint8Array(this.cols * this.rows);
  }

  idx(x: number, y: number): number {
    return y * this.cols + x;
  }

  get(x: number, y: number): number {
    return this.cells[this.idx(x, y)];
  }

  set(x: number, y: number, val: number): void {
    this.cells[this.idx(x, y)] = val;
  }

  step(): void {
    const next = this.cells.slice();

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        let count = 0;

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx || dy) count += this.get((x + dx + this.cols) % this.cols, (y + dy + this.rows) % this.rows);
          }
        }

        const i = this.idx(x, y);
        if (count < 2 || count > 3) next[i] = 0;
        else if (count === 3) next[i] = 1;
      }
    }

    this.cells = next;
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.fillStyle = getComputedStyle(ctx.canvas).getPropertyValue('--ink')
    for (let i = 0; i < this.rows * this.cols; i++) {
      if (this.cells[i] !== 0) {
        const x = i % this.cols
        const y = Math.floor(i / this.cols)
        ctx.fillRect(x * this.scale, y * this.scale, this.scale, this.scale)
      }
    }
  }

  inBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.cols && y >= 0 && y < this.rows
  }

  spawn(gridX: number, gridY: number, radius: number): void {
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2
      const mag   = Math.random() * radius
      const x     = Math.round(gridX + Math.cos(angle) * mag)
      const y     = Math.round(gridY + Math.sin(angle) * mag)
      if (this.inBounds(x, y)) this.set(x, y, 1)
    }
  }

  erase(gridX: number, gridY: number, radius: number): void {
    for (let i = 0; i < 100; i++) {
      const angle = Math.random() * Math.PI * 2
      const mag   = Math.random() * radius
      const x     = Math.round(gridX + Math.cos(angle) * mag)
      const y     = Math.round(gridY + Math.sin(angle) * mag)
      if (this.inBounds(x, y)) this.set(x, y, 0)
    }
  }
}
