import { useEffect, useState, useRef } from 'react'
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
  weeklyStats?: DayData[]
  categoryDistribution?: CategoryDist[]
}

interface RecentTransaction {
  id: number | string
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
    weeklyStats: DEFAULT_DAY_NAMES.map((d) => ({ day: d, revenue: 0, tickets: 0 })),
    categoryDistribution: [],
  })
  const [transactions, setTransactions] = useState<RecentTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [chartMetric, setChartMetric] = useState<'revenue' | 'tickets'>('revenue')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [donutAnimated, setDonutAnimated] = useState(false)
  const donutRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/admin/dashboard')
        const data = res.data
        if (data.stats) {
          setStats((prev) => ({ ...prev, ...data.stats }))
        }
        if (data.transactions) {
          setTransactions(data.transactions)
        }
      } catch (error) {
        console.error('Gagal mengambil data dashboard admin', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (donutAnimated) return
    const el = donutRef.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setDonutAnimated(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setDonutAnimated(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [donutAnimated])

  const formatRupiah = (val: number) => {
    return 'Rp ' + Number(val).toLocaleString('id-ID')
  }

  const weeklyList: DayData[] = (() => {
    if (stats.weeklyStats && stats.weeklyStats.length === 7) {
      return stats.weeklyStats
    }
    const base = DEFAULT_DAY_NAMES.map((d) => ({ day: d, revenue: 0, tickets: 0 }))
    if (transactions.length === 0) return base
    transactions.forEach((trx) => {
      const date = new Date(trx.createdAt)
      if (isNaN(date.getTime())) return
      const jsDay = date.getDay()
      const idx = jsDay === 0 ? 6 : jsDay - 1
      if (trx.status === 'PAID' || trx.status === 'USED') {
        base[idx].revenue += trx.totalAmount
        base[idx].tickets += trx.quantity
      }
    })
    return base
  })()

  const categoryList: CategoryDist[] = (() => {
    if (stats.categoryDistribution && stats.categoryDistribution.length > 0) {
      return stats.categoryDistribution
    }
    if (transactions.length === 0) return []
    const map: Record<string, number> = {}
    transactions.forEach((trx) => {
      const key = trx.categoryName || 'Lainnya'
      map[key] = (map[key] || 0) + trx.quantity
    })
    const total = Object.values(map).reduce((a, b) => a + b, 0)
    if (total === 0) return []
    return Object.entries(map).map(([name, sold]) => ({
      name,
      sold,
      quota: sold,
      percentage: Math.round((sold / total) * 100),
    }))
  })()

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
  const totalCategorySold = categoryList.reduce((acc, curr) => acc + curr.sold, 0)
  let accumulatedPercent = 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard Admin</h1>
          <p className="text-sm text-gray-500 mt-0.5">Ringkasan transaksi dan penjualan tiket konser</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/events"
            className="inline-flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-purple-200 transition-all cursor-pointer"
          >
            <span>Kelola Event</span>
          </Link>
          <Link
            to="/admin/ticket"
            className="inline-flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-[#7C3AED] px-4 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            <span>Kelola Tiket</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Pendapatan</span>
          <h3 className="text-2xl font-black text-gray-900 mt-2">{formatRupiah(stats.totalRevenue)}</h3>
          <p className="text-xs text-green-600 font-semibold mt-1">Hasil penjualan tiket terkonfirmasi</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Tiket Terjual</span>
          <h3 className="text-2xl font-black text-gray-900 mt-2">{stats.totalTicketsSold.toLocaleString('id-ID')}</h3>
          <p className="text-xs text-gray-400 mt-1">Total tiket yang telah dibeli</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Event Aktif</span>
          <h3 className="text-2xl font-black text-gray-900 mt-2">{stats.totalEvents} Event</h3>
          <p className="text-xs text-gray-400 mt-1">Jadwal konser yang tersedia</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-7 border border-gray-100 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-bold text-gray-900 text-lg">Tren Penjualan Mingguan</h2>
              <p className="text-xs text-gray-400 mt-0.5">Grafik garis tren (Senin s/d Minggu)</p>
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
            <div ref={donutRef} className="relative w-44 h-44 flex items-center justify-center">
              <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r={donutRadius}
                  stroke="#F3E8FF"
                  strokeWidth="16"
                  fill="none"
                />
                {categoryList.length > 0 && totalCategorySold > 0 ? (
                  categoryList.map((cat, idx) => {
                    const strokeDash = (cat.percentage / 100) * donutCircumference
                    const strokeOffset = -(accumulatedPercent / 100) * donutCircumference
                    accumulatedPercent += cat.percentage
                    const col = categoryColors[idx % categoryColors.length]
                    const delay = idx * 180

                    return (
                      <circle
                        key={cat.name}
                        cx="80"
                        cy="80"
                        r={donutRadius}
                        stroke={col}
                        strokeWidth="16"
                        fill="none"
                        strokeDasharray={
                          donutAnimated
                            ? `${strokeDash} ${donutCircumference}`
                            : `0 ${donutCircumference}`
                        }
                        strokeDashoffset={strokeOffset}
                        strokeLinecap="round"
                        style={{
                          transition: `stroke-dasharray 900ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
                        }}
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
                    strokeDasharray={
                      donutAnimated
                        ? `${donutCircumference * 0.15} ${donutCircumference}`
                        : `0 ${donutCircumference}`
                    }
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    className="opacity-40"
                    style={{
                      transition: 'stroke-dasharray 900ms cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                )}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span
                  className="text-2xl font-black text-gray-900 leading-none"
                  style={{
                    opacity: donutAnimated ? 1 : 0,
                    transform: donutAnimated ? 'scale(1)' : 'scale(0.6)',
                    transition: 'opacity 500ms ease 400ms, transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1) 400ms',
                  }}
                >
                  {totalCategorySold > 0 ? totalCategorySold : stats.totalTicketsSold}
                </span>
                <span
                  className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1"
                  style={{
                    opacity: donutAnimated ? 1 : 0,
                    transition: 'opacity 500ms ease 500ms',
                  }}
                >
                  Tiket Terjual
                </span>
              </div>
            </div>

            <div className="w-full mt-6 space-y-2">
              {categoryList.length > 0 ? (
                categoryList.map((cat, idx) => {
                  const col = categoryColors[idx % categoryColors.length]
                  const delay = idx * 180 + 300
                  return (
                    <div
                      key={cat.name}
                      className="flex items-center justify-between text-xs font-semibold py-1 border-b border-gray-50 last:border-b-0"
                      style={{
                        opacity: donutAnimated ? 1 : 0,
                        transform: donutAnimated ? 'translateX(0)' : 'translateX(-8px)',
                        transition: `opacity 400ms ease ${delay}ms, transform 400ms ease ${delay}ms`,
                      }}
                    >
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
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-base">Transaksi Terbaru</h2>
          <span className="text-xs text-gray-400">{transactions.length} Transaksi Tercatat</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-[#F9FAFC] text-gray-500 uppercase text-xs border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold">Pembeli</th>
                <th className="px-6 py-4 font-bold">Event & Kategori</th>
                <th className="px-6 py-4 font-bold">Jumlah</th>
                <th className="px-6 py-4 font-bold">Total Pembayaran</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div>
                      <span>Memuat data transaksi...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    Belum ada transaksi tiket saat ini
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
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        trx.status === 'PAID'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : trx.status === 'USED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : trx.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {trx.status === 'USED' ? 'SELESAI (SCAN)' : trx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(trx.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
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