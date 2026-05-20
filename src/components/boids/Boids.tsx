import { useEffect, useRef } from 'react'
import { Flock } from './boids'
export default function Boids({ resetRef, shockwaveRef, linesRef, getParamsRef, updateParamsRef, setFlockCountRef, flockCount = 1 }: {
  resetRef?: React.MutableRefObject<(() => void) | null>
  shockwaveRef?: React.MutableRefObject<((x: number, y: number) => void) | null>
  linesRef?: React.MutableRefObject<(() => void) | null>
  getParamsRef?: React.MutableRefObject<(() => any) | null>
  updateParamsRef?: React.MutableRefObject<((params: any) => void) | null>
  setFlockCountRef?: React.MutableRefObject<((n: any) => void) | null>
  flockCount?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const colors = [ '#1793D1', '#7C6AF7', '#E05A6D', '#F5A623', '#2ECC8F', '#C678DD' ]
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const margin = window.innerWidth < 768 ? 20 : 150
    const count = window.innerWidth < 768 ? 20 : 200
    const flocks: Flock[] = []
    for (let i = 0; i < flockCount; i++) {
      flocks.push(new Flock(count, canvas.width, canvas.height, margin, flockCount > 1 ? colors[i % colors.length] : '#ffffff'))
    }

    if (resetRef) resetRef.current = () => flocks.forEach(f => f.reset())
    if (linesRef) linesRef.current = () => flocks.forEach(f => f.toggleLines())
    if (shockwaveRef) shockwaveRef.current = (x, y) => flocks.forEach(f => f.addShockwave(x, y))
    if (getParamsRef) getParamsRef.current = () => ({
      ...flocks[0].getParams(),
      numFlocks: flocks.length
    })
    if (updateParamsRef) updateParamsRef.current = (params) => flocks.forEach(f => f.updateParams(params))
    if (setFlockCountRef) setFlockCountRef.current = (n: number) => {
      while (flocks.length < n) {
        const i = flocks.length
        if (i == 1) {
          flocks[0].color = colors[0]
          flocks[0].updateParams({ color: colors[0] })
        }
        const newFlock = new Flock(count, canvas.width, canvas.height, margin, n > 1 ? colors[i % colors.length] : '#ffffff')
        newFlock.lines = flocks[0].lines
        flocks.push(newFlock)
      }
      while (flocks.length > n) flocks.pop()
      if (flocks.length == 1) {
        flocks[0].color = '#ffffff'
        flocks[0].updateParams({ color: '#ffffff' })
      }
    }

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      flocks.forEach(f => { f.width = canvas.width; f.height = canvas.height })
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
      flocks.forEach(f => f.addShockwave(e.offsetX, e.offsetY))
    }

    canvas.addEventListener('click', onClick)

    const loop = (time: number) => {
      const dt = Math.min(time - lastTime, 50)
      lastTime = time
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const margin = flocks[0].margin
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 1
      ctx.strokeRect(margin, margin, canvas.width - margin * 2, canvas.height - margin * 2)

      flocks.forEach(f => f.update(dt, ctx))
      flocks.forEach(f => f.draw(ctx))
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
      className="w-full h-full absolute inset-0 pointer-events-none"
    />
  )
}
