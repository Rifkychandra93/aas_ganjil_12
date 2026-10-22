import { useEffect, useState } from 'react'
import api from '../../utils/api'

interface Artist {
  id: string
  name: string
  description?: string
  photo?: string
}

export default function ArtistContent() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    photo: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchArtists = async () => {
    setIsLoading(true)
    try {
      const res = await api.get('/artists')
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || [])
      setArtists(data)
    } catch (error) {
      console.error('Gagal mengambil data artis', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchArtists()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await api.post('/artists', formData)
      setShowModal(false)
      setFormData({ name: '', description: '', photo: '' })
      fetchArtists()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menambahkan artis')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus artist ini?')) {
      try {
        await api.delete(`/artists/${id}`)
        setArtists(artists.filter((a) => a.id !== id))
      } catch (err: any) {
        alert(err.response?.data?.message || 'Gagal menghapus artist')
      }
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Artist</h1>
          <p className="text-sm text-gray-500">Daftar performer dan musisi untuk konser</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          + Tambah Artist
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-gray-500">Memuat data artist...</div>
      ) : artists.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-gray-100">
          Belum ada artist yang terdaftar. Silakan tambahkan artist baru.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {artists.map((artist) => (
            <div key={artist.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={artist.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=2563eb&color=fff`}
                  alt={artist.name}
                  className="w-14 h-14 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <h3 className="font-bold text-gray-800 text-base">{artist.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{artist.description || 'Musisi'}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(artist.id)}
                className="text-red-500 hover:text-red-700 text-xs font-semibold hover:underline"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Tambah Artist Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Artist / Band</label>
                <input
                  type="text"
                  placeholder="cth: Coldplay"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi / Genre</label>
                <input
                  type="text"
                  placeholder="cth: British Rock Band"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Foto Artist</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.photo}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
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