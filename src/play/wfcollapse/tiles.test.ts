import { expect, test } from 'bun:test'
import { generateTiles, THEMES } from './tiles'

const tiles = generateTiles(THEMES.pond)
const codes = new Set(tiles.map(t => t.top + t.right + t.bottom + t.left))

test('every drawable combination appears once', () => {
  expect(codes.size).toBe(74)
})

test('edges agree on shared corners, differing corners are split by a road, no dead ends', () => {
  for (const code of codes) {
    const [top, right, bottom, left] = code.match(/.{3}/g)!
    expect([top[2], right[2], bottom[2], left[2]]).toEqual([right[0], bottom[0], left[0], top[0]])
    for (const e of [top, right, bottom, left]) if (e[0] !== e[2]) expect(e[1]).toBe('1')
    expect([top, right, bottom, left].filter(e => e[1] === '1').length).not.toBe(1)
  }
})
