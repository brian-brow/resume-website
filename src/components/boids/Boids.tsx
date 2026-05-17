import { useEffect, useRef } from 'react'
import { Flock } from './boids'
export default function Boids() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const flock = new Flock(200, canvas.width, canvas.height)
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
      const dt = Math.min(time - lastTime, 10)
      lastTime = time
      ctx.clearRect(0, 0, canvas.width, canvas.height)
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
