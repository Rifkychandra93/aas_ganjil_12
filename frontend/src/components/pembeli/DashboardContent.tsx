import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import api from '../../utils/api'

interface BackendTicketCategory {
  id: string
  name: string
  price: number
  quota: number
  remainingQuota?: number
}

interface BackendArtist {
  id: string
  name: string
  description?: string | null
  photo?: string | null
}

interface BackendEvent {
  id: string
  artistId?: string
  title: string
  description?: string
  location: string
  poster?: string | null
  imageUrl?: string | null
  date?: string
  eventDate?: string
  artist?: BackendArtist
  ticketTypes?: BackendTicketCategory[]
  ticketCategories?: BackendTicketCategory[]
}

interface DisplayArtist {
  id: string
  name: string
  genre: string
  photo: string
}

interface DisplayEvent {
  id: string
  title: string
  location: string
  formattedDate: string
  formattedPrice: string
  imageUrl: string
  rawPrice: number
}

const DEFAULT_ARTISTS: DisplayArtist[] = [
  {
    id: 'artist-1',
    name: 'Sheila On 7',
    genre: 'Pop Rock',
    photo: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'artist-2',
    name: 'NOAH',
    genre: 'Pop Rock',
    photo: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'artist-3',
    name: 'Tulus',
    genre: 'Pop',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'artist-4',
    name: 'Pamungkas',
    genre: 'Indie Pop',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'artist-5',
    name: 'JKT48',
    genre: 'Pop Idol',
    photo: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'artist-6',
    name: 'Nadin Amizah',
    genre: 'Indie',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  },
]

const DEFAULT_CONCERTS: DisplayEvent[] = [
  {
    id: 'concert-1',
    title: 'Sheila On 7',
    location: 'Jakarta',
    formattedDate: '8 Januari 2026 - 19.00 WIB',
    formattedPrice: 'Dari Rp250.000',
    rawPrice: 250000,
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'concert-2',
    title: 'NOAH',
    location: 'Bogor',
    formattedDate: '1 Maret 2026 - 20.00 WIB',
    formattedPrice: 'Dari Rp300.000',
    rawPrice: 300000,
    imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'concert-3',
    title: 'Nadin Amizah',
    location: 'Depok',
    formattedDate: '15 Agustus 2026 - 19.00 WIB',
    formattedPrice: 'Dari Rp400.000',
    rawPrice: 400000,
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
  },
]

export default function DashboardContent() {
  const navigate = useNavigate()
  const context = useOutletContext<{ searchQuery?: string }>()
  const searchQuery = context?.searchQuery || ''

  const [artists, setArtists] = useState<DisplayArtist[]>(DEFAULT_ARTISTS)
  const [concerts, setConcerts] = useState<DisplayEvent[]>(DEFAULT_CONCERTS)
  const [loading, setLoading] = useState(true)

  const formatEventDate = (dateStr?: string) => {
    if (!dateStr) return 'Segera Hadir'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    const dateFormatted = d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    const timeFormatted = d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })
    return `${dateFormatted} - ${timeFormatted} WIB`
  }

  const formatPrice = (price: number) => {
    return 'Dari Rp' + Number(price).toLocaleString('id-ID')
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, artistsRes] = await Promise.allSettled([
          api.get('/events'),
          api.get('/artists'),
        ])

        if (eventsRes.status === 'fulfilled') {
          const resData = eventsRes.value.data
          const rawEvents: BackendEvent[] = Array.isArray(resData)
            ? resData
            : Array.isArray(resData?.data)
            ? resData.data
            : []

          if (rawEvents.length > 0) {
            const mappedEvents: DisplayEvent[] = rawEvents.map((evt) => {
              const categories = evt.ticketCategories || evt.ticketTypes || []
              let minPrice = 250000
              if (categories.length > 0) {
                const prices = categories.map((c) => Number(c.price)).filter((p) => !isNaN(p) && p > 0)
                if (prices.length > 0) {
                  minPrice = Math.min(...prices)
                }
              }

              const posterUrl = evt.imageUrl || evt.poster || ''
              const validPoster = posterUrl.startsWith('http')
                ? posterUrl
                : posterUrl.startsWith('/uploads')
                ? posterUrl
                : 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&auto=format&fit=crop&q=80'

              return {
                id: evt.id,
                title: evt.title,
                location: evt.location || 'Indonesia',
                formattedDate: formatEventDate(evt.eventDate || evt.date),
                formattedPrice: formatPrice(minPrice),
                rawPrice: minPrice,
                imageUrl: validPoster,
              }
            })

            const mergedConcerts = [
              ...mappedEvents,
              ...DEFAULT_CONCERTS.filter((dc) => !mappedEvents.some((me) => me.title.toLowerCase() === dc.title.toLowerCase())),
            ]
            setConcerts(mergedConcerts)
          }
        }

        if (artistsRes.status === 'fulfilled') {
          const resData = artistsRes.value.data
          const rawArtists: BackendArtist[] = Array.isArray(resData)
            ? resData
            : Array.isArray(resData?.data)
            ? resData.data
            : []

          if (rawArtists.length > 0) {
            const mappedArtists: DisplayArtist[] = rawArtists.map((art, idx) => {
              const photoUrl = art.photo || ''
              const validPhoto = photoUrl.startsWith('http')
                ? photoUrl
                : photoUrl.startsWith('/uploads')
                ? photoUrl
                : DEFAULT_ARTISTS[idx % DEFAULT_ARTISTS.length].photo

              return {
                id: art.id,
                name: art.name,
                genre: art.description || 'Pop Rock',
                photo: validPhoto,
              }
            })

            const mergedArtists = [
              ...mappedArtists,
              ...DEFAULT_ARTISTS.filter((da) => !mappedArtists.some((ma) => ma.name.toLowerCase() === da.name.toLowerCase())),
            ]
            setArtists(mergedArtists.slice(0, 12))
          }
        }
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredArtists = artists.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.genre.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredConcerts = concerts.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleScrollToConcerts = () => {
    const el = document.getElementById('konser-mendatang')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleTicketDetailClick = (concertId: string) => {
    if (concertId.startsWith('concert-')) {
      const realConcert = concerts.find((c) => !c.id.startsWith('concert-'))
      if (realConcert) {
        navigate(`/ticket/${realConcert.id}`)
        return
      }
    }
    navigate(`/ticket/${concertId}`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="relative w-full rounded-3xl overflow-hidden bg-gray-950 min-h-[380px] sm:min-h-[460px] flex items-center p-6 sm:p-12 lg:p-16 shadow-xl shadow-purple-950/10">
        <img
          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&auto=format&fit=crop&q=80"
          alt="Concert Hero"
          className="absolute inset-0 w-full h-full object-cover opacity-85 object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-950/80 via-black/40 to-transparent"></div>

        <div className="relative z-10 max-w-lg bg-[#581c87]/55 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl text-white">
          <span className="text-[#c084fc] font-bold text-xs tracking-wider block mb-2">
            Rasakan Langsung Energinya
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            Malam Musik<br />Terbesar di Indonesia
          </h1>
          <p className="text-purple-100 text-xs sm:text-sm mt-3 leading-relaxed">
            Beli tiket konser artis favoritmu sekarang!
          </p>
          <button
            type="button"
            onClick={handleScrollToConcerts}
            className="mt-6 inline-flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-purple-900/40 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Pesan Tiket Sekarang</span>
            <span className="text-base">&rarr;</span>
          </button>
        </div>
      </div>

      <section id="artis-populer" className="mt-14 scroll-mt-24">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Artis Populer
          </h2>
          <button
            type="button"
            onClick={handleScrollToConcerts}
            className="text-xs sm:text-sm font-bold text-[#7C3AED] hover:text-[#6D28D9] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Lihat Semua</span>
            <span>&rarr;</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-3 border border-gray-100 shadow-xs animate-pulse">
                <div className="w-full aspect-square bg-gray-200 rounded-xl mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : filteredArtists.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400 mt-6 text-sm">
            Tidak ada artis yang cocok dengan pencarian &quot;{searchQuery}&quot;
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
            {filteredArtists.slice(0, 6).map((artist) => (
              <div
                key={artist.id}
                onClick={handleScrollToConcerts}
                className="bg-white rounded-2xl p-3 border border-gray-100 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center cursor-pointer group"
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-100 mb-3">
                  <img
                    src={artist.photo}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-bold text-gray-900 text-sm tracking-tight line-clamp-1 group-hover:text-[#7C3AED] transition-colors">
                  {artist.name}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                  {artist.genre}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="konser-mendatang" className="mt-14 scroll-mt-24">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Konser Mendatang
          </h2>
          <button
            type="button"
            onClick={handleScrollToConcerts}
            className="text-xs sm:text-sm font-bold text-[#7C3AED] hover:text-[#6D28D9] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Lihat Semua</span>
            <span>&rarr;</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-xs p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-5 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : filteredConcerts.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400 mt-6 text-sm">
            Tidak ada konser yang cocok dengan pencarian &quot;{searchQuery}&quot;
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {filteredConcerts.slice(0, 6).map((concert) => (
              <div
                key={concert.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group"
              >
                <div className="w-full h-48 sm:h-52 bg-gray-100 overflow-hidden relative">
                  <img
                    src={concert.imageUrl}
                    alt={concert.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 line-clamp-1 group-hover:text-[#7C3AED] transition-colors">
                      {concert.title}
                    </h3>

                    <div className="mt-2.5 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <svg className="w-3.5 h-3.5 text-[#7C3AED] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="line-clamp-1">{concert.location}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <svg className="w-3.5 h-3.5 text-[#7C3AED] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="line-clamp-1">{concert.formattedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="border-t border-gray-100 my-4"></div>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-xs text-gray-900 font-bold block">
                          {concert.formattedPrice}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleTicketDetailClick(concert.id)}
                        className="px-4 py-1.5 border border-[#7C3AED] text-[#7C3AED] hover:bg-[#7C3AED] hover:text-white rounded-lg text-xs font-semibold transition-colors duration-200 cursor-pointer"
                      >
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-[#F8F9FD] border border-gray-100 rounded-2xl p-6 sm:p-8 mt-14 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v3.5a1.5 1.5 0 010 3V16a2 2 0 002 2h16a2 2 0 002-2v-3.5a1.5 1.5 0 010-3V6a2 2 0 00-2-2H4zm8 3a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1V8a1 1 0 011-1z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Tiket 100% Resmi</h4>
              <p className="text-xs text-gray-500 mt-0.5">Aman & terpercaya</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Pembayaran Aman</h4>
              <p className="text-xs text-gray-500 mt-0.5">Metode pembayaran terpercaya</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Mudah & Cepat</h4>
              <p className="text-xs text-gray-500 mt-0.5">Proses instan</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 4V3z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Bantuan 24/7</h4>
              <p className="text-xs text-gray-500 mt-0.5">Siap membantu kapan saja</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
