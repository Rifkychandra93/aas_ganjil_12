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
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            const res = await api.get('/users')
            const data = Array.isArray(res.data) ? res.data : (res.data?.data || [])
            setUsers(data)
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

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                <p className="text-sm text-gray-500">Kelola akses admin dan petugas penjaga scanner tiket</p>
            </div>

            {message && (
                <div
                    className={`p-4 rounded-xl mb-6 text-sm font-medium border ${
                        message.type === 'success'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                >
                    {message.text}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 className="font-bold text-gray-800 mb-1">Undang Admin / Penjaga Baru</h2>
                <p className="text-xs text-gray-500 mb-4">
                    Kirim email undangan otomatis via protokol SMTP ke alamat email tujuan
                </p>
                <form onSubmit={handleInvite} className="flex flex-col md:flex-row gap-3">
                    <input
                        type="email"
                        placeholder="Masukkan Email Aktif (cth: petugas@gmail.com)"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        required
                        className="flex-1 border border-gray-200 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="border border-gray-200 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-white"
                    >
                        <option value="ADMIN">Admin</option>
                        <option value="GUARD">Penjaga (Scanner)</option>
                    </select>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Mengirim SMTP...
                            </>
                        ) : (
                            'Kirim Undangan'
                        )}
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 uppercase text-xs border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Nama</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Memuat data user...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                        Belum ada pengguna terdaftar
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-gray-900">{user.name}</td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                user.role === 'SUPERADMIN'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : user.role === 'ADMIN'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : user.role === 'GUARD'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                                {user.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="text-red-600 hover:text-red-800 font-medium hover:underline text-xs"
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