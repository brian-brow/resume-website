import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Boids from '@/components/boids/Boids'
import { useBoids } from '@/components/boids/context/BoidsContext'

export default function Layout() {
  const { resetRef, shockwaveRef } = useBoids()

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden relative">
      <div className="absolute inset-0">
        <Boids resetRef={resetRef} shockwaveRef={shockwaveRef} />
      </div>
      <Navbar />
      <main className="absolute inset-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
