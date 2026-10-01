import ControlPanel from './ControlPanel'
import TileGrid from './TileGrid'
import { useState } from 'react'
import type { THEMES } from './tiles'

export default function WFCollapse() {
  const [cols, setCols] = useState(10)
  const [rows, setRows] = useState(10)
  const [speed, setSpeed] = useState(25)
  const [theme, setTheme] = useState<keyof typeof THEMES>('pond')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', height: '100%' }}>
      <ControlPanel cols={cols} rows={rows} speed={speed} theme={theme} setCols={setCols} setRows={setRows} setSpeed={setSpeed} setTheme={setTheme} />
      <TileGrid cols={cols} rows={rows} speed={speed} theme={theme} />
    </div>
  )
}
