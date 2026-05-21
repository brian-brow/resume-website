import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BoidsProvider } from '@/components/boids/context/BoidsContext'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'
import Bio from '@/pages/Bio'
import Playground from '@/pages/Playground'
import SandSim from '@/pages/playground/sandsim/SandSim'
import WFCollapse from '@/pages/playground/wfcollapse/WFCollapse'
import Sphere from '@/pages/Sphere'

export default function App() {
  return (
    <BoidsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="bio" element={<Bio />} />
            <Route path="playground" element={<Playground />} />
          </Route>
          <Route path="/playground/sandsim" element={<SandSim />} />
          <Route path="/playground/wfcollapse" element={<WFCollapse />} />
          <Route path="sphere" element={<Sphere />} />
        </Routes>
      </BrowserRouter>
    </BoidsProvider>
  )
}
