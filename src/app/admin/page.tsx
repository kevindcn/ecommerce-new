'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { adminAPI } from '@/lib/api'
import { formatPrice } from '@/data/products'
import {
  Users, Package, ShoppingBag, TrendingUp,
  AlertTriangle, ArrowRight, Settings, LogOut
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isLoggedIn, loading, logout } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        router.replace('/login')
        return
      }
      if (user?.role !== 'ADMIN') {
        router.replace('/home')
        return
      }
      loadDashboard()
    }
  }, [loading, isLoggedIn, user])

  const loadDashboard = async () => {
    try {
      const res = await adminAPI.getDashboard()
      setData(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingData(false)
    }
  }

  if (loading || loadingData) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
    </div>
  )

  const stats = [
    { label: 'Total Users', value: data?.stats.totalUsers || 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Produk', value: data?.stats.totalProducts || 0, icon: Package, color: 'bg-green-500' },
    { label: 'Total Orders', value: data?.stats.totalOrders || 0, icon: ShoppingBag, color: 'bg-purple-500' },
    { label: 'Total Revenue', value: formatPrice(data?.stats.totalRevenue || 0), icon: TrendingUp, color: 'bg-amber-500' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Admin */}
      <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-black tracking-tight">AUSTIN <span className="text-blue-400">&</span> CO Admin</h1>
          <div className="hidden md:flex items-center gap-4 text-sm">
            <Link href="/admin" className="text-white font-semibold">Dashboard</Link>
            <Link href="/admin/products" className="text-gray-400 hover:text-white transition-colors">Produk</Link>
            <Link href="/admin/orders" className="text-gray-400 hover:text-white transition-colors">Orders</Link>
            <Link href="/admin/users" className="text-gray-400 hover:text-white transition-colors">Users</Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{user?.name}</span>
          <button
            onClick={() => { logout(); router.replace('/home') }}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 text-sm mt-1">Selamat datang, {user?.name}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white mb-3`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Order Terbaru</h3>
              <Link href="/admin/orders" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                Lihat semua <ArrowRight size={12} />
              </Link>
            </div>
            <div className="space-y-3">
              {data?.recentOrders?.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Belum ada order</p>
              )}
              {data?.recentOrders?.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">ORDER-{order.id}</p>
                    <p className="text-xs text-gray-400">{order.user?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatPrice(order.totalAmount)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      order.status === 'PAID' ? 'bg-green-50 text-green-700' :
                      order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                Stok Menipis
              </h3>
              <Link href="/admin/products" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                Kelola <ArrowRight size={12} />
              </Link>
            </div>
            <div className="space-y-3">
              {data?.lowStock?.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Semua stok aman</p>
              )}
              {data?.lowStock?.map((product: any) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <img src={product.image} alt={product.name} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.category}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                    product.stock === 0 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    Sisa {product.stock}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {[
            { href: '/admin/products', label: 'Kelola Produk', desc: 'Tambah, edit, hapus produk', icon: Package, color: 'bg-green-500' },
            { href: '/admin/orders', label: 'Kelola Orders', desc: 'Update status pesanan', icon: ShoppingBag, color: 'bg-purple-500' },
            { href: '/admin/users', label: 'Kelola Users', desc: 'Manage akun pengguna', icon: Users, color: 'bg-blue-500' },
          ].map(({ href, label, desc, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="font-bold text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
              <ArrowRight size={16} className="text-gray-400 ml-auto" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}