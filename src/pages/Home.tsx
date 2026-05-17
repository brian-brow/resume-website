import { useRef, useState } from 'react'
import Boids from '@/components/boids/Boids'
export default function Home() {
  const resetRef = useRef<(() => void) | null>(null)
  const [spinCount, setSpinCount] = useState(0)

  const handleReset = () => {
    console.log('handleReset called', resetRef.current)
    resetRef.current?.()
    setSpinCount(n => n + 1)
    // setTimeout(() => setSpinning(false), 100)
  }

  return (
    <div className="relative min-h-screen bg-gray-950 text-white">
      <div className="absolute inset-0">
        <Boids resetRef={resetRef}/>
      </div>
      <div className="absolute inset-0 z-10 pointer-events-none" style={{ padding: '150px' }}>
        <button
          className="absolute pointer-events-auto w-8 h-8 rounded-full border border-gray-700 text-gray-400 hover:text-white hover:border-gray-400 active:scale-90 active:text-white active:border-gray-400 flex items-center justify-center text-lg"
          style={{ top: '158px', right: '158px', transition: 'transform 0.3s ease, color 0.2s, border-color 0.2s' }}
          onClick={handleReset}
          title="Reset boids"
        >
          <span style={{ display: 'inline-block', transition: 'transform 0.4s ease', transform: `rotate(${-spinCount * 360}deg)`}}>
            ↺
          </span>
        </button>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-full max-w-2xl">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 pointer-events-auto">
              <h1 className="text-5xl font-bold tracking-tight">Brian Brown</h1>
              <p className="text-gray-400 mt-4 text-lg">
                Software Engineer at the Loxahatchee River District.<br />
                CS grad from the University of Florida.
              </p>
              <div className="mt-8 flex gap-4">
                <a
                  href="https://github.com/brian-brow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-gray-950 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >GitHub
                </a>
                <a
                  href="/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >Resume
                </a>
              </div>
            </div>
            <div className="mt-16 grid grid-cols-3 gap-4 pointer-events-auto">
              {['Feature one', 'Feature two', 'Feature three'].map((f) => (
                <div key={f} className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                  <div className="w-8 h-8 bg-gray-700 rounded-md mb-4" />
                  <p className="font-medium">{f}</p>
                  <p className="text-gray-500 text-sm mt-1">Placeholder description goes here.</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
