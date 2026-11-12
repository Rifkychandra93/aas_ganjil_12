import { useEffect, useState } from 'react'
import api from '../../utils/api'

interface UserItem {
  id: string
  name: string
  email: string
  role: string
  status: string
}

export default function UserManagementContent() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('ADMIN')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const res = await api.get('/users')
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || [])
      const staffOnly = data.filter((u: UserItem) => u.role?.toUpperCase() !== 'CUSTOMER')
      setUsers(staffOnly)
    } catch (err: any) {
      console.error('Gagal memuat pengguna', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)
    try {
      const res = await api.post('/users/invite', {
        email: inviteEmail,
        role: inviteRole,
      })
      setMessage({
        type: 'success',
        text: res.data?.message || `Undangan berhasil dikirim via SMTP ke ${inviteEmail}`,
      })
      setInviteEmail('')
      fetchUsers()
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Gagal mengirim undangan email',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus user ini dari sistem?')) {
      try {
        await api.delete(`/users/${id}`)
        setUsers(users.filter((u) => u.id !== id))
      } catch (err: any) {
        alert(err.response?.data?.message || 'Gagal menghapus user')
      }
    }
  }

  const getRoleBadge = (role: string) => {
    const r = role?.toUpperCase()
    if (r === 'SUPERADMIN') return 'bg-purple-100 text-[#7C3AED] border-purple-200'
    if (r === 'ADMIN') return 'bg-blue-100 text-blue-700 border-blue-200'
    if (r === 'GUARD') return 'bg-amber-100 text-amber-700 border-amber-200'
    return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  }

  const filteredUsers = users.filter((u) => {
    if (u.role?.toUpperCase() === 'CUSTOMER') return false
    const matchRole = roleFilter === 'ALL' || u.role?.toUpperCase() === roleFilter
    const matchSearch =
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchRole && matchSearch
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">User Management </h1>
        <p className="text-sm text-gray-500 mt-0.5">Kelola akun administrator, superadmin, dan staf penjaga tiket konser</p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold border flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          <span>{message.text}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-gray-400 hover:text-gray-700 font-bold ml-4 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6">
        <div className="mb-4">
          <h2 className="font-bold text-gray-900 text-base">Undang Admin </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Surat undangan akan terkirim lewat email
          </p>
        </div>
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
            placeholder="Masukkan Email Aktif (cth: petugas@gmail.com)"
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#7C3AED] focus:bg-white focus:ring-2 focus:ring-purple-100"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="px-4 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#7C3AED] font-semibold text-gray-700"
          >
            <option value="ADMIN">ADMIN</option>
            <option value="GUARD">GUARD / PENJAGA</option>
            <option value="SUPERADMIN">SUPERADMIN</option>
          </select>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-purple-200 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Undangan'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-gray-900 text-base">Daftar Akun Staff & Admin</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-[#7C3AED] text-xs font-bold">
              {users.length} Staff
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-44 px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#7C3AED] font-semibold text-gray-700"
            >
              <option value="ALL">Semua Peran Staff</option>
              <option value="SUPERADMIN">SUPERADMIN</option>
              <option value="ADMIN">ADMIN</option>
              <option value="GUARD">GUARD</option>
            </select>

            <div className="relative w-full sm:w-60">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau email..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#7C3AED] focus:bg-white focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-[#F9FAFC] text-gray-500 uppercase text-xs border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold">Pengguna</th>
                <th className="px-6 py-4 font-bold">Email</th>
                <th className="px-6 py-4 font-bold">Peran (Role)</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div>
                      <span>Memuat daftar akun staff...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    Belum ada akun staff yang sesuai dengan filter
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-purple-50/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#6D28D9] to-[#8B5CF6] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                          {user.name ? user.name[0].toUpperCase() : 'U'}
                        </div>
                        <span className="font-bold text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        {user.status || 'Aktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(user.id)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Hapus
                      </button>
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
