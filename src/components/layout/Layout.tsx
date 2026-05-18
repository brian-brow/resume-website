import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './Navbar'
import Boids from '@/components/boids/Boids'
import BoidsModal from '@/components/boids/BoidsModal'
import BoidsControls from '@/components/boids/BoidsControls'
import { useBoids } from '@/components/boids/context/BoidsContext'

export default function Layout() {
  const { resetRef, shockwaveRef, getParamsRef, updateParamsRef } = useBoids()
  const [spinCount, setSpinCount] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [controlsOpen, setControlsOpen] = useState(false)
  const margin = window.innerWidth < 768 ? 20 : 150

  const handleReset = () => {
    resetRef.current?.()
    setSpinCount(n => n + 1)
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLElement>) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    shockwaveRef.current?.(e.clientX - rect.left, e.clientY - rect.top)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden relative">
      <div className="absolute inset-0">
        <Boids resetRef={resetRef} shockwaveRef={shockwaveRef} getParamsRef={getParamsRef} updateParamsRef={updateParamsRef}/>
      </div>
      <div className="absolute inset-0 z-10 pointer-events-none" style={{ padding: `${margin}px` }}>
        <div className="relative w-full h-full">
          <button
            className="absolute top-2 left-2 pointer-events-auto w-8 h-8 text-gray-400 hover:text-white active:scale-90 flex items-center justify-center text-3xl leading-none"
            style={{ transition: 'color 0.2s, transform 0.1s' }}
            onClick={() => setModalOpen(true)}
            title="About boids"
          >
            ⓘ
          </button>
          <button
            className="absolute top-2 right-2 pointer-events-auto w-8 h-8 rounded-full border border-gray-700 text-gray-400 hover:text-white hover:border-gray-400 active:scale-90 flex items-center justify-center text-lg"
            style={{ transition: 'transform 0.3s ease, color 0.2s, border-color 0.2s' }}
            onClick={handleReset}
            title="Reset boids"
          >
            <span style={{ display: 'inline-block', transition: 'transform 0.4s ease', transform: `rotate(${-spinCount * 360}deg)` }}>
              ↺
            </span>
          </button>
          <button
            className="absolute bottom-2 left-2 pointer-events-auto w-8 h-8 active:scale-90 flex items-center justify-center group"
            style={{ transition: 'transform 0.1s' }}
            onClick={() => { setControlsOpen(true); setSpinCount(n => n + 1) }}
            title="Boid parameters"
          >
            <span style={{ display: 'inline-block', transition: 'transform 0.4s ease', transform: `rotate(${spinCount * 180}deg)` }}>
              <img src="/settings.svg" alt="settings" className="w-8 h-8 invert opacity-40 group-hover:opacity-100 transition-opacity" />
            </span>
          </button>
        </div>
      </div>
      {modalOpen && <BoidsModal onClose={() => setModalOpen(false)} />}
      {controlsOpen && <BoidsControls onClose={() => setControlsOpen(false)} />}
      <Navbar />
      <main className="absolute inset-0 overflow-y-auto" onClick={handleCanvasClick}>
        <Outlet />
      </main>
    </div>
  )
}
