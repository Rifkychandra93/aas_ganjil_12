import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'

interface DashboardStats {
  totalRevenue: number
  totalTicketsSold: number
  totalEvents: number
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

export default function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalTicketsSold: 0,
    totalEvents: 0,
  })
  const [transactions, setTransactions] = useState<RecentTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/admin/dashboard')
        const data = res.data
        if (data.stats) {
          setStats(data.stats)
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

  const formatRupiah = (val: number) => {
    return 'Rp ' + Number(val).toLocaleString('id-ID')
  }

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
                          : trx.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {trx.status}
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
