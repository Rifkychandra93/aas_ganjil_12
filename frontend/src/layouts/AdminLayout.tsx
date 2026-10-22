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
        { name: 'Dashboard', path: role === 'ADMIN' ? '/admin' : '/superadmin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { name: 'Artist', path: role === 'ADMIN' ? '/admin/artist' : '/superadmin/artist', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { name: 'Ticket', path: role === 'ADMIN' ? '/admin/ticket' : '/superadmin/ticket', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' },
    ]

    const superadminMenu = [
        { name: 'System Logs', path: '/superadmin/logs', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { name: 'User Management', path: '/superadmin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    ]

    const scannerMenu = [
        { name: 'Scanner Tiket', path: '/scanner', icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z' },
    ]

    const menus = role === 'SUPERADMIN' ? [...baseMenu, ...superadminMenu, ...scannerMenu] : [...baseMenu, ...scannerMenu]

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-gray-900 text-white flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-gray-800">
                    <h1 className="text-lg font-bold tracking-wider text-blue-400">
                        {role === 'ADMIN' ? 'Admin Panel' : 'Superadmin'}
                    </h1>
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menus.map((menu) => (
                        <Link
                            key={menu.name}
                            to={menu.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                                location.pathname === menu.path
                                    ? 'bg-blue-600 text-white font-semibold'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menu.icon} />
                            </svg>
                            <span>{menu.name}</span>
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-red-600/90 hover:bg-red-600 text-white py-2.5 rounded-xl font-medium text-sm transition-colors"
                    >
                        Keluar (Logout)
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto">
                <header className="h-16 bg-white shadow-sm border-b border-gray-100 flex items-center px-8 justify-between sticky top-0 z-30">
                    <h2 className="text-base font-semibold text-gray-800">
                        {user ? `Halo, ${user.name}` : 'Selamat Datang'}
                    </h2>
                    <div className="flex items-center gap-3">
                        <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2.5 py-1 rounded-full uppercase">
                            {role}
                        </span>
                        <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {user?.name ? user.name[0].toUpperCase() : 'A'}
                        </div>
                    </div>
                </header>
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}