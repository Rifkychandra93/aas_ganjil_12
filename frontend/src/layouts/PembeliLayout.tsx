import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'

export default function PembeliLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="text-2xl font-black text-[#7956DF] tracking-tight flex items-center gap-2">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                TiketKonser
              </Link>
              <div className="hidden md:flex gap-6">
                <Link to="/dashboard" className={`font-semibold transition-colors ${location.pathname === '/dashboard' ? 'text-[#7956DF]' : 'text-gray-500 hover:text-[#7956DF]'}`}>Jelajahi</Link>
                <Link to="/my-tickets" className={`font-semibold transition-colors ${location.pathname === '/my-tickets' ? 'text-[#7956DF]' : 'text-gray-500 hover:text-[#7956DF]'}`}>Tiket Saya</Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-500 font-semibold transition-colors px-4 py-2"
              >
                Keluar
              </button>
              <div className="w-10 h-10 rounded-full bg-[#7956DF] text-white flex items-center justify-center font-bold">
                P
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="animate-fade-in">
        <Outlet />
      </main>
    </div>
  )
}