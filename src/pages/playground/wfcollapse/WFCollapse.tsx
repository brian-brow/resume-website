import ControlPanel from './ControlPanel'
import TileGrid from './TileGrid'
import { useState } from 'react'

export default function WFCollapse() {
  const [cols, setCols] = useState(10)
  const [rows, setRows] = useState(10)
  const [speed, setSpeed] = useState(25)

  return (
    <div className="flex h-screen w-screen bg-gray-950 text-white">
      <ControlPanel cols={cols} rows={rows} speed={speed} setCols={setCols} setRows={setRows} setSpeed={setSpeed} />
      <TileGrid cols={cols} rows={rows} speed={speed} />
    </div>
  )
}
