import { useNavigate } from 'react-router-dom'
import { useRef, useEffect, useCallback } from 'react'
import { SandGrid } from './sandgrid'

const SCALE = 5

export default function SandSim() {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const gridRef      = useRef<SandGrid | null>(null)
  const mousePos     = useRef<{ x: number; y: number } | null>(null)
  const isPressed    = useRef<0 | 1 | 2 | null>(null)
  const navigate     = useNavigate()

  const onTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const rect  = canvasRef.current!.getBoundingClientRect()
    const touch = e.touches[0]
    mousePos.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
  }, [])

  const onTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    isPressed.current = 0
  }, [])

  const onTouchEnd = useCallback(() => {
    isPressed.current = null
    mousePos.current  = null
  }, [])

  useEffect(() => {
    const canvas    = canvasRef.current!
    const container = containerRef.current!
    const ctx       = canvas.getContext('2d')!

    const resize = () => {
      canvas.width  = container.clientWidth
      canvas.height = container.clientHeight
      gridRef.current = new SandGrid(canvas.width, canvas.height, SCALE)
    }

    resize()
    window.addEventListener('resize', resize)

    let rafId: number
    const loop = () => {
      const grid = gridRef.current!
      if (isPressed.current !== null && mousePos.current) {
        const gx     = Math.floor(mousePos.current.x / SCALE)
        const gy     = Math.floor(mousePos.current.y / SCALE)
        const radius = Math.floor(canvas.width * 0.1 / SCALE / 2)
        if (isPressed.current === 0) {
          grid.spawn(gx, grid.rows - 1 - gy, radius)
        } else if (isPressed.current === 2) {
          grid.erase(gx, grid.rows - 1 - gy, radius)
        }
      }
      grid.step()
      grid.render(ctx)
      if (mousePos.current) {
        const r = Math.floor(canvas.width * 0.1 / SCALE) * SCALE / 2
        ctx.strokeStyle = '#fff'
        ctx.lineWidth   = 1
        ctx.beginPath()
        ctx.arc(mousePos.current.x, mousePos.current.y, r, 0, Math.PI * 2)
        ctx.stroke()
      }
      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    mousePos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [])

  const onMouseLeave = useCallback(() => {
    mousePos.current  = null
    isPressed.current = null
  }, [])

  return (
    <div className="relative flex h-screen w-screen bg-gray-950 text-white items-center justify-center p-16 pt-12">
      <div ref={containerRef} className="w-full h-full">
        <canvas
          ref={canvasRef}
          style={{ display: 'block', cursor: 'none', touchAction: 'none' }}
          onMouseMove={onMouseMove}
          onMouseDown={(e) => { isPressed.current = e.button as 0 | 1 | 2 }}
          onMouseUp={() => { isPressed.current = null }}
          onMouseLeave={onMouseLeave}
          onContextMenu={(e) => e.preventDefault()}
          onTouchMove={onTouchMove}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        />
      </div>
    </div>
  )
}
