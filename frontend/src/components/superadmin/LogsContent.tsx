import { useEffect, useState } from 'react'
import api from '../../utils/api'

interface LogItem {
    id: string
    user: string
    role: string
    action: string
    details?: string
    time: string
}

export default function LogsContent() {
    const [logs, setLogs] = useState<LogItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    const fetchLogs = async () => {
        setIsLoading(true)
        setError('')
        try {
            const res = await api.get('/logs')
            const data = Array.isArray(res.data) ? res.data : (res.data?.data || [])
            setLogs(data)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal memuat log aktivitas sistem')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [])

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">System Activity Logs</h1>
                    <p className="text-sm text-gray-500">Catatan aktivitas dan riwayat sistem secara real-time</p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium"
                >
                    <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Segarkan
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 uppercase text-xs border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Waktu</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Aktivitas</th>
                                <th className="px-6 py-4">Detail</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex justify-center items-center gap-3">
                                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            Memuat log sistem...
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        Belum ada catatan aktivitas sistem
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500">
                                            {log.time}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {log.user}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                log.role === 'SUPERADMIN'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : log.role === 'ADMIN'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : log.role === 'GUARD'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                                {log.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-800 font-medium">
                                            {log.action}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                                            {log.details || '-'}
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