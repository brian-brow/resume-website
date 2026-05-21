export interface TileData {
  filename: string
  top: string
  right: string
  bottom: string
  left: string
}

export const TILE_DATA: TileData[] = [
  { filename: '000000000000.png', top: '000', right: '000', bottom: '000', left: '000' },
  { filename: '000000010010.png', top: '000', right: '000', bottom: '010', left: '010' },
  { filename: '000000012210.png', top: '000', right: '000', bottom: '012', left: '210' },
  { filename: '000010000010.png', top: '000', right: '010', bottom: '000', left: '010' },
  { filename: '000010010000.png', top: '000', right: '010', bottom: '010', left: '000' },
  { filename: '000010010010.png', top: '000', right: '010', bottom: '010', left: '010' },
  { filename: '000010012210.png', top: '000', right: '010', bottom: '012', left: '210' },
  { filename: '000012210000.png', top: '000', right: '012', bottom: '210', left: '000' },
  { filename: '000012210010.png', top: '000', right: '012', bottom: '210', left: '010' },
  { filename: '000012222210.png', top: '000', right: '012', bottom: '222', left: '210' },
  { filename: '010000000010.png', top: '010', right: '000', bottom: '000', left: '010' },
  { filename: '010000010000.png', top: '010', right: '000', bottom: '010', left: '000' },
  { filename: '010000010010.png', top: '010', right: '000', bottom: '010', left: '010' },
  { filename: '010000012210.png', top: '010', right: '000', bottom: '012', left: '210' },
  { filename: '010010000000.png', top: '010', right: '010', bottom: '000', left: '000' },
  { filename: '010010000010.png', top: '010', right: '010', bottom: '000', left: '010' },
  { filename: '010010010000.png', top: '010', right: '010', bottom: '010', left: '000' },
  { filename: '010012210000.png', top: '010', right: '012', bottom: '210', left: '000' },
  { filename: '012210000000.png', top: '012', right: '210', bottom: '000', left: '000' },
  { filename: '012210000010.png', top: '012', right: '210', bottom: '000', left: '010' },
  { filename: '012210010000.png', top: '012', right: '210', bottom: '010', left: '000' },
  { filename: '012222210000.png', top: '012', right: '222', bottom: '210', left: '000' },
  { filename: '012222210010.png', top: '012', right: '222', bottom: '210', left: '010' },
  { filename: '012222222210.png', top: '012', right: '222', bottom: '222', left: '210' },
  { filename: '210000000012.png', top: '210', right: '000', bottom: '000', left: '012' },
  { filename: '210000010012.png', top: '210', right: '000', bottom: '010', left: '012' },
  { filename: '210000012222.png', top: '210', right: '000', bottom: '012', left: '222' },
  { filename: '210010000012.png', top: '210', right: '010', bottom: '000', left: '012' },
  { filename: '210010012222.png', top: '210', right: '010', bottom: '012', left: '222' },
  { filename: '210012222222.png', top: '210', right: '012', bottom: '222', left: '222' },
  { filename: '222210000012.png', top: '222', right: '210', bottom: '000', left: '012' },
  { filename: '222210012222.png', top: '222', right: '210', bottom: '012', left: '222' },
  { filename: '222222210012.png', top: '222', right: '222', bottom: '210', left: '012' },
  { filename: '222222222222.png', top: '222', right: '222', bottom: '222', left: '222' },
]
