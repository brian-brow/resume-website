import ControlPanel from './ControlPanel'
import TileGrid from './TileGrid'
import { useState } from 'react'

export default function WFCollapse() {
  const [cols, setCols] = useState(10)
  const [rows, setRows] = useState(10)

  return (
    <div className="flex h-screen w-screen bg-gray-950 text-white">
      <button
        className="absolute top-4 left-4 text-gray-500 hover:text-white transition-colors text-sm"
        onClick={() => navigate('/playground')}
      >
        ← Back
      </button>
      <ControlPanel cols={cols} rows={rows} setCols={setCols} setRows={setRows} />
      <TileGrid cols={cols} rows={rows} />
    </div>
  )
}
