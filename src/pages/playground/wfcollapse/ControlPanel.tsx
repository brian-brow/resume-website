import { useNavigate } from 'react-router-dom'

interface ControlPanelProps {
  cols: number
  rows: number
  speed: number
  setCols: (n: number) => void
  setRows: (n: number) => void
  setSpeed: (n: number) => void
}

export default function ControlPanel({ cols, rows, speed, setCols, setRows, setSpeed }: ControlPanelProps) {
  const navigate = useNavigate()

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border-r border-gray-700 p-8 w-64 flex flex-col gap-4">
      <h2 className="text-xl font-bold">Controls</h2>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-300">Columns</span>
          <span className="text-gray-500">{cols}</span>
        </div>
        <input
          type="range" min={1} max={40} value={cols}
          onChange={e => setCols(Number(e.target.value))}
          className="w-full accent-white"
        />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-300">Rows</span>
          <span className="text-gray-500">{rows}</span>
        </div>
        <input
          type="range" min={1} max={40} value={rows}
          onChange={e => setRows(Number(e.target.value))}
          className="w-full accent-white"
        />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-300">Speed</span>
          <span className="text-gray-500">{speed}ms</span>
        </div>
        <input
          type="range" min={1} max={100} value={speed}
          onChange={e => setSpeed(Number(e.target.value))}
          className="w-full accent-white"
        />
      </div>
      <button
        className="mt-2 text-sm text-gray-500 hover:text-white transition-colors text-left"
        onClick={() => { setCols(10); setRows(10); setSpeed(25) }}
      >
        Reset Grid
      </button>
    </div>
  )
}
