import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../utils/api'

interface TicketCategory {
  id: string
  name: string
  price: number
  quota: number
  remainingQuota?: number
}

interface EventDetail {
  id: string
  title: string
  description: string
  location: string
  date: string
  imageUrl?: string
  ticketCategories?: TicketCategory[]
  ticketTypes?: TicketCategory[]
}

export default function TicketDetailContent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      api.get(`/events/${id}`)
        .then((res) => {
          const data = res.data?.data || res.data
          setEvent(data)
          const categories = data?.ticketCategories || data?.ticketTypes || []
          if (categories.length > 0) {
            setSelectedCategory(categories[0])
          }
        })
        .catch((err) => {
          console.error('Gagal mengambil detail event', err)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [id])

  const handleCheckout = () => {
    if (!selectedCategory || !event) return
    navigate('/checkout', {
      state: {
        eventId: event.id,
        categoryId: selectedCategory.id,
        quantity,
        price: selectedCategory.price,
        eventTitle: event.title,
        categoryName: selectedCategory.name,
      },
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#7956DF] font-semibold">
          <div className="w-6 h-6 border-2 border-[#7956DF] border-t-transparent rounded-full animate-spin"></div>
          Memuat detail konser...
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-white p-6 flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-6 text-xl font-medium">Konser tidak ditemukan</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-[#7956DF] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-200"
        >
          Kembali ke Dashboard
        </button>
      </div>
    )
  }

  const categories = event.ticketCategories || event.ticketTypes || []
  const availableQuota = selectedCategory?.remainingQuota ?? selectedCategory?.quota ?? 1

  return (
    <div className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-8 animate-fade-slide-up">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 text-gray-500 hover:text-[#7956DF] font-semibold transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {event.imageUrl && (
            <div className="w-full h-72 sm:h-96 bg-gray-900 overflow-hidden relative">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3">{event.title}</h1>
                <div className="flex flex-wrap gap-4 text-sm sm:text-base text-gray-200">
                  <p className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#b8a4f2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location}
                  </p>
                  <p className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#b8a4f2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 sm:p-10">
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Tentang Acara</h2>
              <p className="text-gray-600 leading-relaxed text-base whitespace-pre-line">{event.description}</p>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Pilih Kategori Tiket</h2>
              {categories.length === 0 ? (
                <div className="p-8 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-center text-gray-500 font-medium">
                  Belum ada kategori tiket yang dibuka untuk acara ini.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories.map((cat) => {
                    const sisa = cat.remainingQuota ?? cat.quota
                    const isSelected = selectedCategory?.id === cat.id
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat)}
                        className={`border-2 p-6 rounded-2xl cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'border-[#7956DF] bg-[#7956DF]/5 shadow-md shadow-purple-100'
                            : 'border-gray-200 hover:border-[#7956DF]/50 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="font-bold text-gray-900 text-lg">{cat.name}</span>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-[#7956DF] flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Sisa Kuota: <span className="font-semibold text-gray-700">{sisa} tiket</span></p>
                        <div className="text-xl font-black text-[#7956DF]">
                          Rp {cat.price.toLocaleString('id-ID')}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {categories.length > 0 && (
              <div className="mb-10">
                <label className="block text-lg font-bold text-gray-900 mb-4">Jumlah Tiket</label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 hover:border-[#7956DF] hover:text-[#7956DF] transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={Math.max(1, availableQuota)}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(availableQuota, Number(e.target.value))))}
                    className="border-2 border-gray-200 h-12 w-24 text-center font-black text-xl text-gray-900 rounded-xl focus:outline-none focus:border-[#7956DF] focus:ring-2 focus:ring-[#7956DF]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(availableQuota, quantity + 1))}
                    className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 hover:border-[#7956DF] hover:text-[#7956DF] transition-colors"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-500 font-medium ml-2">(Maks. {availableQuota} tiket)</span>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-gray-100">
              <div>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Total Pembayaran</p>
                <p className="text-3xl sm:text-4xl font-black text-[#7956DF]">
                  Rp {((selectedCategory?.price || 0) * quantity).toLocaleString('id-ID')}
                </p>
              </div>
              <button
                onClick={handleCheckout}
                disabled={!selectedCategory || categories.length === 0}
                className="bg-[#7956DF] hover:bg-[#6845c5] text-white px-10 py-4 rounded-xl font-bold transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 shadow-lg shadow-purple-200 text-lg w-full sm:w-auto"
              >
                Lanjut ke Pembayaran
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}