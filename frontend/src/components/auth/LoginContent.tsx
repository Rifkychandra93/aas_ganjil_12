import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../utils/api'

export default function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      const token = res.data.token || res.data.data?.token
      const user = res.data.user || res.data.data?.user

      if (token) {
        localStorage.setItem('token', token)
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      }

      if (user?.role === 'SUPERADMIN') {
        navigate('/superadmin')
      } else if (user?.role === 'ADMIN') {
        navigate('/admin')
      } else if (user?.role === 'GUARD') {
        navigate('/scanner')
      } else {
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal. Periksa email dan password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex lg:w-1/2 bg-[#7956DF] relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <circle cx="20" cy="20" r="30" fill="white" />
            <circle cx="80" cy="80" r="40" fill="white" />
            <circle cx="80" cy="20" r="20" fill="white" />
          </svg>
        </div>
        <div className="relative z-10 text-center animate-fade-slide-up">
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Rasakan Sensasi <br /> Konser Impianmu.
          </h1>
          <p className="text-purple-100 text-lg max-w-md mx-auto">
            Pesan tiket konser artis favoritmu dengan mudah, cepat, dan aman. Jangan sampai kehabisan!
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-fade-slide-up">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Selamat Datang Kembali</h2>
            <p className="text-gray-500">Silakan masuk untuk melanjutkan pesanan tiketmu.</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 animate-fade-in" role="alert">
              <p className="font-medium">Login Gagal</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat Email</label>
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7956DF] focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7956DF] focus:border-transparent transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7956DF] hover:bg-[#6845c5] text-white py-3 px-4 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-200"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-8">
            Belum punya akun?{' '}
            <Link to="/register" className="text-[#7956DF] font-bold hover:underline">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}