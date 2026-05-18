import { useNavigate } from 'react-router-dom'
// import { useBoids } from '@/components/boids/context/BoidsContext'

export default function Playground() {
  // const { shockwaveRef } = useBoids()
  const navigate = useNavigate()

  // const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
  //   const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  //   shockwaveRef.current?.(e.clientX - rect.left, e.clientY - rect.top)
  // }

  return (
    <div className="relative min-h-screen text-white overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-16 relative">
        <button
          className="fixed top-[164px] text-gray-500 hover:text-white transition-colors text-sm"
          style={{ left: 'calc(50% - 768px/2 - 48px)' }}
          onClick={(e) => { e.stopPropagation(); navigate('/') }}
        >
          ← Back
        </button>
        <div className="max-w-2xl mx-auto pt-8" onClick={e => e.stopPropagation()}>

          {/* Work History */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Simulations</h2>
            <div className="flex flex-col gap-8">
              <a href="https://boid-simulation.web.app/" target="_blank" rel="noopener noreferrer">
                <div className="border-gray-600 pl-6 bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 pointer-events-auto hover:border-gray-600 transition-colors cursor-pointer">
                  <div className="border-l border-gray-700 pl-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">Boids Simulations</h3>
                      </div>
                    </div>
                    <ul className="mt-3 text-gray-400 text-sm space-y-2">
                      <li>May seem redundant given the background of this website, but this is a Boid simulation I made with a friend sophomore year of college that I'm still quite a fan of.</li>
                    </ul>
                  </div>
                </div>
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
