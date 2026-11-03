import { useEffect, useState } from 'react'
import api from '../../utils/api'

interface Ticket {
  id: string
  ticketCode?: string
  eventTitle: string
  categoryName: string
  qrCode: string
  barcode?: string
  isUsed: boolean
  status?: string
  createdAt?: string
}

export default function MyTicketsContent() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [activeBarcodeType, setActiveBarcodeType] = useState<{ [key: string]: 'qr' | 'barcode' }>({})

  const fetchTickets = () => {
    setLoading(true)
    api.get('/tickets/my')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || [])
        setTickets(data)
      })
      .catch((err) => {
        console.error('Gagal mengambil tiket saya', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  const toggleBarcode = (id: string, type: 'qr' | 'barcode') => {
    setActiveBarcodeType((prev) => ({ ...prev, [id]: type }))
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 animate-fade-slide-up">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">E-Tiket Saya</h1>
            <p className="text-gray-500 mt-2 text-lg">Tunjukkan QR code ini ke petugas gerbang konser.</p>
          </div>
          <button
            onClick={fetchTickets}
            className="text-sm bg-[#7956DF]/10 text-[#7956DF] px-5 py-2.5 rounded-xl hover:bg-[#7956DF]/20 font-bold transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Segarkan
          </button>
        </div>

        {loading ? (
          <div className="p-20 text-center flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#7956DF] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-semibold text-lg">Memuat e-tiket Anda...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-gray-50 rounded-3xl p-20 text-center border border-gray-100">
            <svg className="w-20 h-20 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <p className="text-gray-500 font-bold text-xl">Anda belum memiliki tiket konser</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tickets.map((ticket) => {
              const currentType = activeBarcodeType[ticket.id] || 'qr'
              return (
                <div
                  key={ticket.id}
                  className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative"
                >
                  <div className={`h-2 w-full ${ticket.isUsed ? 'bg-red-400' : 'bg-[#7956DF]'}`}></div>
                  <div className="p-6 sm:p-8">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <h2 className="font-black text-xl text-gray-900 leading-tight">{ticket.eventTitle}</h2>
                      <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                          ticket.isUsed
                            ? 'bg-red-50 text-red-600 border border-red-100'
                            : 'bg-green-50 text-green-600 border border-green-100'
                        }`}
                      >
                        {ticket.isUsed ? 'SUDAH DIPAKAI' : 'TIKET VALID'}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 items-center text-sm text-gray-600 mb-6">
                      <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        Kategori: <strong className="text-gray-900">{ticket.categoryName}</strong>
                      </div>
                      {ticket.ticketCode && (
                        <div className="bg-[#7956DF]/5 px-3 py-1.5 rounded-lg border border-[#7956DF]/10 font-mono font-bold text-[#7956DF]">
                          {ticket.ticketCode}
                        </div>
                      )}
                    </div>

                    <div className="relative border-t-2 border-dashed border-gray-200 my-6">
                      <div className="absolute -top-3 -left-10 w-6 h-6 bg-gray-50 rounded-full"></div>
                      <div className="absolute -top-3 -right-10 w-6 h-6 bg-gray-50 rounded-full"></div>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[240px]">
                      {ticket.isUsed ? (
                        <div className="text-center py-6">
                          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className="text-red-600 font-black text-lg">Tiket Sudah Digunakan</p>
                          <p className="text-gray-500 text-sm mt-1 font-medium">Tidak dapat digunakan kembali</p>
                        </div>
                      ) : (
                        <>
                          <div className="flex bg-gray-200 p-1 rounded-xl mb-6">
                            <button
                              type="button"
                              onClick={() => toggleBarcode(ticket.id, 'qr')}
                              className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${
                                currentType === 'qr'
                                  ? 'bg-white text-[#7956DF] shadow-sm'
                                  : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              QR Code
                            </button>
                            {ticket.barcode && (
                              <button
                                type="button"
                                onClick={() => toggleBarcode(ticket.id, 'barcode')}
                                className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${
                                  currentType === 'barcode'
                                    ? 'bg-white text-[#7956DF] shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                              >
                                Barcode
                              </button>
                            )}
                          </div>

                          {currentType === 'qr' && ticket.qrCode ? (
                            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-200">
                              <img
                                src={ticket.qrCode}
                                alt="QR Code Tiket"
                                className="w-48 h-48 object-contain"
                              />
                            </div>
                          ) : ticket.barcode ? (
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 w-full">
                              <img
                                src={ticket.barcode}
                                alt="1D Barcode Tiket"
                                className="w-full max-h-32 object-contain"
                              />
                            </div>
                          ) : (
                            <div className="text-sm font-medium text-gray-400">Barcode belum digenerate</div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="text-center mt-6">
                      <p className="text-xs text-gray-400 font-mono font-medium">
                        ID: {ticket.id}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}