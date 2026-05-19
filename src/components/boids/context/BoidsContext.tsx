import { createContext, useContext, useRef } from 'react'

interface BoidsContextType {
  resetRef: React.MutableRefObject<(() => void) | null>
  shockwaveRef: React.MutableRefObject<((x: number, y: number) => void) | null>
  linesRef: React.MutableRefObject<(() => void) | null>
  getParamsRef: React.MutableRefObject<(() => any) | null>
  updateParamsRef: React.MutableRefObject<((params: any) => void) | null>
  setFlockCountRef: React.MutableRefObject<((n: number) => void) | null>
}

const BoidsContext = createContext<BoidsContextType | null>(null)

export function BoidsProvider({ children }: { children: React.ReactNode }) {
  const resetRef = useRef<(() => void) | null>(null)
  const shockwaveRef = useRef<((x: number, y: number) => void) | null>(null)
  const linesRef = useRef<(() => void) | null>(null)
  const getParamsRef = useRef<(() => any) | null>(null)
  const updateParamsRef = useRef<((params: any) => void) | null>(null)
  const setFlockCountRef = useRef<((n: number) => void) | null>(null)

  return (
    <BoidsContext.Provider value={{ resetRef, shockwaveRef, linesRef, getParamsRef, updateParamsRef, setFlockCountRef }}>
      {children}
    </BoidsContext.Provider>
  )
}

export function useBoids() {
  const ctx = useContext(BoidsContext)
  if (!ctx) throw new Error('useBoids must be used within BoidsProvider')
  return ctx
}
