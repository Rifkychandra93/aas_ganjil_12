import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

interface AdminLayoutProps {
  role: 'ADMIN' | 'SUPERADMIN'
}

export default function AdminLayout({ role }: AdminLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()

  const rawUser = localStorage.getItem('user')
  const user = rawUser ? JSON.parse(rawUser) : null

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  const baseMenu = [
    {
      name: 'Dashboard',
      path: role === 'ADMIN' ? '/admin' : '/superadmin',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    {
      name: 'Events',
      path: role === 'ADMIN' ? '/admin/events' : '/superadmin/events',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    },
    {
      name: 'Artist',
      path: role === 'ADMIN' ? '/admin/artist' : '/superadmin/artist',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    },
    {
      name: 'Ticket',
      path: role === 'ADMIN' ? '/admin/ticket' : '/superadmin/ticket',
      icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
    },
  ]

  const superadminMenu = [
    {
      name: 'System Logs',
      path: '/superadmin/logs',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    {
      name: 'User Management',
      path: '/superadmin/users',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    },
  ]

  const scannerMenu = [
    {
      name: 'Scanner Tiket',
      path: '/scanner',
      icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z',
    },
  ]

  const menus = role === 'SUPERADMIN' ? [...baseMenu, ...superadminMenu, ...scannerMenu] : [...baseMenu, ...scannerMenu]

  return (
    <div className="flex h-screen bg-[#F8F9FD] text-gray-800 font-sans">
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-xs shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-gray-100">
          <Link to={role === 'ADMIN' ? '/admin' : '/superadmin'} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6D28D9] to-[#8B5CF6] flex items-center justify-center text-white shadow-sm shadow-purple-200">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v3.5a1.5 1.5 0 010 3V16a2 2 0 002 2h16a2 2 0 002-2v-3.5a1.5 1.5 0 010-3V6a2 2 0 00-2-2H4zm8 3a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1V8a1 1 0 011-1z" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-gray-900 group-hover:text-[#7C3AED] transition-colors block leading-tight">
                Concertify
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#7C3AED]">
                {role}
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menus.map((menu) => {
            const isActive = location.pathname === menu.path
            return (
              <Link
                key={menu.name}
                to={menu.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-[#7C3AED] text-white font-semibold shadow-md shadow-purple-200'
                    : 'text-gray-600 hover:bg-purple-50 hover:text-[#7C3AED] font-medium'
                }`}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={menu.icon} />
                </svg>
                <span>{menu.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-2">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-xl font-semibold text-sm transition-colors border border-red-100 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center px-8 justify-between sticky top-0 z-30 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-tight">
              {user ? `Halo, ${user.name}` : 'Halo, SuperAdmin'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Panel Pengelolaan Platform Tiket Konser
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-purple-100 text-[#7C3AED] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {role}
            </span>
            <div className="w-10 h-10 bg-gradient-to-tr from-[#6D28D9] to-[#8B5CF6] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-purple-200">
              {user?.name ? user.name[0].toUpperCase() : 'S'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
