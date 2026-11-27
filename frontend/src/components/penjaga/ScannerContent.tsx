import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import BarcodeScannerComponent from 'react-qr-barcode-scanner'
import api from '../../utils/api'

interface ScanResult {
  status: 'success' | 'error' | 'idle'
  message: string
  data?: {
    ticketCode: string
    customer: string
    event: string
    category?: string
  }
}

export default function ScannerContent() {
  const navigate = useNavigate()
  const location = useLocation()

  const [scanResult, setScanResult] = useState<ScanResult>({ status: 'idle', message: '' })
  const [isScanning, setIsScanning] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const rawUser = localStorage.getItem('user')
  const user = rawUser ? JSON.parse(rawUser) : null
  const role: 'ADMIN' | 'SUPERADMIN' =
    String(user?.role || '').toUpperCase() === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN'

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

  const menus =
    role === 'SUPERADMIN'
      ? [...baseMenu, ...superadminMenu, ...scannerMenu]
      : [...baseMenu, ...scannerMenu]

  const validateTicket = async (code: string) => {
    if (!code || isLoading) return
    setIsScanning(false)
    setIsLoading(true)
    setScanResult({ status: 'idle', message: 'Memvalidasi tiket...' })

    try {
      const res = await api.post('/tickets/scan', { qrCode: code })
      setScanResult({
        status: 'success',
        message: res.data?.message || 'Tiket Valid! Silakan Masuk.',
        data: res.data?.data,
      })
    } catch (error: any) {
      setScanResult({
        status: 'error',
        message: error.response?.data?.message || 'Tiket Tidak Valid / Sudah Digunakan!',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleScan = (_err: any, result: any) => {
    if (result && isScanning && !isLoading) {
      validateTicket(result.text)
    }
  }

  const handleManualSubmit = (e: FormEvent) => {
    e.preventDefault()
    validateTicket(manualCode.trim())
  }

  const resetScanner = () => {
    setScanResult({ status: 'idle', message: '' })
    setManualCode('')
    setIsScanning(true)
  }

  return (
    <div className="flex h-screen bg-[#F8F9FD] text-gray-800 font-sans overflow-hidden">
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-purple-950/40 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      ></div>

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col shadow-xs shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
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
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-purple-50 hover:text-[#7C3AED] transition-colors cursor-pointer"
            aria-label="Tutup menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menus.map((menu) => {
            const isActive = location.pathname === menu.path
            return (
              <Link
                key={menu.name}
                to={menu.path}
                onClick={() => setSidebarOpen(false)}
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

      <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden absolute top-4 left-4 z-30 w-11 h-11 rounded-xl bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-600 hover:text-[#7C3AED] hover:border-[#7C3AED] transition-colors cursor-pointer"
          aria-label="Buka menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <main className="flex-1 overflow-y-auto p-4 pt-20 sm:p-8 lg:pt-8 flex animate-fade-in">
          <div className="m-auto w-full max-w-xl">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-purple-200/40 p-5 sm:p-7">
              <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
                    Scan Tiket
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Arahkan kamera ke QR Code atau Barcode pada tiket penonton
                  </p>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center gap-2 text-[11px] font-bold px-3 py-1.5 rounded-full border ${
                    isScanning
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : isLoading
                      ? 'bg-purple-50 text-[#7C3AED] border-purple-100'
                      : scanResult.status === 'success'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : 'bg-rose-50 text-rose-600 border-rose-100'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isScanning
                        ? 'bg-emerald-500 animate-pulse'
                        : isLoading
                        ? 'bg-[#7C3AED] animate-pulse'
                        : scanResult.status === 'success'
                        ? 'bg-emerald-500'
                        : 'bg-rose-500'
                    }`}
                  ></span>
                  {isScanning ? 'Kamera Aktif' : isLoading ? 'Memproses' : 'Hasil Scan'}
                </span>
              </div>

              <div className="w-full aspect-[4/3] mx-auto bg-gray-950 rounded-2xl overflow-hidden relative border-4 border-purple-100 flex items-center justify-center shadow-inner">
                {isScanning ? (
                  <>
                    <BarcodeScannerComponent
                      width="100%"
                      height="100%"
                      onUpdate={handleScan}
                    />
                    <div className="absolute inset-0 pointer-events-none z-10">
                      <div className="absolute top-6 left-6 w-10 h-10 border-t-4 border-l-4 border-[#c084fc] rounded-tl-2xl"></div>
                      <div className="absolute top-6 right-6 w-10 h-10 border-t-4 border-r-4 border-[#c084fc] rounded-tr-2xl"></div>
                      <div className="absolute bottom-6 left-6 w-10 h-10 border-b-4 border-l-4 border-[#c084fc] rounded-bl-2xl"></div>
                      <div className="absolute bottom-6 right-6 w-10 h-10 border-b-4 border-r-4 border-[#c084fc] rounded-br-2xl"></div>
                      <div className="absolute inset-x-10 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-[#c084fc] to-transparent animate-pulse"></div>
                    </div>
                  </>
                ) : (
                  <div
                    className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center ${
                      scanResult.status === 'success'
                        ? 'bg-emerald-50'
                        : scanResult.status === 'error'
                        ? 'bg-rose-50'
                        : 'bg-white'
                    }`}
                  >
                    {scanResult.status === 'success' && (
                      <div className="text-emerald-600 w-full">
                        <svg className="w-20 h-20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xl font-extrabold">{scanResult.message}</p>
                        {scanResult.data && (
                          <div className="mt-4 p-4 bg-white rounded-2xl text-left text-xs space-y-2 text-gray-500 border border-emerald-100 shadow-sm">
                            <p className="flex justify-between gap-3">
                              <span>Kode</span>
                              <strong className="text-gray-900 font-mono text-right break-all">{scanResult.data.ticketCode}</strong>
                            </p>
                            <p className="flex justify-between gap-3">
                              <span>Customer</span>
                              <strong className="text-gray-900 text-right">{scanResult.data.customer}</strong>
                            </p>
                            <p className="flex justify-between gap-3">
                              <span>Event</span>
                              <strong className="text-gray-900 text-right">{scanResult.data.event}</strong>
                            </p>
                            {scanResult.data.category && (
                              <p className="flex justify-between gap-3">
                                <span>Kategori</span>
                                <strong className="text-[#7C3AED] text-right">{scanResult.data.category}</strong>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {scanResult.status === 'error' && (
                      <div className="text-rose-600">
                        <svg className="w-20 h-20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xl font-extrabold">{scanResult.message}</p>
                      </div>
                    )}
                    {scanResult.status === 'idle' && (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-600 font-medium">{scanResult.message}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6">
                {!isScanning ? (
                  <button
                    onClick={resetScanner}
                    disabled={isLoading}
                    className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold py-3.5 px-4 rounded-xl transition-all disabled:opacity-50 text-sm shadow-lg shadow-purple-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    Scan Tiket Berikutnya
                  </button>
                ) : (
                  <form onSubmit={handleManualSubmit} className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 block">Input Manual</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Input Kode Tiket manual (cth: TIX-...)"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        className="flex-1 min-w-0 bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#7C3AED] focus:bg-white focus:ring-2 focus:ring-purple-100 text-gray-800 placeholder-gray-400 font-mono transition-all"
                      />
                      <button
                        type="submit"
                        disabled={!manualCode.trim() || isLoading}
                        className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-5 py-3 rounded-xl text-sm transition-all disabled:opacity-40 shadow-md shadow-purple-200 cursor-pointer disabled:cursor-not-allowed"
                      >
                        Periksa
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}