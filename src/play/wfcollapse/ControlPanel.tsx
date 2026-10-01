import type { THEMES } from './tiles'

type ThemeName = keyof typeof THEMES

interface ControlPanelProps {
  cols: number
  rows: number
  speed: number
  theme: ThemeName
  setCols: (n: number) => void
  setRows: (n: number) => void
  setSpeed: (n: number) => void
  setTheme: (t: ThemeName) => void
}

const group = { flex: 1, minWidth: 120 }
const heading = { display: 'flex', justifyContent: 'space-between', marginBottom: 4 }
const slider = { width: '100%', accentColor: 'var(--ink)' }

export default function ControlPanel({ cols, rows, speed, theme, setCols, setRows, setSpeed, setTheme }: ControlPanelProps) {

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 24 }}>
      <div style={group}>
        <div className="label" style={heading}>
          <span>Columns</span>
          <span>{cols}</span>
        </div>
        <input
          type="range" min={1} max={40} value={cols}
          onChange={e => setCols(Number(e.target.value))}
          style={slider}
        />
      </div>
      <div style={group}>
        <div className="label" style={heading}>
          <span>Rows</span>
          <span>{rows}</span>
        </div>
        <input
          type="range" min={1} max={40} value={rows}
          onChange={e => setRows(Number(e.target.value))}
          style={slider}
        />
      </div>
      <div style={group}>
        <div className="label" style={heading}>
          <span>Speed</span>
          <span>{speed}ms</span>
        </div>
        <input
          type="range" min={1} max={100} value={speed}
          onChange={e => setSpeed(Number(e.target.value))}
          style={slider}
        />
      </div>
      <button
        className="label"
        style={{ background: 'none', padding: 0 }}
        aria-label={`Switch to ${theme === 'pond' ? 'roads' : 'pond'} tiles`}
        onClick={() => setTheme(theme === 'pond' ? 'roads' : 'pond')}
      >
        {theme === 'pond' ? 'Pond' : 'Roads'} ↻
      </button>
      <button
        className="label"
        style={{ background: 'none', padding: 0 }}
        onClick={() => { setCols(10); setRows(10); setSpeed(25) }}
      >
        Reset Grid
      </button>
    </div>
  )
}
