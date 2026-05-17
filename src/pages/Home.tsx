import { useRef, useState, useEffect } from 'react'
import Boids from '@/components/boids/Boids'
import BoidsModal from '@/components/boids/BoidsModal'
export default function Home() {
  const resetRef = useRef<(() => void) | null>(null)
  const [spinCount, setSpinCount] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const margin = window.innerWidth < 768 ? 20 : 150

  useEffect(() => {
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.backgroundColor = '#030712'
    document.documentElement.style.backgroundColor = '#030712'
    document.documentElement.style.overscrollBehavior = 'none'
  }, [])

  const handleReset = () => {
    console.log('handleReset called', resetRef.current)
    resetRef.current?.()
    setSpinCount(n => n + 1)
    // setTimeout(() => setSpinning(false), 100)
  }

  return (
    <div className="relative min-h-screen bg-gray-950 text-white overflow-y-auto md:overflow-hidden">
      <div className="absolute inset-0">
        <Boids resetRef={resetRef}/>
      </div>
      <div className="relative md:absolute md:inset-0 z-10 pointer-events-none" style={{ padding: `${margin}px` }}>
        <div className="relative w-full h-full">
          <button
            className="absolute top-2 left-2 pointer-events-auto w-8 h-8 text-gray-400 hover:text-white active:scale-90 flex items-center justify-center text-xl leading-none"
            style={{ transition: 'color 0.2s, transform 0.1s' }}
            onClick={() => setModalOpen(true)}
            title="About boids"
          >
            ⓘ
          </button>
          <button
            className="absolute top-4 right-4 pointer-events-auto w-8 h-8 rounded-full border border-gray-700 text-gray-400 hover:text-white hover:border-gray-400 active:scale-90 flex items-center justify-center text-lg"
            style={{ transition: 'transform 0.3s ease, color 0.2s, border-color 0.2s' }}
            onClick={handleReset}
            title="Reset boids"
          >
            <span style={{ display: 'inline-block', transition: 'transform 0.4s ease', transform: `rotate(${-spinCount * 360}deg)` }}>
              ↺
            </span>
          </button>
          <div className="flex flex-col items-center justify-center h-full px-4 py-4 md:px-0 md:py-0">
            <div className="w-full max-w-2xl">
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 pointer-events-auto">
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Brian Brown</h1>
                <p className="text-gray-400 mt-4 text-base md:text-lg">
                  Software Engineer at the Loxahatchee River District.<br />
                  CS grad from the University of Florida.
                </p>
                <div className="mt-8 flex gap-4 justify-center md:justify-start">
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
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 pointer-events-auto">
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
          {modalOpen && <BoidsModal onClose={() => setModalOpen(false)} />}
        </div>
      </div>
    </div>
  )
}
