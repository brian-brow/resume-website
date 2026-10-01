// Tiles are generated from their edge codes: 4 edges x 3 samples, clockwise
// (top, right, bottom, left). 0 = land, 1 = road, 2 = water. The corner
// samples are shared between edges; the middle sample is the edge itself.

export interface TileSpec {
  image: string
  top: string
  right: string
  bottom: string
  left: string
}

export interface Theme {
  land: string
  water: string
  road: string
  edge: string
  /** Stroke drawn over the road: a centre line, plank seams, ... */
  detail: { color: string; width: number; dash: string }
  /** Colour of lily pads on water, or null for none */
  pad: string | null
}

export const THEMES: Record<'roads' | 'pond', Theme> = {
  roads: {
    land: '#839073',
    water: '#4e4a59',
    road: '#394053',
    edge: '#dbfe87',
    detail: { color: '#dbfe87', width: 1.5, dash: '5 5' },
    pad: null,
  },
  pond: {
    land: '#7cae7a',
    water: '#394053',
    road: '#6e6362',
    edge: '#4e4a59',
    detail: { color: '#4e4a59', width: 12, dash: '1.5 4.5' },
    pad: '#839073',
  },
}

/** How many copies of a tile go in the pool, by road arm count; more copies = picked more often */
const WEIGHT: Record<number, number> = { 0: 12, 2: 3, 3: 1, 4: 1 }

const S = 60
const C = S / 2
const ROAD = 12
// Edge midpoints in edge order: top, right, bottom, left
const MIDS = [[C, 0], [S, C], [C, S], [0, C]]
// Quadrant origins in corner order: TL, TR, BR, BL
const QUADS = [[0, 0], [C, 0], [C, C], [0, C]]
// Tile corner points in corner order
const CORNERS = [[0, 0], [S, 0], [S, S], [0, S]]

/** Every drawable tile: corners are land or water, an edge between differing corners must be a road, no dead ends. */
export function generateTiles(theme: Theme): TileSpec[] {
  const out: TileSpec[] = []
  for (let mask = 0; mask < 16; mask++) {
    const corners = [0, 1, 2, 3].map(i => (mask >> i & 1 ? '2' : '0'))
    // Edge i runs from corner i to corner i + 1 (TL→TR is top, TR→BR is right, ...)
    const options = corners.map((a, i) => {
      const b = corners[(i + 1) % 4]
      return a === b ? [a, '1'] : ['1']
    })
    for (const mids of product(options)) {
      const arms = mids.filter(m => m === '1').length
      if (arms === 1) continue
      const edges = mids.map((m, i) => corners[i] + m + corners[(i + 1) % 4])
      const spec = { image: draw(corners, mids, theme), top: edges[0], right: edges[1], bottom: edges[2], left: edges[3] }
      for (let w = 0; w < WEIGHT[arms]; w++) out.push(spec)
    }
  }
  return out
}

function product(lists: string[][]): string[][] {
  return lists.reduce<string[][]>((acc, list) => acc.flatMap(a => list.map(x => [...a, x])), [[]])
}

function draw(corners: string[], mids: string[], t: Theme): string {
  const code = corners.join('') + mids.join('')
  const fill = (c: string) => (c === '2' ? t.water : t.land)
  const arms = mids.flatMap((m, i) => (m === '1' ? [i] : []))
  const turn = isTurn(arms)
  let body = ''
  if (turn) {
    // The three corners outside a turn always match; the inside corner follows the curve instead of being a square
    const [a, b] = arms
    const inner = b === a + 1 ? b : a
    body += `<rect width="${S}" height="${S}" fill="${fill(corners[(inner + 2) % 4])}"/>`
    body += `<path d="M ${MIDS[a].join(' ')} Q ${C} ${C} ${MIDS[b].join(' ')} L ${CORNERS[inner].join(' ')} Z" fill="${fill(corners[inner])}"/>`
  } else {
    corners.forEach((c, i) => {
      const [x, y] = QUADS[i]
      body += `<rect x="${x}" y="${y}" width="${C}" height="${C}" fill="${fill(c)}"/>`
    })
  }
  corners.forEach((c, i) => {
    if (c === '2' && t.pad && hash(code + i) % 5 < 2) body += pad(...QUADS[i] as [number, number], hash(code + i), t.pad)
  })

  if (arms.length) {
    const paths = roadPaths(arms)
    const stroke = (color: string, width: number, extra = '') =>
      paths.map(d => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" ${extra}/>`).join('')
    body += stroke(t.edge, ROAD + 2)
    body += stroke(t.road, ROAD)
    body += stroke(t.detail.color, t.detail.width, `stroke-dasharray="${t.detail.dash}"`)
  }
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" shape-rendering="geometricPrecision">${body}</svg>`)}`
}

/** Two arms on neighbouring edges */
const isTurn = (arms: number[]) => arms.length === 2 && (arms[1] - arms[0]) % 2 === 1

/** A turn is one curve through the centre; anything else is straight lines from the centre out. */
function roadPaths(arms: number[]): string[] {
  const p = (i: number) => MIDS[i].join(' ')
  if (isTurn(arms)) return [`M ${p(arms[0])} Q ${C} ${C} ${p(arms[1])}`]
  return arms.map(i => `M ${C} ${C} L ${p(i)}`)
}

/** A lily pad: a disc with a wedge cut out, kept clear of the roads at the quadrant's inner edges. */
function pad(qx: number, qy: number, h: number, color: string): string {
  const r = 4 + (h % 3)
  const lo = ROAD / 2 + r + 1
  const span = C - 2 * lo
  const cx = qx + lo + (h % 7) / 6 * span
  const cy = qy + lo + (h % 11) / 10 * span
  const a = (h % 360) * Math.PI / 180
  const x1 = cx + r * Math.cos(a), y1 = cy + r * Math.sin(a)
  const x2 = cx + r * Math.cos(a + 0.6), y2 = cy + r * Math.sin(a + 0.6)
  return `<path d="M ${cx} ${cy} L ${x2} ${y2} A ${r} ${r} 0 1 1 ${x1} ${y1} Z" fill="${color}"/>`
}

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}
