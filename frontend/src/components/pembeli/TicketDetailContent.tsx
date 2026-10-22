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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500 font-medium">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Memuat detail konser...
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4 text-lg">Konser tidak ditemukan</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold"
        >
          Kembali ke Dashboard
        </button>
      </div>
    )
  }

  const categories = event.ticketCategories || event.ticketTypes || []
  const availableQuota = selectedCategory?.remainingQuota ?? selectedCategory?.quota ?? 1

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {event.imageUrl && (
          <div className="w-full h-64 bg-gray-900 overflow-hidden relative">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h1 className="text-3xl font-extrabold tracking-tight">{event.title}</h1>
              <p className="text-gray-200 text-sm mt-1">
                {event.location} · {new Date(event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        )}

        <div className="p-8">
          {!event.imageUrl && (
            <div className="mb-6 pb-6 border-b border-gray-100">
              <h1 className="text-3xl font-extrabold text-gray-900">{event.title}</h1>
              <p className="text-gray-500 mt-1">
                {event.location} · {new Date(event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Tentang Acara</h2>
            <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{event.description}</p>
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-4">Pilih Kategori Tiket</h2>
          {categories.length === 0 ? (
            <div className="p-6 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center text-gray-500 text-sm mb-6">
              Belum ada kategori tiket yang dibuka untuk acara ini.
            </div>
          ) : (
            <div className="space-y-3 mb-8">
              {categories.map((cat) => {
                const sisa = cat.remainingQuota ?? cat.quota
                const isSelected = selectedCategory?.id === cat.id
                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat)}
                    className={`border-2 p-5 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-base">{cat.name}</span>
                        {isSelected && (
                          <span className="bg-blue-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                            Dipilih
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Sisa Kuota: {sisa} tiket</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-gray-900">
                        Rp {cat.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {categories.length > 0 && (
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Jumlah Tiket</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-lg font-bold text-gray-700 hover:bg-gray-100"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, availableQuota)}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(availableQuota, Number(e.target.value))))}
                  className="border border-gray-300 h-10 w-20 text-center font-bold text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(availableQuota, quantity + 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-lg font-bold text-gray-700 hover:bg-gray-100"
                >
                  +
                </button>
                <span className="text-xs text-gray-500">(Maks. {availableQuota} tiket)</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-100 pt-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Pembayaran</p>
              <p className="text-2xl font-black text-gray-900">
                Rp {((selectedCategory?.price || 0) * quantity).toLocaleString('id-ID')}
              </p>
            </div>
            <button
              onClick={handleCheckout}
              disabled={!selectedCategory || categories.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold transition-colors disabled:opacity-50 shadow-md text-base"
            >
              Lanjut ke Pembayaran
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}