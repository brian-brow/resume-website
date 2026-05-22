import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import NavBar from '@/components/layout/Navbar'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <NavBar />
    <App />
  </BrowserRouter>
)
