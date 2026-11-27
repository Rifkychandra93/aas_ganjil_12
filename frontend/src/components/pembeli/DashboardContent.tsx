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
  day: string
  month: string
}

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

const getDateParts = (dateStr?: string) => {
  if (!dateStr) return { day: '--', month: 'TBA' }
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return { day: '--', month: 'TBA' }
  return {
    day: String(d.getDate()),
    month: d.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase(),
  }
}

const formatPrice = (price: number) => {
  if (!price || price <= 0) return 'Segera Hadir'
  return 'Rp' + Number(price).toLocaleString('id-ID')
}

const resolveImage = (url?: string | null) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('/uploads')) return url
  return ''
}

const FEATURES = [
  {
    title: 'Tiket 100% Resmi',
    desc: 'Aman & terpercaya',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 4a2 2 0 00-2 2v3.5a1.5 1.5 0 010 3V16a2 2 0 002 2h16a2 2 0 002-2v-3.5a1.5 1.5 0 010-3V6a2 2 0 00-2-2H4zm8 3a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1V8a1 1 0 011-1z" />
      </svg>
    ),
  },
  {
    title: 'Pembayaran Aman',
    desc: 'Metode pembayaran terpercaya',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    title: 'Mudah & Cepat',
    desc: 'Proses instan',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Bantuan 24/7',
    desc: 'Siap membantu kapan saja',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 4V3z" />
      </svg>
    ),
  },
]

export default function DashboardContent() {
  const navigate = useNavigate()
  const context = useOutletContext<{ searchQuery?: string }>()
  const searchQuery = context?.searchQuery || ''

  const [artists, setArtists] = useState<DisplayArtist[]>([])
  const [concerts, setConcerts] = useState<DisplayEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLocation, setActiveLocation] = useState('Semua')

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

          const mappedEvents: DisplayEvent[] = rawEvents.map((evt) => {
            const categories = evt.ticketCategories || evt.ticketTypes || []
            const prices = categories
              .map((c) => Number(c.price))
              .filter((p) => !isNaN(p) && p > 0)
            const minPrice = prices.length > 0 ? Math.min(...prices) : 0

            const rawDate = evt.eventDate || evt.date
            const parts = getDateParts(rawDate)

            return {
              id: evt.id,
              title: evt.title,
              location: evt.location || '-',
              formattedDate: formatEventDate(rawDate),
              formattedPrice: formatPrice(minPrice),
              rawPrice: minPrice,
              imageUrl: resolveImage(evt.imageUrl || evt.poster),
              day: parts.day,
              month: parts.month,
            }
          })

          setConcerts(mappedEvents)
        }

        if (artistsRes.status === 'fulfilled') {
          const resData = artistsRes.value.data
          const rawArtists: BackendArtist[] = Array.isArray(resData)
            ? resData
            : Array.isArray(resData?.data)
            ? resData.data
            : []

          const mappedArtists: DisplayArtist[] = rawArtists.map((art) => ({
            id: art.id,
            name: art.name,
            genre: art.description || '',
            photo: resolveImage(art.photo),
          }))

          setArtists(mappedArtists.slice(0, 12))
        }
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const locations = ['Semua', ...Array.from(new Set(concerts.map((c) => c.location)))]

  const filteredArtists = artists.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.genre.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredConcerts = concerts.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchLocation = activeLocation === 'Semua' || c.location === activeLocation
    return matchSearch && matchLocation
  })

  const handleScrollToConcerts = () => {
    const el = document.getElementById('konser-mendatang')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleScrollToArtists = () => {
    const el = document.getElementById('artis-populer')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleTicketDetailClick = (concertId: string) => {
    navigate(`/ticket/${concertId}`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="relative w-full rounded-[2rem] overflow-hidden bg-gray-950 min-h-[420px] sm:min-h-[520px] flex items-end lg:items-center p-5 sm:p-10 lg:p-16 shadow-2xl shadow-purple-950/20">
        <img
          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&auto=format&fit=crop&q=80"
          alt="Concert Hero"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-950 via-purple-950/60 to-transparent lg:bg-gradient-to-r lg:from-purple-950/95 lg:via-purple-950/50 lg:to-transparent"></div>
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#7C3AED]/40 blur-3xl"></div>
        <div className="absolute -bottom-28 left-1/3 w-72 h-72 rounded-full bg-[#c084fc]/20 blur-3xl"></div>

        <div className="relative z-10 w-full max-w-xl text-white">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-[#c084fc] font-bold text-[11px] sm:text-xs tracking-wider px-3.5 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c084fc] animate-pulse"></span>
            Rasakan Langsung Energinya
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight">
            Malam Musik
            <br />
            <span className="bg-gradient-to-r from-[#c084fc] to-white bg-clip-text text-transparent">
              Terbesar di Indonesia
            </span>
          </h1>
          <p className="text-purple-100/90 text-sm sm:text-base mt-4 leading-relaxed max-w-md">
            Beli tiket konser artis favoritmu sekarang!
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleScrollToConcerts}
              className="inline-flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-6 sm:px-7 py-3 rounded-full text-sm font-semibold transition-all shadow-lg shadow-purple-900/50 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Pesan Tiket Sekarang</span>
              <span className="text-base">&rarr;</span>
            </button>
            <button
              type="button"
              onClick={handleScrollToArtists}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full text-sm font-semibold transition-all cursor-pointer"
            >
              Lihat Artis
            </button>
          </div>

          {!loading && (
            <div className="mt-9 grid grid-cols-3 gap-3 max-w-md">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3">
                <p className="text-xl sm:text-2xl font-black">{concerts.length}</p>
                <p className="text-[11px] text-purple-200 mt-0.5">Konser</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3">
                <p className="text-xl sm:text-2xl font-black">{artists.length}</p>
                <p className="text-[11px] text-purple-200 mt-0.5">Artis</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-3">
                <p className="text-xl sm:text-2xl font-black">{locations.length - 1}</p>
                <p className="text-[11px] text-purple-200 mt-0.5">Kota</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <section id="artis-populer" className="mt-16 scroll-mt-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="text-[#7C3AED] text-xs font-bold tracking-widest uppercase">Favorit Penggemar</span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
              Artis Populer
            </h2>
          </div>
          <button
            type="button"
            onClick={handleScrollToConcerts}
            className="text-xs sm:text-sm font-bold text-[#7C3AED] hover:text-[#6D28D9] bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <span>Lihat Semua</span>
            <span>&rarr;</span>
          </button>
        </div>

        {loading ? (
          <div className="flex gap-6 mt-8 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center shrink-0 w-28 sm:w-36 animate-pulse">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gray-200"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mt-4"></div>
                <div className="h-3 bg-gray-100 rounded w-12 mt-2"></div>
              </div>
            ))}
          </div>
        ) : artists.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400 mt-8 text-sm">
            Belum ada artis yang tersedia
          </div>
        ) : filteredArtists.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400 mt-8 text-sm">
            Tidak ada artis yang cocok dengan pencarian &quot;{searchQuery}&quot;
          </div>
        ) : (
          <div className="flex gap-5 sm:gap-8 mt-8 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filteredArtists.map((artist) => (
              <div
                key={artist.id}
                onClick={handleScrollToConcerts}
                className="snap-start shrink-0 w-28 sm:w-36 flex flex-col items-center text-center cursor-pointer group"
              >
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1 bg-gradient-to-tr from-[#7C3AED] via-[#c084fc] to-purple-200 group-hover:from-[#6D28D9] group-hover:to-[#c084fc] transition-all duration-300 group-hover:-translate-y-1.5 shadow-lg shadow-purple-200 group-hover:shadow-purple-300">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white p-1">
                    {artist.photo ? (
                      <img
                        src={artist.photo}
                        alt={artist.name}
                        className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-[#7C3AED] to-[#581c87] flex items-center justify-center text-white text-3xl sm:text-4xl font-black">
                        {artist.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 text-sm mt-4 tracking-tight line-clamp-1 group-hover:text-[#7C3AED] transition-colors">
                  {artist.name}
                </h3>
                {artist.genre && (
                  <span className="mt-1.5 text-[10px] font-semibold text-[#7C3AED] bg-purple-50 px-2.5 py-0.5 rounded-full line-clamp-1 max-w-full">
                    {artist.genre}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="konser-mendatang" className="mt-16 scroll-mt-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="text-[#7C3AED] text-xs font-bold tracking-widest uppercase">Jangan Sampai Terlewat</span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
              Konser Mendatang
            </h2>
          </div>
        </div>

        {locations.length > 2 && (
          <div className="flex gap-2.5 mt-6 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {locations.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setActiveLocation(loc)}
                className={`shrink-0 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-200 cursor-pointer ${
                  activeLocation === loc
                    ? 'bg-[#7C3AED] border-[#7C3AED] text-white shadow-md shadow-purple-300'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-[#7C3AED] hover:text-[#7C3AED]'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden animate-pulse">
                <div className="w-full h-56 bg-gray-200"></div>
                <div className="p-5">
                  <div className="h-5 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : concerts.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400 mt-8 text-sm">
            Belum ada konser yang tersedia
          </div>
        ) : filteredConcerts.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400 mt-8 text-sm">
            Tidak ada konser yang cocok dengan pencarian atau filter yang dipilih
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {filteredConcerts.slice(0, 6).map((concert) => (
              <div
                key={concert.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-purple-200/60 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col group"
              >
                <div className="w-full h-56 bg-gray-100 overflow-hidden relative">
                  {concert.imageUrl ? (
                    <img
                      src={concert.imageUrl}
                      alt={concert.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#7C3AED] via-purple-800 to-[#581c87]"></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-950/80 via-transparent to-transparent"></div>

                  <div className="absolute top-4 left-4 bg-white rounded-2xl px-3 py-2 text-center shadow-lg min-w-[52px]">
                    <p className="text-lg font-black text-gray-900 leading-none">{concert.day}</p>
                    <p className="text-[10px] font-bold text-[#7C3AED] tracking-wider mt-1">{concert.month}</p>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-1.5 text-white text-xs font-medium">
                    <svg className="w-3.5 h-3.5 text-[#c084fc] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="line-clamp-1">{concert.location}</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-lg text-gray-900 line-clamp-1 group-hover:text-[#7C3AED] transition-colors">
                      {concert.title}
                    </h3>

                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                      <svg className="w-4 h-4 text-[#7C3AED] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="line-clamp-1">{concert.formattedDate}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-dashed border-gray-200 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-gray-400 font-medium block">Mulai dari</span>
                      <span className="text-base font-black text-[#7C3AED] block leading-tight">
                        {concert.formattedPrice}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTicketDetailClick(concert.id)}
                      className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-full text-xs font-semibold transition-all duration-200 shadow-md shadow-purple-300 hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      Lihat Detail
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#581c87] via-purple-900 to-[#7C3AED] rounded-[2rem] p-6 sm:p-10 mt-16 mb-8 shadow-xl shadow-purple-950/20">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-2xl"></div>
        <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-[#c084fc]/20 blur-2xl"></div>

        <div className="relative">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Kenapa Pesan di Sini?
            </h2>
            <p className="text-purple-200 text-sm mt-2">
              Pengalaman memesan tiket konser yang nyaman dari awal sampai akhir.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {FEATURES.map((item) => (
              <div
                key={item.title}
                className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-2xl bg-white text-[#7C3AED] flex items-center justify-center shadow-lg">
                  {item.icon}
                </div>
                <h4 className="font-bold text-base text-white mt-4">{item.title}</h4>
                <p className="text-xs text-purple-200 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}