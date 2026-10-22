import { useEffect, useState } from 'react'
import api from '../../utils/api'

interface EventData {
    id: string
    title: string
    location: string
    date: string
    imageUrl?: string
    description?: string
}

interface ArtistData {
    id: string
    name: string
}

export default function DashboardContent() {
    const [events, setEvents] = useState<EventData[]>([])
    const [artists, setArtists] = useState<ArtistData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        date: '',
        imageUrl: '',
        artistId: '',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchData = async () => {
        try {
            const [eventsRes, artistsRes] = await Promise.all([
                api.get('/events'),
                api.get('/artists').catch(() => ({ data: [] })),
            ])
            const eventList = Array.isArray(eventsRes.data)
                ? eventsRes.data
                : eventsRes.data?.data || []
            setEvents(eventList)

            const artistList = Array.isArray(artistsRes.data)
                ? artistsRes.data
                : artistsRes.data?.data || []
            setArtists(artistList)
            if (artistList.length > 0 && !formData.artistId) {
                setFormData((prev) => ({ ...prev, artistId: artistList[0].id }))
            }
        } catch (error) {
            console.error('Gagal mengambil data event', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await api.post('/events', formData)
            alert('Event berhasil dibuat!')
            setFormData({
                title: '',
                description: '',
                location: '',
                date: '',
                imageUrl: '',
                artistId: artists[0]?.id || '',
            })
            fetchData()
        } catch (error: any) {
            alert(error.response?.data?.message || 'Gagal membuat event')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm('Yakin ingin menghapus event ini?')) {
            try {
                await api.delete(`/events/${id}`)
                setEvents(events.filter((e) => e.id !== id))
            } catch (err: any) {
                alert(err.response?.data?.message || 'Gagal menghapus event')
            }
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-2">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard Superadmin</h1>
                    <p className="text-sm text-gray-500">Kelola konser dan event musik aktif</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
                        <h2 className="font-bold text-gray-800 mb-4 text-lg">Buat Event Baru</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Event</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="cth: Coldplay Music of the Spheres"
                                    required
                                    className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                            {artists.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Artist</label>
                                    <select
                                        name="artistId"
                                        value={formData.artistId}
                                        onChange={handleChange}
                                        className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                    >
                                        {artists.map((a) => (
                                            <option key={a.id} value={a.id}>
                                                {a.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="cth: Stadion Utama Gelora Bung Karno"
                                    required
                                    className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Event</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL Poster / Gambar</label>
                                <input
                                    type="url"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                    className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    rows={3}
                                    placeholder="Deskripsi detail konser..."
                                    className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm shadow-sm"
                            >
                                {isSubmitting ? 'Menyimpan...' : 'Simpan Event'}
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
                        <div className="p-4 border-b border-gray-100">
                            <h2 className="font-bold text-gray-800 text-lg">List Event Aktif</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 uppercase text-xs border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3.5">Judul Event</th>
                                        <th className="px-6 py-3.5">Lokasi</th>
                                        <th className="px-6 py-3.5">Tanggal</th>
                                        <th className="px-6 py-3.5 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                Memuat data event...
                                            </td>
                                        </tr>
                                    ) : events.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                                Belum ada event yang dibuat
                                            </td>
                                        </tr>
                                    ) : (
                                        events.map((event) => (
                                            <tr key={event.id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-gray-900">
                                                    {event.title}
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">
                                                    {event.location}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                    {new Date(event.date).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDelete(event.id)}
                                                        className="text-red-600 hover:text-red-800 font-medium hover:underline text-xs"
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
                </div>
            </div>
        </div>
    )
}