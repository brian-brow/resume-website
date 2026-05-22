import { useState, useEffect, useRef } from 'react'
import { Board } from './wfcollapse'
import { TILE_DATA } from './tileData'

const tileModules = import.meta.glob('./assets/water/*.png', { eager: true })
const imageMap = Object.fromEntries(
  Object.entries(tileModules).map(([path, mod]) => [
    path.split('/').pop()!,
    (mod as any).default as string
  ])
)

const resolvedTileData = TILE_DATA.map(t => ({
  ...t,
  image: imageMap[t.filename],
}))

interface TileGridProps {
  cols: number
  rows: number
  speed: number
}

export default function TileGrid({ cols, rows, speed }: TileGridProps) {
  const [_, setTick] = useState(0)
  const [availableWidth, setAvailableWidth] = useState(0)
  const [availableHeight, setAvailableHeight] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef<Board | null>(null)

  if (!boardRef.current) {
    boardRef.current = new Board(rows, cols, resolvedTileData)
  }

  useEffect(() => {
    boardRef.current = new Board(rows, cols, resolvedTileData)
    setTick(0)
  }, [rows, cols])

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
        boardRef.current = new Board(rows, cols, resolvedTileData)
        setTick(0)
      }}
      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}
      className="pt-12"
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
      }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ overflow: 'hidden' }} className={images[i] ? '' : 'border border-gray-800'}>
            {images[i]
              ? <img src={images[i]!} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div className="w-full h-full flex items-center justify-center text-m text-gray-200">
                {boardRef.current!.getPossibilities()[i].length}
              </div>}
          </div>
        ))}
      </div>
    </div>
  )
}
