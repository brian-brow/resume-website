import { useRef, useEffect, useCallback } from 'react'
import { SandGrid } from './SandSim/sandsim'

const SCALE = 5

export default function SandSim() {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const gridRef     = useRef<SandGrid | null>(null)
  const mousePos    = useRef<{ x: number; y: number } | null>(null)
  const isPressed   = useRef(false)

  const onTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const rect = canvasRef.current!.getBoundingClientRect()
    const touch = e.touches[0]
    mousePos.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
  }, [])

  const onTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    isPressed.current = true
  }, [])

  const onTouchEnd = useCallback(() => {
    isPressed.current = false
    mousePos.current = null
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!

    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight
    gridRef.current = new SandGrid(canvas.width, canvas.height, SCALE)

    const onResize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      gridRef.current = new SandGrid(canvas.width, canvas.height, SCALE)
    }
    window.addEventListener('resize', onResize)

    let rafId: number
    const loop = () => {
      const grid = gridRef.current!
      if (isPressed.current && mousePos.current) {
        const gx     = Math.floor(mousePos.current.x / SCALE)
        const gy     = Math.floor(mousePos.current.y / SCALE)
        const radius = Math.floor(canvas.width * 0.1 / SCALE / 2)
        grid.spawn(gx, grid.rows - 1 - gy, radius)
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
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    mousePos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [])

  const onMouseLeave = useCallback(() => {
    mousePos.current = null
    isPressed.current = false
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', cursor: 'none', touchAction: 'none' }}
      onMouseMove={onMouseMove}
      onMouseDown={() => { isPressed.current = true }}
      onMouseUp={()   => { isPressed.current = false }}
      onMouseLeave={onMouseLeave}
      onTouchMove={onTouchMove}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    />
  )
}
