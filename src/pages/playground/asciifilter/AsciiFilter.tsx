import { useRef, useState, useEffect } from 'react'

export default function MyVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [cellSize, setCellSize] = useState(10)
  const animFrameRef = useRef<number | null>(null)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) return
    navigator.mediaDevices.getUserMedia({ audio: false, video: true })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream
      })
      .catch(console.error)
    return () => {
      const src = videoRef.current?.srcObject as MediaStream | null
      src?.getTracks().forEach(t => t.stop())
    }
  }, [])

  // Resize canvas to match container whenever container size changes
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return
    const ro = new ResizeObserver(([entry]) => {
      canvas.width = entry.contentRect.width
      canvas.height = entry.contentRect.height
    })
    ro.observe(container)
    return () => ro.disconnect()
  }, [])

  const capturePixels = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    if (video.readyState < 2) return
    if (video.videoWidth === 0 || video.videoHeight === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cw = canvas.width
    const ch = canvas.height

    // Scale video into canvas preserving aspect ratio (letterbox)
    const videoAspect = video.videoWidth / video.videoHeight
    const canvasAspect = cw / ch
    let drawW: number, drawH: number, drawX: number, drawY: number
    if (videoAspect > canvasAspect) {
      drawW = cw
      drawH = cw / videoAspect
    } else {
      drawH = ch
      drawW = ch * videoAspect
    }
    drawX = (cw - drawW) / 2
    drawY = (ch - drawH) / 2

    // Draw video into an offscreen canvas at its natural size for accurate pixel sampling
    const offscreen = document.createElement('canvas')
    offscreen.width = Math.floor(drawW)
    offscreen.height = Math.floor(drawH)
    const offCtx = offscreen.getContext('2d')!
    offCtx.drawImage(video, 0, 0, offscreen.width, offscreen.height)

    const imageData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height)
    const { data, width, height } = imageData

    const chars = '.\'^"`,:;Il!i><~+_-?][}{1)(|/\\tjfrxnuvczXYUJCQLO0ZmwqpdbkhaoM#W&%B@$'.split('')
    const cols = Math.floor(width / cellSize)
    const rows = Math.floor(height / cellSize)

    ctx.fillStyle = '#030712'
    ctx.fillRect(0, 0, cw, ch)
    ctx.fillStyle = '#e5e7eb'
    ctx.font = `${cellSize}px monospace`

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const startX = col * cellSize
        const startY = row * cellSize
        let luminance = 0
        for (let px = startX; px < Math.min(startX + cellSize, width); px++) {
          for (let py = startY; py < Math.min(startY + cellSize, height); py++) {
            const i = (py * width + px) * 4
            luminance += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
          }
        }
        luminance /= cellSize * cellSize
        const charIndex = Math.floor((luminance / 255) * (chars.length - 1))
        ctx.fillText(chars[charIndex], drawX + col * cellSize, drawY + row * cellSize + cellSize)
      }
    }
  }

  useEffect(() => {
    if (running) {
      const loop = () => {
        capturePixels()
        animFrameRef.current = requestAnimationFrame(loop)
      }
      animFrameRef.current = requestAnimationFrame(loop)
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [running, cellSize])

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#030712', color: 'white', paddingTop: 48 }}>

      {/* Left control panel */}
      <div style={{
        width: 220,
        padding: 16,
        borderRight: '1px solid #333',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        flexShrink: 0,
      }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#f9fafb' }}>Controls</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 13, color: '#9ca3af' }}>Cell Size: {cellSize}px</label>
          <input
            type="range"
            min={2}
            max={32}
            value={cellSize}
            onChange={e => setCellSize(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#6b7280' }}
          />
        </div>

        <button
          onClick={() => setRunning(r => !r)}
          style={{
            padding: '8px 0',
            backgroundColor: running ? '#1f2937' : '#374151',
            color: 'white',
            border: '1px solid #4b5563',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 13,
            transition: 'background-color 0.15s',
          }}
        >
          {running ? 'Stop' : 'Start'}
        </button>

        <button
          onClick={() => setCellSize(10)}
          style={{
            padding: '8px 0',
            backgroundColor: '#111827',
            color: '#9ca3af',
            border: '1px solid #374151',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          Reset
        </button>
      </div>

      {/* Center — canvas fills container exactly */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflow: 'hidden',
          backgroundColor: '#030712',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ display: 'block', width: '100%', height: '100%' }}
        />
      </div>

      {/* Right spacer */}
      <div style={{ width: 220, padding: 16, borderLeft: '1px solid #333', flexShrink: 0 }} />

      <video ref={videoRef} autoPlay muted playsInline style={{ display: 'none' }} />
    </div>
  )
}
