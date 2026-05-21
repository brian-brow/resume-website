import { useNavigate } from 'react-router-dom'

const PROJECTS = [
  {
    label: 'Wave Function Collapse',
    desc: 'A procedural generation algorithm that collapses a grid of possibilities into a coherent image, tile by tile, guided by adjacency constraints.',
    to: '/playground/wfcollapse',
    external: true,
  },
]

const SIMULATIONS = [
  {
    label: 'Boids Simulation',
    desc: 'A flocking simulation built with a friend sophomore year. Each boid follows three simple rules — separation, alignment, and cohesion — producing emergent crowd behavior.',
    href: 'https://boid-simulation.web.app/',
    external: true,
  },
  {
    label: 'Sand Simulation',
    desc: 'A falling-sand simulation where particles interact with each other and their environment. Refactored from an older project into TypeScript.',
    to: '/playground/sandsim',
    external: true,
  },
]

export default function Playground() {
  const navigate = useNavigate()

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
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Projects</h2>
            <div className="flex flex-col gap-8">
              {PROJECTS.map(s => {
                const card = (
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 hover:border-gray-600 transition-colors">
                    <div className="border-l border-gray-700 pl-6">
                      <h3 className="font-semibold text-lg">{s.label}</h3>
                      <p className="mt-3 text-gray-400 text-sm">{s.desc}</p>
                    </div>
                  </div>
                )
                if (s.href) return <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">{card}</a>
                return <div key={s.label} className="cursor-pointer" onClick={() => navigate(s.to!)}>{card}</div>
              })}
            </div>
            <h2 className="text-2xl font-bold mb-6 mt-16">Simulations</h2>
            <div className="flex flex-col gap-8">
              {SIMULATIONS.map(s => {
                const card = (
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 hover:border-gray-600 transition-colors">
                    <div className="border-l border-gray-700 pl-6">
                      <h3 className="font-semibold text-lg">{s.label}</h3>
                      <p className="mt-3 text-gray-400 text-sm">{s.desc}</p>
                    </div>
                  </div>
                )
                if (s.href) return <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">{card}</a>
                return <div key={s.label} className="cursor-pointer" onClick={() => navigate(s.to!)}>{card}</div>
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
