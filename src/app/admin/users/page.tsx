'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { adminAPI } from '@/lib/api'
import { ArrowLeft, Search, Users, Trash2, Shield, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Link from 'next/link'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

export default function AdminUsersPage() {
  const router = useRouter()
  const { user, isLoggedIn, loading } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn || user?.role !== 'ADMIN') {
        router.replace('/home')
        return
      }
      loadUsers()
    }
  }, [loading, isLoggedIn, user])

  const loadUsers = async () => {
    try {
      const data = await adminAPI.getUsers()
      setUsers(data)
    } catch (err) {
      toast.error('Gagal load users')
    } finally {
      setLoadingData(false)
    }
  }

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'
    if (!confirm(`Ubah role user ini menjadi ${newRole}?`)) return
    setUpdating(userId)
    try {
      await adminAPI.updateUserRole(userId, newRole)
      toast.success(`Role berhasil diubah ke ${newRole}!`)
      loadUsers()
    } catch (err: any) {
      toast.error(err.message || 'Gagal update role')
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async (userId: string) => {
    if (userId === user?.id) {
      toast.error('Tidak bisa hapus akun sendiri!')
      return
    }
    if (!confirm('Yakin hapus user ini? Semua data akan hilang!')) return
    setDeleting(userId)
    try {
      await adminAPI.deleteUser(userId)
      toast.success('User berhasil dihapus!')
      loadUsers()
    } catch (err: any) {
      toast.error(err.message || 'Gagal hapus user')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-xl font-black tracking-tight">
            AUSTIN <span className="text-blue-400">&</span> CO Admin
          </Link>
          <div className="hidden md:flex items-center gap-4 text-sm">
            <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/admin/products" className="text-gray-400 hover:text-white transition-colors">Produk</Link>
            <Link href="/admin/orders" className="text-gray-400 hover:text-white transition-colors">Orders</Link>
            <Link href="/admin/users" className="text-white font-semibold">Users</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Users</h1>
            <p className="text-sm text-gray-500">{users.length} user terdaftar</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 rounded-xl border-gray-200"
          />
        </div>

        {loadingData ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">User</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Orders</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Bergabung</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400">
                      <Users size={32} className="mx-auto mb-2 text-gray-200" />
                      Tidak ada user
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {u.role === 'ADMIN' ? '👑 Admin' : '👤 User'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {u._count?.orders || 0} order
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-500">{formatDate(u.createdAt)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleRole(u.id, u.role)}
                            disabled={updating === u.id}
                            title={u.role === 'ADMIN' ? 'Jadikan User' : 'Jadikan Admin'}
                            className={`p-2 rounded-xl transition-colors ${
                              u.role === 'ADMIN'
                                ? 'text-purple-400 hover:text-purple-700 hover:bg-purple-50'
                                : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                            }`}
                          >
                            {updating === u.id
                              ? <div className="w-4 h-4 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                              : u.role === 'ADMIN' ? <User size={15} /> : <Shield size={15} />
                            }
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            disabled={deleting === u.id || u.id === user?.id}
                            className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30"
                          >
                            {deleting === u.id
                              ? <div className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
                              : <Trash2 size={15} />
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}