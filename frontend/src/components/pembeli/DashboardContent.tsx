import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'

interface EventItem {
  id: string
  title: string
  description?: string
  location: string
  date: string
  imageUrl: string
}

export default function DashboardContent() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/events')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || [])
        setEvents(data)
      })
      .catch((err) => {
        console.error('Gagal mengambil event', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 animate-fade-slide-up">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-[#7956DF] font-bold tracking-wider uppercase text-sm mb-2 block">Jelajahi Event</span>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
              Temukan Konser <br className="hidden md:block" /> Favoritmu.
            </h1>
            <p className="text-gray-500 mt-4 text-lg max-w-xl">
              Dari musik indie hingga panggung dunia, pesan tiket resmi dengan aman dan cepat.
            </p>
          </div>
          <button
            onClick={() => navigate('/my-tickets')}
            className="self-start md:self-auto bg-[#7956DF] hover:bg-[#6845c5] text-white px-6 py-3 rounded-xl font-bold transition-all transform hover:-translate-y-1 shadow-lg shadow-purple-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            Tiket Saya
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                <div className="w-full h-56 bg-gray-200"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="bg-gray-50 rounded-3xl p-16 text-center border border-gray-100">
            <svg className="w-20 h-20 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-gray-500 font-medium text-xl">Belum ada konser yang tersedia saat ini</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => navigate(`/ticket/${event.id}`)}
                className="group bg-white rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 cursor-pointer overflow-hidden transition-all duration-300 flex flex-col transform hover:-translate-y-2"
              >
                <div className="relative overflow-hidden aspect-[4/3] bg-gray-100">
                  <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#7956DF] shadow-sm">
                    Tersedia
                  </div>
                  <img
                    src={event.imageUrl || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&auto=format&fit=crop&q=80'}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="font-bold text-xl text-gray-900 group-hover:text-[#7956DF] transition-colors line-clamp-2 leading-snug">
                      {event.title}
                    </h2>
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#7956DF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="line-clamp-1">{event.location}</span>
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#7956DF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>
                          {new Date(event.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-[#7956DF] group-hover:underline">
                      Lihat Detail
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#7956DF]/10 flex items-center justify-center group-hover:bg-[#7956DF] transition-colors">
                      <svg className="w-4 h-4 text-[#7956DF] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}