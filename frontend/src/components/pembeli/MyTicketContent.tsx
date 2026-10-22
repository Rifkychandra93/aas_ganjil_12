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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">E-Tiket Saya</h1>
            <p className="text-sm text-gray-500">Tunjukkan barcode atau QR code tiket ini ke petugas gerbang</p>
          </div>
          <button
            onClick={fetchTickets}
            className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 font-medium"
          >
            Segarkan
          </button>
        </div>

        {loading ? (
          <div className="p-16 text-center text-gray-500 font-medium">Memuat e-tiket Anda...</div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <p className="text-gray-500 font-semibold text-lg">Anda belum memiliki tiket konser</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tickets.map((ticket) => {
              const currentType = activeBarcodeType[ticket.id] || 'qr'
              return (
                <div
                  key={ticket.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h2 className="font-bold text-lg text-gray-900">{ticket.eventTitle}</h2>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          ticket.isUsed
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {ticket.isUsed ? 'SUDAH DIGUNAKAN' : 'TIKET VALID'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>Kategori: <strong className="text-gray-800">{ticket.categoryName}</strong></span>
                      {ticket.ticketCode && (
                        <span className="font-mono font-semibold text-blue-600">{ticket.ticketCode}</span>
                      )}
                    </div>
                  </div>

                  <div className="my-4 bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col items-center justify-center min-h-[220px]">
                    {ticket.isUsed ? (
                      <div className="text-center py-6">
                        <svg className="w-12 h-12 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-600 font-bold text-sm">Tiket Sudah Digunakan</p>
                        <p className="text-gray-400 text-xs mt-1">Tidak dapat digunakan kembali</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-2 mb-3">
                          <button
                            type="button"
                            onClick={() => toggleBarcode(ticket.id, 'qr')}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                              currentType === 'qr'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            QR Code
                          </button>
                          {ticket.barcode && (
                            <button
                              type="button"
                              onClick={() => toggleBarcode(ticket.id, 'barcode')}
                              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                                currentType === 'barcode'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              Barcode 128
                            </button>
                          )}
                        </div>

                        {currentType === 'qr' && ticket.qrCode ? (
                          <img
                            src={ticket.qrCode}
                            alt="QR Code Tiket"
                            className="w-44 h-44 object-contain rounded-lg border border-gray-200 bg-white p-1"
                          />
                        ) : ticket.barcode ? (
                          <img
                            src={ticket.barcode}
                            alt="1D Barcode Tiket"
                            className="w-full max-h-28 object-contain rounded-lg border border-gray-200 bg-white p-2"
                          />
                        ) : (
                          <div className="text-xs text-gray-400">Barcode belum digenerate</div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="text-center pt-2 border-t border-gray-100">
                    <p className="text-[11px] text-gray-400 font-mono">
                      ID: {ticket.id}
                    </p>
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