export class Tile {
  top: string
  right: string
  bottom: string
  left: string
  image: string

  constructor(image: string) {
    this.image = image
    const filename = image.split('/').pop()!.split('.')[0]
    this.top = filename.slice(0,3)
    this.right = filename.slice(3,6)
    this.bottom = filename.slice(6,9)
    this.left = filename.slice(9,12)
  }

  getTop(): string {
    return this.top
  }

  getRight(): string {
    return this.right
  }

  getBottom(): string {
    return this.bottom
  }

  getLeft(): string {
    return this.left
  }

  setImage(image: string) {
    this.image = image
  }

  getImage(): string {
    return this.image
  }
}

export class Board {
  tiles: Tile[]
  possibilities: Tile[][]
  grid: (Tile | null)[]
  rows: number
  cols: number

  constructor(rows: number, cols: number, images: string[]) {
    this.rows = rows
    this.cols = cols
    this.tiles = images.map(img => new Tile(img))
    this.grid = new Array(rows * cols).fill(null)
    this.possibilities = Array.from({ length: rows * cols }, () => [...this.tiles])

    const startIndex = Math.floor(Math.random() * this.rows * this.cols)
    const randTile = this.tiles[Math.floor(Math.random() * this.tiles.length)]
    this.grid[startIndex] = new Tile(randTile.getImage())
    this.possibilities[startIndex] = []
    this.propagate(startIndex)
  }

  propagate(index: number): void {
    const cell = this.grid[index]
    if (!cell) return
    const col = index % this.cols
    if (col + 1 < this.cols) {
      this.possibilities[index + 1] = this.possibilities[index + 1].filter(p =>
        cell.right === p.getLeft().split('').reverse().join('')
      )
    }
    if (col - 1 >= 0) {
      this.possibilities[index - 1] = this.possibilities[index - 1].filter(p =>
        cell.left === p.getRight().split('').reverse().join('')
      )
    }
    if (index - this.cols >= 0) {
      this.possibilities[index - this.cols] = this.possibilities[index - this.cols].filter(p =>
        cell.top === p.getBottom().split('').reverse().join('')
      )
    }
    if (index + this.cols < this.rows * this.cols) {
      this.possibilities[index + this.cols] = this.possibilities[index + this.cols].filter(p =>
        cell.bottom === p.getTop().split('').reverse().join('')
      )
    }
  }

  step(): void {
    let lowest = 999
    for (let i = 0; i < this.rows * this.cols; i++) {
      const len = this.possibilities[i].length
      if (len > 0 && len < lowest) {
        lowest = len
      }
    }

    let lowestList: number[] = []
    for (let i = 0; i < this.rows * this.cols; i++) {
      if (this.possibilities[i].length === lowest) lowestList.push(i)
    }

    if (lowestList.length === 0) return

    const tileIndex = lowestList[Math.floor(Math.random() * lowestList.length)]
    const tile = this.possibilities[tileIndex][Math.floor(Math.random() * this.possibilities[tileIndex].length)]
    this.grid[tileIndex] = new Tile(tile.getImage())
    this.possibilities[tileIndex] = []
    this.propagate(tileIndex)

  }

  compute(): void {
    this.grid = new Array(this.rows * this.cols).fill(null)
    this.possibilities = Array.from({ length: this.rows * this.cols }, () => [...this.tiles])


    for (let j = 0; j < this.rows * this.cols; j++) {
      this.step()
    }
  }

  getGridImages(): (string | undefined)[] {
    return this.grid.map(tile => tile ? tile.getImage() : undefined)
  }

  getPossibilities(): Tile[][] {
    return this.possibilities
  }

}

