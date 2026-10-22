import { useEffect, useState } from 'react'

interface DashboardStats {
    totalRevenue: number
    totalTicketsSold: number
    totalEvents: number
}

interface RecentTransaction {
    id: number
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
                const res = await fetch('/api/admin/dashboard', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                })
                const data = await res.json()
                if (res.ok) {
                    setStats(data.stats)
                    setTransactions(data.transactions)
                }
            } catch (error) {
                console.error('Gagal mengambil data dashboard', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500 animate-pulse text-lg">Memuat data dashboard...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Dashboard Admin</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                        <p className="text-sm text-gray-500 mb-1">Total Pendapatan</p>
                        <p className="text-2xl font-bold text-gray-800">
                            Rp {stats.totalRevenue.toLocaleString('id-ID')}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                        <p className="text-sm text-gray-500 mb-1">Tiket Terjual</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.totalTicketsSold}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                        <p className="text-sm text-gray-500 mb-1">Total Event Aktif</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.totalEvents}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="font-bold text-gray-800">Transaksi Terbaru</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">ID</th>
                                    <th className="px-6 py-3">Pembeli</th>
                                    <th className="px-6 py-3">Event</th>
                                    <th className="px-6 py-3">Kategori</th>
                                    <th className="px-6 py-3">Qty</th>
                                    <th className="px-6 py-3">Total</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                            Belum ada transaksi
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((trx) => (
                                        <tr key={trx.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-6 py-4">#{trx.id}</td>
                                            <td className="px-6 py-4 font-medium text-gray-800">{trx.buyerName}</td>
                                            <td className="px-6 py-4">{trx.eventTitle}</td>
                                            <td className="px-6 py-4">{trx.categoryName}</td>
                                            <td className="px-6 py-4">{trx.quantity}</td>
                                            <td className="px-6 py-4">Rp {trx.totalAmount.toLocaleString('id-ID')}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${trx.status === 'PAID' || trx.status === 'SUCCESS'
                                                        ? 'bg-green-100 text-green-700'
                                                        : trx.status === 'PENDING'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {trx.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {new Date(trx.createdAt).toLocaleDateString('id-ID')}
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
    )
}