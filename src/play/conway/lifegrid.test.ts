import { expect, test } from 'bun:test'
import { LifeGrid } from './lifegrid'

const alive = (g: LifeGrid) => {
  const out: string[] = []
  for (let y = 0; y < g.rows; y++) for (let x = 0; x < g.cols; x++) if (g.get(x, y)) out.push(`${x},${y}`)
  return out.sort()
}

test('a blinker across the wrapped corner oscillates', () => {
  const g = new LifeGrid(5, 5, 1)
  for (const x of [4, 0, 1]) g.set(x, 0, 1)
  g.step()
  expect(alive(g)).toEqual(['0,0', '0,1', '0,4'])
  g.step()
  expect(alive(g)).toEqual(['0,0', '1,0', '4,0'])
})
