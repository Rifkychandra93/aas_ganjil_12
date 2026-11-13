import { useState } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'

export default function PembeliLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const userRaw = localStorage.getItem('user')
  const user = userRaw ? JSON.parse(userRaw) : null

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  const handleNavClick = (sectionId: string) => {
    if (location.pathname !== '/dashboard') {
      navigate(`/dashboard#${sectionId}`)
    } else {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
    setMobileMenuOpen(false)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col font-sans">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center gap-4">
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6D28D9] to-[#8B5CF6] flex items-center justify-center text-white shadow-sm shadow-purple-200">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 4a2 2 0 00-2 2v3.5a1.5 1.5 0 010 3V16a2 2 0 002 2h16a2 2 0 002-2v-3.5a1.5 1.5 0 010-3V6a2 2 0 00-2-2H4zm8 3a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1V8a1 1 0 011-1z" />
                  </svg>
                </div>
                <span className="text-2xl font-black tracking-tight text-gray-900 group-hover:text-[#7C3AED] transition-colors">
                  Concertify
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-7">
                <Link
                  to="/dashboard"
                  className={`text-sm font-semibold transition-all py-1 ${
                    location.pathname === '/dashboard' ? 'text-[#7C3AED] border-b-2 border-[#7C3AED] font-bold' : 'text-gray-600 hover:text-[#7C3AED]'
                  }`}
                >
                  Beranda
                </Link>
                <button
                  type="button"
                  onClick={() => handleNavClick('artis-populer')}
                  className="text-sm font-semibold text-gray-600 hover:text-[#7C3AED] transition-colors cursor-pointer py-1"
                >
                  Artis
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick('konser-mendatang')}
                  className="text-sm font-semibold text-gray-600 hover:text-[#7C3AED] transition-colors cursor-pointer py-1"
                >
                  Konser
                </button>
                <Link
                  to="/my-tickets"
                  className={`text-sm font-semibold transition-all py-1 ${
                    location.pathname === '/my-tickets' ? 'text-[#7C3AED] border-b-2 border-[#7C3AED] font-bold' : 'text-gray-600 hover:text-[#7C3AED]'
                  }`}
                >
                  Tiket Saya
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <form onSubmit={handleSearchSubmit} className="hidden sm:block relative">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari artis atau konser..."
                    className="w-56 lg:w-72 pl-10 pr-4 py-2 text-xs lg:text-sm bg-[#F9FAFB] border border-gray-200 rounded-full focus:outline-hidden focus:border-[#7C3AED] focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all text-gray-800 placeholder-gray-400"
                  />
                </div>
              </form>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-10 h-10 rounded-full border border-gray-200 hover:border-[#7C3AED] flex items-center justify-center text-gray-600 hover:text-[#7C3AED] bg-gray-50 transition-colors cursor-pointer"
                  aria-label="User Menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Customer'}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email || 'customer@concertify.com'}</p>
                    </div>
                    <Link
                      to="/my-tickets"
                      onClick={() => setShowUserMenu(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-[#7C3AED] transition-colors"
                    >
                      Tiket Saya
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Keluar
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-[#7C3AED] focus:outline-hidden"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-4 px-2 space-y-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari artis atau konser..."
                className="w-full px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full mb-3"
              />
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#7C3AED]"
              >
                Beranda
              </Link>
              <button
                type="button"
                onClick={() => handleNavClick('artis-populer')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#7C3AED]"
              >
                Artis
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('konser-mendatang')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#7C3AED]"
              >
                Konser
              </button>
              <Link
                to="/my-tickets"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-purple-50 hover:text-[#7C3AED]"
              >
                Tiket Saya
              </Link>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1 animate-fade-in">
        <Outlet context={{ searchQuery, setSearchQuery }} />
      </main>

      <footer className="bg-white border-t border-gray-100 pt-16 pb-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6D28D9] to-[#8B5CF6] flex items-center justify-center text-white shadow-xs">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 4a2 2 0 00-2 2v3.5a1.5 1.5 0 010 3V16a2 2 0 002 2h16a2 2 0 002-2v-3.5a1.5 1.5 0 010-3V6a2 2 0 00-2-2H4zm8 3a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1V8a1 1 0 011-1z" />
                  </svg>
                </div>
                <span className="text-xl font-black tracking-tight text-gray-900">
                  Concertify
                </span>
              </div>
              <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
                Platform tiket konser terbaik di Indonesia. Nikmati pengalaman konser yang tak terlupakan.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="#social"
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#7C3AED] hover:border-[#7C3AED] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                  </svg>
                </a>
                <a
                  href="#facebook"
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#7C3AED] hover:border-[#7C3AED] transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a
                  href="#twitter"
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#7C3AED] hover:border-[#7C3AED] transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="#youtube"
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#7C3AED] hover:border-[#7C3AED] transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-900 mb-4">Jelajahi</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-gray-500">
                <li><Link to="/dashboard" className="hover:text-[#7C3AED] transition-colors">Beranda</Link></li>
                <li><button type="button" onClick={() => handleNavClick('artis-populer')} className="hover:text-[#7C3AED] transition-colors cursor-pointer">Artis</button></li>
                <li><button type="button" onClick={() => handleNavClick('konser-mendatang')} className="hover:text-[#7C3AED] transition-colors cursor-pointer">Konser</button></li>
                <li><a href="#about" className="hover:text-[#7C3AED] transition-colors">Tentang Kami</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-900 mb-4">Informasi</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-gray-500">
                <li><a href="#how" className="hover:text-[#7C3AED] transition-colors">Cara Pembelian</a></li>
                <li><a href="#terms" className="hover:text-[#7C3AED] transition-colors">Syarat & Ketentuan</a></li>
                <li><a href="#privacy" className="hover:text-[#7C3AED] transition-colors">Kebijakan Privasi</a></li>
                <li><a href="#support" className="hover:text-[#7C3AED] transition-colors">Bantuan</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-900 mb-4">Akun</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-gray-500">
                <li><Link to="/" className="hover:text-[#7C3AED] transition-colors">Masuk</Link></li>
                <li><Link to="/register" className="hover:text-[#7C3AED] transition-colors">Daftar</Link></li>
                <li><Link to="/my-tickets" className="hover:text-[#7C3AED] transition-colors">Pesanan Saya</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 mt-12 pt-8 text-center text-xs text-gray-400">
            <p>&copy; {new Date().getFullYear()} Concertify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}