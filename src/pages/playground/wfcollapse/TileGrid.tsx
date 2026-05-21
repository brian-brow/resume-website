import { useState, useEffect, useRef } from 'react'
import { Board } from './wfcollapse'

const tileModules = import.meta.glob('./assets/water/*.png', { eager: true })
const tileImages = Object.values(tileModules).map((mod: any) => mod.default as string)

interface TileGridProps {
  cols: number
  rows: number
}

export default function TileGrid({ cols, rows }: TileGridProps) {
  const [_, setTick] = useState(0)
  const [availableWidth, setAvailableWidth] = useState(0)
  const [availableHeight, setAvailableHeight] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef<Board | null>(null)

  if (!boardRef.current) {
    boardRef.current = new Board(rows, cols, tileImages)
  }

  useEffect(() => {
    boardRef.current = new Board(rows, cols, tileImages)
    setTick(0)
  }, [rows, cols])

  useEffect(() => {
    const interval = setInterval(() => {
      boardRef.current!.step()
      setTick(t => t + 1)
    }, 15)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const ro = new ResizeObserver(([entry]) => {
      setAvailableWidth(entry.contentRect.width)
      setAvailableHeight(entry.contentRect.height)
    })
    ro.observe(containerRef.current!)
    return () => ro.disconnect()
  }, [])

  const images = boardRef.current.getGridImages()
  const total = cols * rows
  const cellSize = Math.floor(Math.min(availableWidth / cols, availableHeight / rows))

  return (
    <div
      ref={containerRef}
      onClick={() => {
        boardRef.current = new Board(rows, cols, tileImages)
        setTick(0)
      }}
      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
      }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ overflow: 'hidden' }}>
            <img src={images[i]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
