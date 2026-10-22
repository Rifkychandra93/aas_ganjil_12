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

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Tiket</h1>
                    <p className="text-sm text-gray-500">Kelola kategori tiket, harga, dan kuota per event</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                    + Buat Kategori Tiket
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 uppercase text-xs border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Event</th>
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4">Harga</th>
                                <th className="px-6 py-4">Sisa / Total Kuota</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Memuat kategori tiket...
                                    </td>
                                </tr>
                            ) : tickets.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                        Belum ada kategori tiket dibuat
                                    </td>
                                </tr>
                            ) : (
                                tickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                            {ticket.event?.title || 'Semua Event'}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-700">
                                            {ticket.name}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-900">
                                            Rp {ticket.price.toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-blue-600">
                                                {ticket.remainingQuota ?? ticket.quota}
                                            </span>
                                            <span className="text-gray-400 text-xs"> / {ticket.quota}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(ticket.id)}
                                                className="text-red-600 hover:text-red-800 font-semibold text-xs hover:underline"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Buat Kategori Tiket</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Event</label>
                                <select
                                    value={formData.eventId}
                                    onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                                    required
                                    className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                >
                                    {events.length === 0 && <option value="">Tidak ada event aktif</option>}
                                    {events.map((e) => (
                                        <option key={e.id} value={e.id}>
                                            {e.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
                                <input
                                    type="text"
                                    placeholder="cth: VIP, Festival, Tribune"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Tiket (Rp)</label>
                                <input
                                    type="number"
                                    min="1000"
                                    placeholder="500000"
                                    value={formData.price || ''}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                    required
                                    className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kuota Tiket</label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="100"
                                    value={formData.quota || ''}
                                    onChange={(e) => setFormData({ ...formData, quota: Number(e.target.value) })}
                                    required
                                    className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}