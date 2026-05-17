import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BoidsProvider } from '@/components/boids/context/BoidsContext'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'
import Bio from '@/pages/Bio'

export default function App() {
  return (
    <BoidsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="bio" element={<Bio />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </BoidsProvider>
  )
}
