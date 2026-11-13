import { useEffect, useState } from 'react'
import api from '../../utils/api'

interface Ticket {
  id: string
  orderId?: string
  ticketCode?: string
  eventTitle: string
  artistName?: string
  eventDate?: string
  location?: string
  poster?: string
  categoryName: string
  qrCode: string
  barcode?: string
  isUsed: boolean
  status?: string
  totalPrice?: number
  quantity?: number
  snapToken?: string
  createdAt?: string
}

export default function MyTicketsContent() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'akan-datang' | 'selesai' | 'dibatalkan'>('akan-datang')
  const [selectedTicketForModal, setSelectedTicketForModal] = useState<Ticket | null>(null)
  const [modalBarcodeType, setModalBarcodeType] = useState<'qr' | 'barcode'>('qr')
  const [verifyingCode, setVerifyingCode] = useState<string | null>(null)

  const fetchTickets = () => {
    setLoading(true)
    api.get('/tickets/my')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || [])
        setTickets(data)
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'Mid-client-3T9RtG6iAKY7ueD1'
    const isProd = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'
    const scriptUrl = isProd
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js'
    const scriptId = 'midtrans-snap-script'
    let script = document.getElementById(scriptId) as HTMLScriptElement

    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src = scriptUrl
      script.setAttribute('data-client-key', clientKey)
      document.body.appendChild(script)
    }

    fetchTickets()
  }, [])

  const handlePaySnap = (snapToken?: string, ticketCode?: string) => {
    if (!snapToken) {
      alert('Token pembayaran Midtrans tidak ditemukan.')
      return
    }

    if (window.snap) {
      window.snap.pay(snapToken, {
        onSuccess: async () => {
          if (ticketCode) {
            await handleVerifyPayment(ticketCode)
          } else {
            fetchTickets()
          }
        },
        onPending: async () => {
          if (ticketCode) {
            await handleVerifyPayment(ticketCode)
          } else {
            fetchTickets()
          }
        },
        onError: () => {
          alert('Pembayaran Midtrans gagal atau dibatalkan.')
          fetchTickets()
        },
        onClose: () => {
          fetchTickets()
        },
      })
    } else {
      alert('Sistem pembayaran Midtrans sedang memuat, silakan coba beberapa saat lagi.')
    }
  }

  const handleVerifyPayment = async (ticketCode?: string) => {
    if (!ticketCode) return
    setVerifyingCode(ticketCode)
    try {
      const res = await api.post('/orders/verify', { ticketCode })
      if (res.data?.isPaid) {
        alert('Pembayaran berhasil dikonfirmasi! E-tiket Anda sudah aktif.')
      } else {
        alert(res.data?.message || 'Status pembayaran belum selesai.')
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memverifikasi status pembayaran.')
    } finally {
      setVerifyingCode(null)
      fetchTickets()
    }
  }

  const handleSimulateSandboxPayment = async (ticketCode?: string) => {
    if (!ticketCode) return
    setVerifyingCode(ticketCode)
    try {
      const res = await api.post('/orders/simulate-sandbox', { ticketCode })
      if (res.data?.success) {
        alert('Simulasi pembayaran QRIS Sandbox berhasil! E-tiket konser Anda sudah aktif.')
      } else {
        alert(res.data?.message || 'Gagal memproses simulasi pembayaran.')
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memproses simulasi pembayaran.')
    } finally {
      setVerifyingCode(null)
      fetchTickets()
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '29 Juli 1998'
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    } catch (e) {
      return dateStr
    }
  }

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '20.00 WIB'
    try {
      const d = new Date(dateStr)
      const hours = String(d.getHours()).padStart(2, '0')
      const mins = String(d.getMinutes()).padStart(2, '0')
      return `${hours}.${mins} WIB`
    } catch (e) {
      return '20.00 WIB'
    }
  }

  const filteredTickets = tickets.filter((t) => {
    if (activeTab === 'akan-datang') {
      return (t.status === 'PAID' && !t.isUsed) || t.status === 'PENDING'
    }
    if (activeTab === 'selesai') {
      return t.status === 'USED' || t.isUsed
    }
    if (activeTab === 'dibatalkan') {
      return t.status === 'CANCELLED'
    }
    return true
  })

  return (
    <div className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Tiket Saya</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola acara mendatang dan riwayat pemesanan tiket anda</p>
        </div>

        <div className="border-b border-gray-200 mb-8">
          <div className="flex items-center gap-8 -mb-px">
            <button
              type="button"
              onClick={() => setActiveTab('akan-datang')}
              className={`pb-3 text-sm transition-all cursor-pointer ${
                activeTab === 'akan-datang'
                  ? 'text-[#6D28D9] font-bold border-b-2 border-[#6D28D9]'
                  : 'text-gray-500 hover:text-gray-900 font-medium'
              }`}
            >
              Akan Datang
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('selesai')}
              className={`pb-3 text-sm transition-all cursor-pointer ${
                activeTab === 'selesai'
                  ? 'text-[#6D28D9] font-bold border-b-2 border-[#6D28D9]'
                  : 'text-gray-500 hover:text-gray-900 font-medium'
              }`}
            >
              Selesai
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dibatalkan')}
              className={`pb-3 text-sm transition-all cursor-pointer ${
                activeTab === 'dibatalkan'
                  ? 'text-[#6D28D9] font-bold border-b-2 border-[#6D28D9]'
                  : 'text-gray-500 hover:text-gray-900 font-medium'
              }`}
            >
              Dibatalkan
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#6D28D9] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium text-sm">Memuat daftar tiket...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 py-20 px-4 text-center">
            <div className="w-16 h-16 bg-[#EDE9FE] text-[#6D28D9] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Belum Ada Tiket</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Tidak ada tiket yang ditemukan pada kategori ini.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTickets.map((ticket) => {
              const isPaid = ticket.status === 'PAID' && !ticket.isUsed
              const isPending = ticket.status === 'PENDING'
              const isUsed = ticket.status === 'USED' || ticket.isUsed
              const isCancelled = ticket.status === 'CANCELLED'
              const isVerifying = verifyingCode === ticket.ticketCode

              return (
                <div
                  key={ticket.id}
                  className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-stretch justify-between gap-6"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 flex-1 min-w-0">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-[#EDE9FE] flex-shrink-0 flex items-center justify-center p-3 border border-purple-200/50">
                      <svg className="w-16 h-16 sm:w-20 sm:h-20 text-[#6D28D9]" viewBox="0 0 72 72" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="8" y="16" width="56" height="40" rx="8" />
                        <path d="M8 36a8 8 0 0 1 8-8" />
                        <path d="M8 36a8 8 0 0 0 8 8" />
                        <path d="M64 36a8 8 0 0 0-8-8" />
                        <path d="M64 36a8 8 0 0 1-8 8" />
                        <path d="M46 16v40" strokeDasharray="4 4" />
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight truncate">
                        {ticket.eventTitle}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1 mb-5 font-normal truncate">
                        {ticket.artistName ? `feat. ${ticket.artistName}` : 'feat. Guest Star'}
                      </p>

                      <div className="flex flex-wrap items-center gap-5 sm:gap-7 text-xs sm:text-sm">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#6D28D9] flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-400 font-medium">Tanggal</p>
                            <p className="font-bold text-gray-900 whitespace-nowrap">{formatDate(ticket.eventDate)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#6D28D9] flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-400 font-medium">Waktu</p>
                            <p className="font-bold text-gray-900 whitespace-nowrap">{formatTime(ticket.eventDate)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#6D28D9] flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-400 font-medium">Vanue</p>
                            <p className="font-bold text-gray-900 truncate max-w-[130px]">{ticket.location || 'Grand Arena'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#6D28D9] flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-400 font-medium">Lokasi tiket</p>
                            <p className="font-bold text-gray-900 truncate max-w-[130px]">{ticket.categoryName || 'Standard'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-between flex-shrink-0 min-w-[180px] pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 gap-6">
                    <div>
                      {isPaid && (
                        <div className="bg-[#DCFCE7] text-[#16A34A] px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-2xs">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]"></span>
                          Dikonfirmasi
                        </div>
                      )}
                      {isPending && (
                        <div className="bg-[#FEF3C7] text-[#D97706] px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-2xs">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] animate-pulse"></span>
                          Menunggu Pembayaran
                        </div>
                      )}
                      {isUsed && (
                        <div className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-2xs">
                          <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
                          Selesai
                        </div>
                      )}
                      {isCancelled && (
                        <div className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-2xs">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                          Dibatalkan
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {(isPaid || isUsed) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTicketForModal(ticket)
                            setModalBarcodeType('qr')
                          }}
                          className="border border-[#6D28D9] text-[#6D28D9] hover:bg-[#F5F3FF] font-bold px-6 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                          Lihat Tiket
                        </button>
                      )}

                      {isPending && (
                        <div className="flex flex-col items-end gap-2">
                          <button
                            type="button"
                            onClick={() => handlePaySnap(ticket.snapToken, ticket.ticketCode)}
                            className="bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-sm shadow-purple-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            Bayar Sekarang
                          </button>

                          <div className="flex items-center gap-3 text-xs">
                            <button
                              type="button"
                              onClick={() => handleSimulateSandboxPayment(ticket.ticketCode)}
                              disabled={isVerifying}
                              className="text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer"
                            >
                              Simulasi Sukses (Sandbox)
                            </button>
                            <span className="text-gray-300">•</span>
                            <button
                              type="button"
                              onClick={() => handleVerifyPayment(ticket.ticketCode)}
                              disabled={isVerifying}
                              className="text-gray-500 hover:text-gray-800 font-semibold cursor-pointer"
                            >
                              {isVerifying ? 'Cek...' : 'Cek Status'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {selectedTicketForModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100">
            <div className="p-6 sm:p-7 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-xl text-gray-900">{selectedTicketForModal.eventTitle}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Kategori: <strong className="text-[#6D28D9]">{selectedTicketForModal.categoryName}</strong></p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicketForModal(null)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 sm:p-7 flex flex-col items-center justify-center text-center">
              <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => setModalBarcodeType('qr')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    modalBarcodeType === 'qr'
                      ? 'bg-white text-[#6D28D9] shadow-xs'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  QR Code Masuk
                </button>
                {selectedTicketForModal.barcode && (
                  <button
                    type="button"
                    onClick={() => setModalBarcodeType('barcode')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      modalBarcodeType === 'barcode'
                        ? 'bg-white text-[#6D28D9] shadow-xs'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Barcode Masuk
                  </button>
                )}
              </div>

              <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs mb-4 flex items-center justify-center min-h-[200px] w-full max-w-[240px]">
                {modalBarcodeType === 'qr' && selectedTicketForModal.qrCode ? (
                  <img
                    src={selectedTicketForModal.qrCode}
                    alt="QR Code Tiket"
                    className="w-48 h-48 object-contain"
                  />
                ) : selectedTicketForModal.barcode ? (
                  <img
                    src={selectedTicketForModal.barcode}
                    alt="Barcode Tiket"
                    className="w-full max-h-24 object-contain"
                  />
                ) : (
                  <p className="text-xs text-gray-400">Barcode belum tersedia</p>
                )}
              </div>

              <div className="bg-purple-50 px-3.5 py-1 rounded-full text-xs font-mono font-bold text-[#6D28D9] mb-4">
                {selectedTicketForModal.ticketCode}
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                Tunjukkan QR Code ini ke petugas gerbang konser saat masuk ke area acara.
              </p>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTicketForModal(null)}
                className="w-full bg-[#6D28D9] hover:bg-[#5B21B6] text-white py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
