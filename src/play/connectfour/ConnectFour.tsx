import { useState, useEffect } from 'react'

const ROWS = 6
const COLS = 7
const CELL = 56
const GAP = 14
const PADDING = 14
const RING = CELL - 20
const YOU = 'var(--ink)'
const CPU = 'var(--accent)'
const RING_EDGE = 'rgba(0,0,0,0.25)'

interface FallingPiece {
  col: number
  row: number
  player: 'B' | 'W'
  animating: boolean
}

export default function ConnectFour() {
  const [grid, setGrid] = useState<(null | 'B' | 'W')[][]>(
    Array.from({ length: 6 }, () => Array(7).fill(null))
  )
  const [falling, setFalling] = useState<FallingPiece | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<'B' | 'W'>('B')
  const [over, setOver] = useState(false)
  const [winner, setWinner] = useState<'B' | 'W' | null>(null)

  function drop(col: number) {
    if (over) return
    if (falling) return
    let destRow = -1
    for (let row = 5; row >= 0; row--) {
      if (grid[row][col] === null) { destRow = row; break }
    }
    if (destRow === -1) return

    setFalling({ col, row: destRow, player: currentPlayer, animating: false })
  }

  function compute(newGrid: (null | 'B' | 'W')[][], player: 'B' | 'W'): boolean {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        if (newGrid[r][c] === player && newGrid[r][c+1] === player && newGrid[r][c+2] === player && newGrid[r][c+3] === player) return true
      }
    }
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c < COLS; c++) {
        if (newGrid[r][c] === player && newGrid[r+1][c] === player && newGrid[r+2][c] === player && newGrid[r+3][c] === player) return true
      }
    }
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        if (newGrid[r][c] === player && newGrid[r+1][c+1] === player && newGrid[r+2][c+2] === player && newGrid[r+3][c+3] === player) return true
      }
    }
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 3; c < COLS; c++) {
        if (newGrid[r][c] === player && newGrid[r+1][c-1] === player && newGrid[r+2][c-2] === player && newGrid[r+3][c-3] === player) return true
      }
    }
    return false
  }

  function reset() {
    const newGrid = Array.from({ length: 6 }, () => Array(7).fill(null))
    setGrid(newGrid)
    setOver(false);
    setCurrentPlayer('B');
  }

  function minmax(newGrid: (null | 'B' | 'W')[][], depth: number, isMaximizing: boolean): number {
    if (compute(newGrid, 'W')) return 1000
    if (compute(newGrid, 'B')) return -1000
    if (depth === 0) return 0

    if (isMaximizing) {
      let best = -Infinity
      for (let col = 0; col < COLS; col++) {
        let destRow = -1
        for (let row = 5; row >= 0; row--) {
          if (newGrid[row][col] === null) { destRow = row; break }
        }
        if (destRow === -1) continue
        const next = newGrid.map(r => [...r])
        next[destRow][col] = 'W'
        best = Math.max(best, minmax(next, depth - 1, false))
      }
      return best
    } else {
      let best = Infinity
      for (let col = 0; col < COLS; col++) {
        let destRow = -1
        for (let row = 5; row >= 0; row--) {
          if (newGrid[row][col] === null) { destRow = row; break }
        }
        if (destRow === -1) continue

        const next = newGrid.map(r => [...r])
        next[destRow][col] = 'B'
        best = Math.min(best, minmax(next, depth - 1, true))
      }
      return best
    }
  }

  function getBestMove(newGrid: (null | 'B' | 'W')[][]): number {
    let bestScore = -Infinity
    let bestCol = 0
    for (let col = 0; col < COLS; col++) {
      let destRow = -1
      for (let row = 5; row >= 0; row--) {
        if (newGrid[row][col] === null) { destRow = row; break }
      }
      if (destRow === -1) continue
      const next = newGrid.map(r => [...r])
      next[destRow][col] = 'W'
      const score = minmax(next, 4, false)
      if (score > bestScore) { bestScore = score; bestCol = col }
    }
    return bestCol
  }

  useEffect(() => {
    if (falling && !falling.animating) {
      requestAnimationFrame(() => {
        setFalling(f => f ? { ...f, animating: true } : null)
      })
    }

    if (falling && falling.animating) {
      const duration = falling.row * 60 + 80
      const timer = setTimeout(() => {
        const newGrid = grid.map(r => [...r])
        newGrid[falling.row][falling.col] = falling.player
        setGrid(newGrid)
        setFalling(null)
        if (compute(newGrid, falling.player)) {
          setOver(true);
          setWinner(falling.player)
        } else {
          setCurrentPlayer(p => p === 'B' ? 'W' : 'B')
        }
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [falling])

  useEffect(() => {
    if (currentPlayer === 'W' && !over && !falling) {
      const col = getBestMove(grid)
      drop(col)
    }
  }, [currentPlayer, grid])

  const fallingY = falling
    ? (falling.animating ? falling.row * (CELL + GAP) : 0)
    : 0
  const fallingX = falling ? PADDING + falling.col * (CELL + GAP) : 0
  const duration = falling ? falling.row * 60 + 80 : 0

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>

          <div style={{
            position: 'relative',
            background: 'rgba(243,244,246,0.06)',
            border: '1.5px solid rgba(243,244,246,0.18)',
            borderRadius: 12,
            padding: PADDING,
            display: 'grid',
            gridTemplateColumns: `repeat(7, ${CELL}px)`,
            gridTemplateRows: `repeat(6, ${CELL}px)`,
            gap: GAP,
          }}>
            {falling && (
              <div style={{
                position: 'absolute',
                top: PADDING,
                left: fallingX,
                width: CELL,
                height: CELL,
                borderRadius: '50%',
                backgroundColor: falling.player === 'B' ? YOU : CPU,
                border: '1.5px solid rgba(243,244,246,0.13)',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `translateY(${fallingY}px)`,
                transition: falling.animating ? `transform ${duration}ms cubic-bezier(0.25, 0.1, 0.25, 1)` : 'none',
                pointerEvents: 'none',
                zIndex: 10,
              }}>
                <div style={{
                  width: RING,
                  height: RING,
                  borderRadius: '50%',
                  backgroundColor: 'transparent',
                  border: `1.5px solid ${RING_EDGE}`,
                }} />
              </div>
            )}

            {grid.map((row, r) =>
              row.map((cell, c) => (
                <div key={r * 7 + c} onClick={() => drop(c)} style={{
                  width: CELL,
                  height: CELL,
                  borderRadius: '50%',
                  backgroundColor: cell === 'B' ? YOU : cell === 'W' ? CPU : 'var(--stone)',
                  border: '1.5px solid rgba(243,244,246,0.13)',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}>
                  <div style={{
                    width: RING,
                    height: RING,
                    borderRadius: '50%',
                    backgroundColor: 'transparent',
                    border: `1.5px solid ${cell ? RING_EDGE : 'transparent'}`,
                  }} />
                </div>
              ))
            )}
          </div>
          {winner && (
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 12,
              backgroundColor: 'rgba(57,64,83,0.9)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              zIndex: 20,
            }}>
              <p style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
                {winner === 'B' ? 'You win!' : 'You lose!'}
              </p>
              <button
                onClick={() => { setWinner(null); reset() }}
                style={{
                  padding: '8px 24px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--line-dark)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                Play again
              </button>
            </div>
          )}

          <button
            onClick={reset}
            style={{
              padding: '8px 24px',
              backgroundColor: 'transparent',
              border: '1px solid var(--line-dark)',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Reset
          </button>

        </div>
      </div>
    </div>
  )
}
