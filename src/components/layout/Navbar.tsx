import { useNavigate, useLocation } from 'react-router-dom'

export default function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()

  const links = [
    { label: 'Home', to: '/' },
    { label: 'Bio', to: '/bio' },
    { label: 'Playground', to: '/playground' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-8 py-4 pointer-events-auto">
      {links.map(link => (
        <button
          key={link.to}
          onClick={() => navigate(link.to)}
          className={`text-sm transition-colors ${location.pathname === link.to ? 'text-white' : 'text-gray-500 hover:text-white'}`}
        >
          {link.label}
        </button>
      ))}
    </nav>
  )
}
