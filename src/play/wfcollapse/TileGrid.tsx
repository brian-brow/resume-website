import { useState, useEffect, useMemo, useRef } from 'react'
import { Board } from './wfcollapse'
import { generateTiles, THEMES } from './tiles'

interface TileGridProps {
  cols: number
  rows: number
  speed: number
  theme: keyof typeof THEMES
}

export default function TileGrid({ cols, rows, speed, theme }: TileGridProps) {
  const [_, setTick] = useState(0)
  const [availableWidth, setAvailableWidth] = useState(0)
  const [availableHeight, setAvailableHeight] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef<Board | null>(null)
  const tiles = useMemo(() => generateTiles(THEMES[theme]), [theme])

  if (!boardRef.current) {
    boardRef.current = new Board(rows, cols, tiles)
  }

  useEffect(() => {
    boardRef.current = new Board(rows, cols, tiles)
    setTick(0)
  }, [rows, cols, tiles])

  useEffect(() => {
    const interval = setInterval(() => {
      boardRef.current!.step()
      setTick(t => t + 1)
    }, speed)
    return () => clearInterval(interval)
  }, [speed])

  useEffect(() => {
    const ro = new ResizeObserver(([entry]) => {
      setAvailableWidth(entry.contentRect.width)
      setAvailableHeight(entry.contentRect.height)
    })
    ro.observe(containerRef.current!)
    return () => ro.disconnect()
  }, [])

  const images = boardRef.current.getGridImages()
  const total = boardRef.current.grid.length
  const cellSize = Math.floor(Math.min(availableWidth / cols, availableHeight / rows))

  return (
    <div
      ref={containerRef}
      onClick={() => {
        boardRef.current = new Board(rows, cols, tiles)
        setTick(0)
      }}
      style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
      }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ overflow: 'hidden', border: images[i] ? undefined : '1px solid var(--line-dark)' }}>
            {images[i]
              ? <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: images[i]! }} />
              : <div className="label" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {boardRef.current!.getPossibilities()[i].length}
              </div>}
          </div>
        ))}
      </div>
    </div>
  )
}
