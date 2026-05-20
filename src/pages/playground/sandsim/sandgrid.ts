// Grid stores cell values directly as numbers (0 = empty, 255 = sand)
export class SandGrid {
  readonly cols: number
  readonly rows: number
  readonly scale: number
  readonly probability: number
  private cells: Uint8Array

  constructor(canvasWidth: number, canvasHeight: number, scale: number) {
    this.scale = scale
    this.cols = Math.floor(canvasWidth / scale)
    this.rows = Math.floor(canvasHeight / scale)
    this.cells = new Uint8Array(this.cols * this.rows)
    this.probability = 0.8
  }

  idx(x: number, y: number): number {
    return y * this.cols + x
  }

  get(x: number, y: number): number {
    return this.cells[this.idx(x, y)]
  }

  set(x: number, y: number, val: number): void {
    this.cells[this.idx(x, y)] = val
  }

  inBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.cols && y >= 0 && y < this.rows
  }

  step(): void {
    for (let y = 1; y < this.rows; y++) {
      // creates some jank artifacts that i think look cool
      const rtl = Math.random() < 0.5
      for (let xi = 0; xi < this.cols; xi++) {
        const x = rtl ? this.cols - 1 - xi : xi
        const val = this.get(x, y)
        if (val === 0) continue
        if (this.get(x, y - 1) === 0) {
          this.set(x, y, 0)
          this.set(x, y - 1, val)
        } else {
          const leftFree  = x - 1 >= 0         && this.get(x - 1, y - 1) === 0
          const rightFree = x + 1 < this.cols  && this.get(x + 1, y - 1) === 0
          if (leftFree && rightFree) {
            if (Math.random() < this.probability) {
              this.set(x, y, 0)
              Math.random() < 0.5
                ? this.set(x - 1, y - 1, val)
                : this.set(x + 1, y - 1, val)
            }
          } else if (rightFree) {
            if (Math.random() < this.probability) {
              this.set(x, y, 0); this.set(x + 1, y - 1, val)
            }
          } else if (leftFree) {
            if (Math.random() < this.probability) {
              this.set(x, y, 0); this.set(x - 1, y - 1, val)
            }
          }
        }
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, this.cols * this.scale, this.rows * this.scale)
    let sandColors = ['#B8860C', '#E7B744', '#F1BB5E']
    // ctx.fillStyle = '#458391'
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        let i = this.get(x,y)
        if (i !== 0) {
          ctx.fillStyle = sandColors[i]
          ctx.fillRect(x * this.scale, (this.rows - 1 - y) * this.scale, this.scale, this.scale)
        }
      }
    }
  }

  spawn(gridX: number, gridY: number, radius: number): void {
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2
      const mag   = Math.random() * radius
      const x     = Math.round(gridX + Math.cos(angle) * mag)
      const y     = Math.round(gridY + Math.sin(angle) * mag)
      if (this.inBounds(x, y) && this.get(x, y) === 0) {
        this.set(x, y, [1,2,3][Math.floor(Math.random() * 3)])
      }
    }
  }

  erase(gridX: number, gridY: number, radius: number): void {
    for (let i = 0; i < 100; i++) {
      const angle = Math.random() * Math.PI * 2
      const mag   = Math.random() * radius
      const x     = Math.round(gridX + Math.cos(angle) * mag)
      const y     = Math.round(gridY + Math.sin(angle) * mag)
      if (this.inBounds(x, y) && this.get(x, y) !== 0) {
        this.set(x, y, 0)
      }
    }
  }
}
