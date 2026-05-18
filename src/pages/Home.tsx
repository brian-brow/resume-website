import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import BoidsModal from '@/components/boids/BoidsModal'
// import { useBoids } from '@/components/boids/context/BoidsContext'

export default function Home() {
  // const { resetRef, shockwaveRef } = useBoids()
  const [spinCount, setSpinCount] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const margin = window.innerWidth < 768 ? 20 : 150
  const navigate = useNavigate()

  useEffect(() => {
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.backgroundColor = '#030712'
    document.documentElement.style.backgroundColor = '#030712'
    document.documentElement.style.overscrollBehavior = 'none'
  }, [])

  // const handleReset = () => {
  //   resetRef.current?.()
  //   setSpinCount(n => n + 1)
  // }

  // const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
  //   const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  //   shockwaveRef.current?.(e.clientX - rect.left, e.clientY - rect.top)
  // }

  return (
    <div className="relative min-h-screen text-white overflow-y-auto md:overflow-hidden">
      <div className="relative md:absolute md:inset-0 z-10 pointer-events-none" style={{ padding: `${margin}px` }}>
        <div className="relative w-full h-full">
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
                {[
                  { label: 'Dotfiles', img: '/arch.png', alt: 'Arch Linux', desc: 'Arch Linux / Hyprland dotfiles', href: 'https://github.com/brian-brow/dotfiles', to: null },
                  { label: 'Bio', img: '/favicon.png', alt: 'Brian Brown', desc: 'About me', href: null, to: '/bio' },
                  { label: 'Feature three', img: null, alt: '', desc: 'Placeholder description goes here', href: null, to: null },
                ].map((f) => {
                    const card = (
                      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 hover:border-gray-600 transition-colors h-full">
                        {f.img
                          ? <img src={f.img} alt={f.alt} className="w-8 h-8 rounded-md mb-4 object-cover" />
                          : <div className="w-8 h-8 bg-gray-700 rounded-md mb-4" />
                        }
                        <p className="font-medium">{f.label}</p>
                        <p className="text-gray-500 text-sm mt-1">{f.desc}</p>
                      </div>
                    )
                    if (f.href) return <a key={f.label} href={f.href} target="_blank" rel="noopener noreferrer" className="block">{card}</a>
                    if (f.to) return <div key={f.label} className="cursor-pointer" onClick={() => navigate(f.to!)}>{card}</div>
                    return <div key={f.label}>{card}</div>
                  })}
              </div>
            </div>
          </div>
          {modalOpen && <BoidsModal onClose={() => setModalOpen(false)} />}
        </div>
      </div>
    </div>
  )
}
