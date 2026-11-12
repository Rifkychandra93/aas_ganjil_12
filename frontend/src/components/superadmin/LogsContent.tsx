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
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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

  useEffect(() => {
    setCurrentPage(1)
  }, [roleFilter, searchQuery])

  const filteredLogs = logs.filter((log) => {
    const matchRole = roleFilter === 'ALL' || log.role?.toUpperCase() === roleFilter
    const matchSearch =
      (log.user && log.user.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.action && log.action.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchRole && matchSearch
  })

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage)

  const getRoleBadge = (role: string) => {
    const r = role?.toUpperCase()
    if (r === 'SUPERADMIN') return 'bg-purple-100 text-[#7C3AED] border-purple-200'
    if (r === 'ADMIN') return 'bg-blue-100 text-blue-700 border-blue-200'
    if (r === 'GUARD') return 'bg-amber-100 text-amber-700 border-amber-200'
    return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">System Activity Logs</h1>
          <p className="text-sm text-gray-500 mt-0.5">Catatan audit riwayat aktivitas sistem per 10 item per halaman</p>
        </div>
        <button
          type="button"
          onClick={fetchLogs}
          disabled={isLoading}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:text-[#7C3AED] hover:border-[#7C3AED] px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Segarkan Log</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900">{logs.length} Total Aktivitas</h3>
            <p className="text-xs text-gray-400">Menampilkan 10 riwayat log per halaman secara terpaginasi</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-44 px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#7C3AED] font-semibold text-gray-700"
          >
            <option value="ALL">Semua Peran / Role</option>
            <option value="SUPERADMIN">SUPERADMIN</option>
            <option value="ADMIN">ADMIN</option>
            <option value="GUARD">GUARD</option>
            <option value="CUSTOMER">CUSTOMER</option>
          </select>

          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari user atau aktivitas..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#7C3AED] focus:bg-white focus:ring-2 focus:ring-purple-100"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-[#F9FAFC] text-gray-500 uppercase text-xs border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold w-16">No</th>
                <th className="px-6 py-4 font-bold">Waktu</th>
                <th className="px-6 py-4 font-bold">Pengguna</th>
                <th className="px-6 py-4 font-bold">Peran</th>
                <th className="px-6 py-4 font-bold">Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div>
                      <span>Memuat catatan audit log...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    Belum ada log yang sesuai dengan filter
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log, idx) => (
                  <tr key={log.id} className="hover:bg-purple-50/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-400">
                      {startIndex + idx + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500">
                      {log.time}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-50 text-[#7C3AED] flex items-center justify-center font-bold text-xs shrink-0">
                          {log.user ? log.user[0].toUpperCase() : 'U'}
                        </div>
                        <span className="line-clamp-1">{log.user}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getRoleBadge(log.role)}`}>
                        {log.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {log.action}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-100 bg-[#FAFAFD] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            Menampilkan{' '}
            <strong className="text-gray-900">
              {filteredLogs.length === 0 ? 0 : startIndex + 1}
            </strong>{' '}
            -{' '}
            <strong className="text-gray-900">
              {Math.min(startIndex + itemsPerPage, filteredLogs.length)}
            </strong>{' '}
            dari <strong className="text-gray-900">{filteredLogs.length}</strong> aktivitas
          </p>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || filteredLogs.length === 0}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-white hover:text-[#7C3AED] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              Sebelumnya
            </button>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1)
              .filter((page) => {
                return (
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1
                )
              })
              .map((page, idx, arr) => {
                const prevPage = arr[idx - 1]
                const showEllipsis = prevPage && page - prevPage > 1

                return (
                  <span key={page} className="flex items-center gap-1.5">
                    {showEllipsis && <span className="text-xs text-gray-400 px-1">...</span>}
                    <button
                      type="button"
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        currentPage === page
                          ? 'bg-[#7C3AED] text-white shadow-xs'
                          : 'border border-gray-200 text-gray-600 hover:bg-white hover:text-[#7C3AED]'
                      }`}
                    >
                      {page}
                    </button>
                  </span>
                )
              })}

            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || filteredLogs.length === 0}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-white hover:text-[#7C3AED] disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
