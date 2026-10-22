import { Link, Outlet, useNavigate } from 'react-router-dom'

export default function PembeliLayout() {
    const navigate = useNavigate()
    const rawUser = localStorage.getItem('user')
    const user = rawUser ? JSON.parse(rawUser) : null

    const handleLogout = () => {
        localStorage.clear()
        navigate('/')
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex justify-between h-16 items-center">
                        <Link to="/dashboard" className="text-xl font-black text-blue-600 tracking-tight flex items-center gap-2">
                            <span>TiketKonser</span>
                        </Link>
                        <div className="flex items-center gap-6">
                            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">
                                Home
                            </Link>
                            <Link to="/my-tickets" className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">
                                Tiket Saya
                            </Link>
                            {user && (
                                <span className="text-xs text-gray-500 hidden sm:inline-block font-medium">
                                    {user.name}
                                </span>
                            )}
                            <button
                                onClick={handleLogout}
                                className="bg-red-50 text-red-600 px-3.5 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    )
}