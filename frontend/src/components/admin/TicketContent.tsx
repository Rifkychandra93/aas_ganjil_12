import { useEffect, useState } from 'react'
import api from '../../utils/api'

interface TicketCategoryItem {
  id: string
  name: string
  price: number
  quota: number
  remainingQuota: number
  event?: {
    id: string
    title: string
  }
}

interface EventItem {
  id: string
  title: string
}

export default function TicketContent() {
  const [tickets, setTickets] = useState<TicketCategoryItem[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedEventFilter, setSelectedEventFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    eventId: '',
    name: '',
    price: 0,
    quota: 100,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [ticketsRes, eventsRes] = await Promise.all([
        api.get('/ticket-categories'),
        api.get('/events'),
      ])
      const ticketData = Array.isArray(ticketsRes.data)
        ? ticketsRes.data
        : ticketsRes.data?.data || []
      setTickets(ticketData)

      const eventData = Array.isArray(eventsRes.data)
        ? eventsRes.data
        : eventsRes.data?.data || []
      setEvents(eventData)

      if (eventData.length > 0 && !formData.eventId) {
        setFormData((prev) => ({ ...prev, eventId: eventData[0].id }))
      }
    } catch (error) {
      console.error('Gagal mengambil data tiket', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.post('/ticket-categories', {
        eventId: formData.eventId,
        name: formData.name,
        price: Number(formData.price),
        quota: Number(formData.quota),
      })
      setShowModal(false)
      setFormData({
        eventId: events[0]?.id || '',
        name: '',
        price: 0,
        quota: 100,
      })
      fetchData()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal membuat kategori tiket')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus kategori tiket ini?')) {
      try {
        await api.delete(`/ticket-categories/${id}`)
        setTickets(tickets.filter((t) => t.id !== id))
      } catch (err: any) {
        alert(err.response?.data?.message || 'Gagal menghapus kategori tiket')
      }
    }
  }

  const formatRupiah = (val: number) => {
    return 'Rp ' + Number(val).toLocaleString('id-ID')
  }

  const filteredTickets = tickets.filter((t) => {
    const matchFilter = selectedEventFilter === 'ALL' || t.event?.id === selectedEventFilter
    const matchSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.event?.title && t.event.title.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchFilter && matchSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Manajemen Kategori & Kuota Tiket</h1>
          <p className="text-sm text-gray-500 mt-0.5">Atur harga tiket, kuota penonton, dan status keterisian kursi event</p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-purple-200 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Buat Kategori Tiket</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4a2 2 0 00-2 2v3.5a1.5 1.5 0 010 3V16a2 2 0 002 2h16a2 2 0 002-2v-3.5a1.5 1.5 0 010-3V6a2 2 0 00-2-2H4zm8 3a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1V8a1 1 0 011-1z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900">{tickets.length} Kategori Tiket</h3>
            <p className="text-xs text-gray-400">Total variasi kelas tiket di semua event</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={selectedEventFilter}
            onChange={(e) => setSelectedEventFilter(e.target.value)}
            className="w-full sm:w-56 px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#7C3AED] font-semibold text-gray-700"
          >
            <option value="ALL">Semua Konser / Event</option>
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-60">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kategori atau event..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#7C3AED] focus:bg-white focus:ring-2 focus:ring-purple-100"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-[#F9FAFC] text-gray-500 uppercase text-xs border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold">Kategori Tiket</th>
                <th className="px-6 py-4 font-bold">Event Musik</th>
                <th className="px-6 py-4 font-bold">Harga per Tiket</th>
                <th className="px-6 py-4 font-bold">Sisa / Total Kuota</th>
                <th className="px-6 py-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div>
                      <span>Memuat data tiket...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    Belum ada kategori tiket yang terdaftar untuk filter ini.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => {
                  const rem = ticket.remainingQuota ?? ticket.quota
                  const total = ticket.quota || 100
                  const sold = Math.max(0, total - rem)
                  const percentSold = Math.min(100, Math.round((sold / total) * 100))

                  return (
                    <tr key={ticket.id} className="hover:bg-purple-50/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#7C3AED] flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M4 4a2 2 0 00-2 2v3.5a1.5 1.5 0 010 3V16a2 2 0 002 2h16a2 2 0 002-2v-3.5a1.5 1.5 0 010-3V6a2 2 0 00-2-2H4zm8 3a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1V8a1 1 0 011-1z" />
                            </svg>
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{ticket.name}</span>
                            <span className="text-xs text-gray-400">Terjual {sold} tiket ({percentSold}%)</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {ticket.event?.title || 'Event Utama'}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#7C3AED]">
                        {formatRupiah(ticket.price)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-44">
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className="text-gray-700">{rem} Tersedia</span>
                            <span className="text-gray-400">{total} Total</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] rounded-full"
                              style={{ width: `${Math.max(5, 100 - percentSold)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(ticket.id)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-fade-in border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Buat Kategori Tiket</h3>
                <p className="text-xs text-gray-500">Tentukan harga dan kuota penonton untuk event</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Pilih Konser / Event
                </label>
                <select
                  value={formData.eventId}
                  onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#7C3AED] focus:bg-white focus:ring-2 focus:ring-purple-100"
                >
                  {events.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Nama Kategori Tiket
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="cth: VIP Platinum, Festival A, Tribune"
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#7C3AED] focus:bg-white focus:ring-2 focus:ring-purple-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Harga Tiket (Rp)
                </label>
                <input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                  min="0"
                  placeholder="cth: 350000"
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#7C3AED] focus:bg-white focus:ring-2 focus:ring-purple-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Jumlah Kuota Tiket
                </label>
                <input
                  type="number"
                  value={formData.quota || ''}
                  onChange={(e) => setFormData({ ...formData, quota: Number(e.target.value) })}
                  required
                  min="1"
                  placeholder="cth: 150"
                  className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#7C3AED] focus:bg-white focus:ring-2 focus:ring-purple-100"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-sm font-bold shadow-md shadow-purple-200 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
