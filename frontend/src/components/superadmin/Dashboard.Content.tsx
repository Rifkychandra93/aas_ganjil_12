import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'

interface DayData {
  day: string
  revenue: number
  tickets: number
}

interface CategoryDist {
  name: string
  sold: number
  quota: number
  percentage: number
}

interface DashboardStats {
  totalRevenue: number
  totalTicketsSold: number
  totalEvents: number
  totalUsers: number
  totalArtists: number
  totalOrders: number
  pendingOrders: number
  paidOrders: number
  weeklyStats?: DayData[]
  categoryDistribution?: CategoryDist[]
}

interface RecentTransaction {
  id: string | number
  buyerName: string
  eventTitle: string
  categoryName: string
  quantity: number
  totalAmount: number
  status: string
  createdAt: string
}

const DEFAULT_DAY_NAMES = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

export default function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalTicketsSold: 0,
    totalEvents: 0,
    totalUsers: 0,
    totalArtists: 0,
    totalOrders: 0,
    pendingOrders: 0,
    paidOrders: 0,
    weeklyStats: DEFAULT_DAY_NAMES.map((d) => ({ day: d, revenue: 0, tickets: 0 })),
    categoryDistribution: [],
  })
  const [transactions, setTransactions] = useState<RecentTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [chartMetric, setChartMetric] = useState<'revenue' | 'tickets'>('revenue')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashRes, eventsRes, usersRes, artistsRes] = await Promise.allSettled([
          api.get('/admin/dashboard'),
          api.get('/events'),
          api.get('/users'),
          api.get('/artists'),
        ])

        let fetchedStats: Partial<DashboardStats> = {}

        if (dashRes.status === 'fulfilled') {
          const resData = dashRes.value.data
          const dataStats = resData?.stats || resData?.data?.stats
          const dataTransactions = resData?.transactions || resData?.data?.transactions || []
          if (dataStats) {
            fetchedStats = { ...dataStats }
          }
          if (Array.isArray(dataTransactions)) {
            setTransactions(dataTransactions)
          }
        }

        if (eventsRes.status === 'fulfilled') {
          const eventList = Array.isArray(eventsRes.value.data)
            ? eventsRes.value.data
            : eventsRes.value.data?.data || []
          fetchedStats.totalEvents = eventList.length
        }

        if (usersRes.status === 'fulfilled') {
          const userList = Array.isArray(usersRes.value.data)
            ? usersRes.value.data
            : usersRes.value.data?.data || []
          fetchedStats.totalUsers = userList.length
        }

        if (artistsRes.status === 'fulfilled') {
          const artistList = Array.isArray(artistsRes.value.data)
            ? artistsRes.value.data
            : artistsRes.value.data?.data || []
          fetchedStats.totalArtists = artistList.length
        }

        setStats((prev) => {
          const updatedWeekly =
            fetchedStats.weeklyStats && fetchedStats.weeklyStats.length === 7
              ? fetchedStats.weeklyStats
              : prev.weeklyStats || DEFAULT_DAY_NAMES.map((d) => ({ day: d, revenue: 0, tickets: 0 }))

          return {
            ...prev,
            ...fetchedStats,
            totalRevenue: fetchedStats.totalRevenue ?? 0,
            totalTicketsSold: fetchedStats.totalTicketsSold ?? 0,
            totalEvents: fetchedStats.totalEvents ?? 0,
            totalUsers: fetchedStats.totalUsers ?? 0,
            totalArtists: fetchedStats.totalArtists ?? 0,
            totalOrders: fetchedStats.totalOrders ?? 0,
            pendingOrders: fetchedStats.pendingOrders ?? 0,
            paidOrders: fetchedStats.paidOrders ?? 0,
            weeklyStats: updatedWeekly,
            categoryDistribution: fetchedStats.categoryDistribution || [],
          }
        })
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatRupiah = (val: number) => {
    return 'Rp ' + Number(val || 0).toLocaleString('id-ID')
  }

  const weeklyList: DayData[] =
    stats.weeklyStats && stats.weeklyStats.length === 7
      ? stats.weeklyStats
      : DEFAULT_DAY_NAMES.map((d) => ({ day: d, revenue: 0, tickets: 0 }))

  const metricValues = weeklyList.map((m) => (chartMetric === 'revenue' ? m.revenue : m.tickets))
  const maxRaw = Math.max(...metricValues)
  const maxVal = maxRaw > 0 ? maxRaw : chartMetric === 'revenue' ? 1000000 : 10

  const svgWidth = 680
  const svgHeight = 220
  const padLeft = 35
  const padRight = 35
  const padTop = 25
  const padBottom = 35
  const plotWidth = svgWidth - padLeft - padRight
  const plotHeight = svgHeight - padTop - padBottom

  const points = weeklyList.map((item, idx) => {
    const val = chartMetric === 'revenue' ? item.revenue : item.tickets
    const x = padLeft + (idx / (weeklyList.length - 1)) * plotWidth
    const y = padTop + plotHeight - (maxVal > 0 ? (val / maxVal) * plotHeight : 0)
    return { x, y, val, day: item.day }
  })

  const linePathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`
  }, '')

  const areaPathD = points.length > 0
    ? `${linePathD} L ${points[points.length - 1].x} ${padTop + plotHeight} L ${points[0].x} ${padTop + plotHeight} Z`
    : ''

  const gridLineY = [padTop, padTop + plotHeight * 0.33, padTop + plotHeight * 0.66, padTop + plotHeight]

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null

  const categoryColors = ['#7C3AED', '#9333EA', '#C084FC', '#A855F7', '#E9D5FF']
  const donutRadius = 55
  const donutCircumference = 2 * Math.PI * donutRadius
  const totalCategorySold = (stats.categoryDistribution || []).reduce((acc, curr) => acc + curr.sold, 0)

  let accumulatedPercent = 0

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard Ringkasan & Grafik Garis</h1>
          <p className="text-sm text-gray-500 mt-0.5">Analisis data real-time penjualan tiket mingguan dan operasional platform</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/superadmin/events"
            className="inline-flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-purple-200 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Kelola Event</span>
          </Link>
          <Link
            to="/superadmin/ticket"
            className="inline-flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-[#7C3AED] px-4 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <span>Kelola Tiket</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Pendapatan</span>
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mt-3">{formatRupiah(stats.totalRevenue)}</h3>
          <p className="text-xs text-gray-400 mt-2">Akumulasi seluruh transaksi terbayar</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tiket Terjual</span>
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v3.5a1.5 1.5 0 010 3V16a2 2 0 002 2h16a2 2 0 002-2v-3.5a1.5 1.5 0 010-3V6a2 2 0 00-2-2H4zm8 3a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1V8a1 1 0 011-1z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mt-3">{stats.totalTicketsSold.toLocaleString('id-ID')} Tiket</h3>
          <p className="text-xs text-gray-400 mt-2">Jumlah tiket yang telah diterbitkan</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Event Aktif</span>
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mt-3">{stats.totalEvents} Event</h3>
          <p className="text-xs text-gray-400 mt-2">Jumlah konser musik terdaftar</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Customer / User</span>
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mt-3">{stats.totalUsers} Pengguna</h3>
          <p className="text-xs text-gray-400 mt-2">Pengguna terdaftar di database</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-7 border border-gray-100 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-bold text-gray-900 text-lg">Tren Penjualan RealTime</h2>
              <p className="text-xs text-gray-400 mt-0.5">Grafik garis tren mingguan (Senin s/d Minggu)</p>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setChartMetric('revenue')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  chartMetric === 'revenue'
                    ? 'bg-[#7C3AED] text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Pendapatan
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('tickets')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  chartMetric === 'tickets'
                    ? 'bg-[#7C3AED] text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Tiket Terjual
              </button>
            </div>
          </div>

          <div className="w-full overflow-x-auto relative">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-64 sm:h-72 select-none"
            >
              <defs>
                <linearGradient id="purpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {gridLineY.map((yVal, i) => (
                <line
                  key={i}
                  x1={padLeft}
                  y1={yVal}
                  x2={svgWidth - padRight}
                  y2={yVal}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              ))}

              {areaPathD && (
                <path d={areaPathD} fill="url(#purpleAreaGrad)" />
              )}

              {linePathD && (
                <path
                  d={linePathD}
                  fill="none"
                  stroke="#7C3AED"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {activePoint && (
                <line
                  x1={activePoint.x}
                  y1={padTop}
                  x2={activePoint.x}
                  y2={padTop + plotHeight}
                  stroke="#C084FC"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  pointerEvents="none"
                />
              )}

              {points.map((pt, idx) => {
                const isHovered = hoveredIndex === idx
                return (
                  <g
                    key={pt.day}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="cursor-pointer"
                  >
                    <rect
                      x={pt.x - 30}
                      y={padTop}
                      width="60"
                      height={plotHeight + 25}
                      fill="transparent"
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? '7.5' : '5'}
                      fill="#7C3AED"
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      className="transition-all duration-200 pointer-events-none"
                    />
                    <text
                      x={pt.x}
                      y={svgHeight - 12}
                      textAnchor="middle"
                      fill={isHovered ? '#7C3AED' : '#94A3B8'}
                      fontSize="12"
                      fontWeight={isHovered ? 'bold' : '600'}
                      className="pointer-events-none"
                    >
                      {pt.day}
                    </text>
                  </g>
                )
              })}

              {activePoint && (
                <g pointerEvents="none" className="transition-all duration-150">
                  <rect
                    x={Math.max(padLeft, Math.min(svgWidth - padRight - 140, activePoint.x - 70))}
                    y={activePoint.y > 65 ? activePoint.y - 50 : activePoint.y + 14}
                    width="140"
                    height="40"
                    rx="12"
                    fill="#1E1B4B"
                  />
                  <text
                    x={Math.max(padLeft, Math.min(svgWidth - padRight - 140, activePoint.x - 70)) + 70}
                    y={activePoint.y > 65 ? activePoint.y - 34 : activePoint.y + 30}
                    textAnchor="middle"
                    fill="#C084FC"
                    fontSize="10"
                    fontWeight="700"
                  >
                    {activePoint.day}
                  </text>
                  <text
                    x={Math.max(padLeft, Math.min(svgWidth - padRight - 140, activePoint.x - 70)) + 70}
                    y={activePoint.y > 65 ? activePoint.y - 18 : activePoint.y + 46}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="11"
                    fontWeight="800"
                  >
                    {chartMetric === 'revenue' ? formatRupiah(activePoint.val) : `${activePoint.val.toLocaleString('id-ID')} Tiket`}
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-100 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Distribusi Kategori Tiket</h2>
            <p className="text-xs text-gray-400 mt-0.5">Persentase tiket terjual per kelas</p>
          </div>

          <div className="my-6 flex flex-col items-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r={donutRadius}
                  stroke="#F3E8FF"
                  strokeWidth="16"
                  fill="none"
                />
                {stats.categoryDistribution && stats.categoryDistribution.length > 0 && totalCategorySold > 0 ? (
                  stats.categoryDistribution.map((cat, idx) => {
                    const strokeDash = (cat.percentage / 100) * donutCircumference
                    const strokeOffset = -(accumulatedPercent / 100) * donutCircumference
                    accumulatedPercent += cat.percentage
                    const col = categoryColors[idx % categoryColors.length]

                    return (
                      <circle
                        key={cat.name}
                        cx="80"
                        cy="80"
                        r={donutRadius}
                        stroke={col}
                        strokeWidth="16"
                        fill="none"
                        strokeDasharray={`${strokeDash} ${donutCircumference}`}
                        strokeDashoffset={strokeOffset}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    )
                  })
                ) : (
                  <circle
                    cx="80"
                    cy="80"
                    r={donutRadius}
                    stroke="#7C3AED"
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={`${donutCircumference * 0.15} ${donutCircumference}`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    className="opacity-40"
                  />
                )}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-gray-900 leading-none">
                  {totalCategorySold > 0 ? totalCategorySold : stats.totalTicketsSold}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                  Tiket Terjual
                </span>
              </div>
            </div>

            <div className="w-full mt-6 space-y-2">
              {stats.categoryDistribution && stats.categoryDistribution.length > 0 ? (
                stats.categoryDistribution.map((cat, idx) => {
                  const col = categoryColors[idx % categoryColors.length]
                  return (
                    <div key={cat.name} className="flex items-center justify-between text-xs font-semibold py-1 border-b border-gray-50 last:border-b-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: col }}></span>
                        <span className="text-gray-800 line-clamp-1">{cat.name}</span>
                      </div>
                      <span className="text-gray-500 font-bold shrink-0">
                        {cat.sold} ({cat.percentage}%)
                      </span>
                    </div>
                  )
                })
              ) : (
                <div className="text-center text-xs text-gray-400 py-2">
                  Belum ada pembagian data tiket
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-100">
            <p className="text-xs text-gray-600 leading-relaxed">
              Total pesanan: <strong className="text-[#7C3AED]">{stats.totalOrders}</strong> ({stats.paidOrders} lunas, {stats.pendingOrders} menunggu).
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Aktivitas Transaksi Terbaru</h2>
            <p className="text-xs text-gray-400 mt-0.5">Data transaksi asli dari pesanan pembeli di database</p>
          </div>
          <Link
            to="/superadmin/logs"
            className="text-xs font-bold text-[#7C3AED] hover:text-[#6D28D9] flex items-center gap-1 transition-colors"
          >
            <span>Lihat Seluruh Log</span>
            <span>&rarr;</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-[#F9FAFC] text-gray-500 uppercase text-xs border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold">Pembeli</th>
                <th className="px-6 py-4 font-bold">Event & Kelas</th>
                <th className="px-6 py-4 font-bold">Jumlah</th>
                <th className="px-6 py-4 font-bold">Total Pembayaran</th>
                <th className="px-6 py-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div>
                      <span>Memuat transaksi...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    Belum ada riwayat transaksi tiket di database
                  </td>
                </tr>
              ) : (
                transactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-purple-50/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {trx.buyerName}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800 line-clamp-1">{trx.eventTitle}</p>
                      <span className="text-xs text-gray-400">{trx.categoryName}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {trx.quantity} Tiket
                    </td>
                    <td className="px-6 py-4 font-bold text-[#7C3AED]">
                      {formatRupiah(trx.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        trx.status === 'PAID'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : trx.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {trx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
