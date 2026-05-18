import { useState } from 'react'
import { useBoids } from '@/components/boids/context/BoidsContext'

const PARAMS = [
  { key: 'matchingFactor', label: 'Alignment', min: 0, max: 0.1, step: 0.001, default: 0.002 },
  { key: 'centeringFactor', label: 'Cohesion', min: 0, max: 0.001, step: 0.00001, default: 0.0002 },
  { key: 'avoidFactor', label: 'Separation', min: 0, max: 0.02, step: 0.0001, default: 0.002 },
  { key: 'turnFactor', label: 'Turn Factor', min: 0, max: 0.5, step: 0.01, default: 0.1 },
  { key: 'maxSpeed', label: 'Max Speed', min: 1, max: 10, step: 0.1, default: 4.5 },
  { key: 'minSpeed', label: 'Min Speed', min: 0.5, max: 5, step: 0.1, default: 3.0 },
  { key: 'visionRadius', label: 'Vision Radius', min: 10, max: 300, step: 1, default: 125 },
  { key: 'avoidRadius', label: 'Avoid Radius', min: 5, max: 100, step: 1, default: 40 },
]

export default function BoidsControls({ onClose }: { onClose: () => void }) {
  const { getParamsRef, updateParamsRef } = useBoids()
  const [values, setValues] = useState(() =>
    getParamsRef.current?.() ?? Object.fromEntries(PARAMS.map(p => [p.key, p.default]))
  )

  const handleChange = (key: string, value: number) => {
    const next = { ...values, [key]: value }
    setValues(next)
    updateParamsRef.current?.({ [key]: value })
  }

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 w-full max-w-sm mx-4"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-6">Boid Parameters</h2>
        <div className="flex flex-col gap-4">
          {PARAMS.map(p => (
            <div key={p.key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">{p.label}</span>
                <span className="text-gray-500">{values[p.key]}</span>
              </div>
              <input
                type="range"
                min={p.min}
                max={p.max}
                step={p.step}
                value={values[p.key]}
                onChange={e => handleChange(p.key, parseFloat(e.target.value))}
                className="w-full accent-white"
              />
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          <button
            className="text-sm text-gray-500 hover:text-white transition-colors"
            onClick={() => {
              const defaults = Object.fromEntries(PARAMS.map(p => [p.key, p.default]))
              setValues(defaults)
              updateParamsRef.current?.(defaults)
            }}
          >
            Reset to defaults
          </button>
          <button
            className="text-sm text-gray-500 hover:text-white transition-colors"
            onClick={() => {
              const random = Object.fromEntries(PARAMS.map(p => [
                p.key,
                parseFloat((Math.random() * (p.max - p.min) + p.min).toFixed(6))
              ]))
              setValues(random)
              updateParamsRef.current?.(random)
            }}
          >
            Random values
          </button>
        </div>
      </div>
    </div>
  )
}
