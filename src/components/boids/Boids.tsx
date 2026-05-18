import { useEffect, useRef } from 'react'
import { Flock } from './boids'
export default function Boids({ resetRef, shockwaveRef, linesRef, getParamsRef, updateParamsRef }: {
  resetRef?: React.MutableRefObject<(() => void) | null>
  shockwaveRef?: React.MutableRefObject<((x: number, y: number) => void) | null>
  linesRef?: React.MutableRefObject<(() => void) | null>
  getParamsRef?: React.MutableRefObject<(() => any) | null>
  updateParamsRef?: React.MutableRefObject<((params: any) => void) | null>
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const margin = window.innerWidth < 768 ? 20 : 150
    const count = window.innerWidth < 768 ? 20 : 200
    const flock = new Flock(count, canvas.width, canvas.height, margin)

    if (resetRef) resetRef.current = () => flock.reset()
    if (linesRef) linesRef.current = () => flock.toggleLines()
    if (shockwaveRef) shockwaveRef.current = (x, y) => flock.addShockwave(x, y)
    if (getParamsRef) getParamsRef.current = () => flock.getParams()
    if (updateParamsRef) updateParamsRef.current = (params) => flock.updateParams(params)

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      flock.width = canvas.width
      flock.height = canvas.height
    }
    resize()

    window.addEventListener('resize', resize)

    let animFrameId: number
    let lastTime = performance.now()

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        lastTime = performance.now()
      }
    }

    document.addEventListener('visibilitychange', onVisibility)

    const onClick = (e: MouseEvent) => {
      flock.addShockwave(e.offsetX, e.offsetY)
    }

    canvas.addEventListener('click', onClick)

    const loop = (time: number) => {
      const dt = Math.min(time - lastTime, 50)
      lastTime = time
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const margin = flock.margin
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 1
      ctx.strokeRect(margin, margin, canvas.width - margin * 2, canvas.height - margin * 2)

      flock.update(dt, ctx)
      flock.draw(ctx)
      animFrameId = requestAnimationFrame(loop)
    }
    animFrameId = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(animFrameId)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
      canvas.removeEventListener('click', onClick)
    }
  }, [])
  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
    />
  )
}
