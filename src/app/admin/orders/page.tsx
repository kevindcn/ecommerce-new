'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { adminAPI } from '@/lib/api'
import { formatPrice } from '@/data/products'
import { ArrowLeft, Search, ShoppingBag } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'

const ORDER_STATUSES = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  PENDING:    { label: 'Menunggu',     bg: 'bg-yellow-50', color: 'text-yellow-700' },
  PAID:       { label: 'Dikonfirmasi', bg: 'bg-blue-50',   color: 'text-blue-700'   },
  PROCESSING: { label: 'Dikemas',      bg: 'bg-purple-50', color: 'text-purple-700' },
  SHIPPED:    { label: 'Dikirim',      bg: 'bg-indigo-50', color: 'text-indigo-700' },
  DELIVERED:  { label: 'Diterima',     bg: 'bg-green-50',  color: 'text-green-700'  },
  CANCELLED:  { label: 'Dibatalkan',   bg: 'bg-red-50',    color: 'text-red-700'    },
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

export default function AdminOrdersPage() {
  const router = useRouter()
  const { user, isLoggedIn, loading } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [updating, setUpdating] = useState<number | null>(null)

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn || user?.role !== 'ADMIN') {
        router.replace('/home')
        return
      }
      loadOrders()
    }
  }, [loading, isLoggedIn, user])

  const loadOrders = async () => {
    try {
      const data = await adminAPI.getOrders()
      setOrders(data)
    } catch (err) {
      toast.error('Gagal load orders')
    } finally {
      setLoadingData(false)
    }
  }

  const handleUpdateStatus = async (orderId: number, status: string) => {
    setUpdating(orderId)
    try {
      await adminAPI.updateOrderStatus(orderId, status)
      toast.success('Status order berhasil diupdate!')
      loadOrders()
    } catch (err: any) {
      toast.error(err.message || 'Gagal update status')
    } finally {
      setUpdating(null)
    }
  }

  const filtered = orders.filter(o => {
    const matchSearch = `ORDER-${o.id}`.includes(search.toUpperCase()) ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.user?.email?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || o.status === filterStatus
    return matchSearch && matchStatus
  })

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
            <Link href="/admin/orders" className="text-white font-semibold">Orders</Link>
            <Link href="/admin/users" className="text-gray-400 hover:text-white transition-colors">Users</Link>
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
            <h1 className="text-2xl font-bold text-gray-900">Kelola Orders</h1>
            <p className="text-sm text-gray-500">{orders.length} order total</p>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cari order ID atau nama user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11 rounded-xl border-gray-200"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-11 rounded-xl border border-gray-200 px-3 text-sm bg-white min-w-[160px]"
          >
            <option value="all">Semua Status</option>
            {ORDER_STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
            ))}
          </select>
        </div>

        {loadingData ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <ShoppingBag size={32} className="mx-auto mb-2 text-gray-200" />
                <p className="text-gray-400">Tidak ada order</p>
              </div>
            ) : (
              filtered.map((order) => {
                const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['PENDING']
                return (
                  <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="font-bold text-gray-900 font-mono">ORDER-{order.id}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {order.user?.name} · {order.user?.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatPrice(order.totalAmount)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="flex gap-2 mb-4">
                      {order.items.slice(0, 4).map((item: any, i: number) => (
                        <div key={i} className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                        </div>
                      ))}
                      <div className="flex-1 flex flex-col justify-center ml-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {order.items[0]?.product?.name}
                          {order.items.length > 1 && (
                            <span className="text-gray-400 font-normal"> +{order.items.length - 1} lainnya</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400">{order.courier}</p>
                      </div>
                    </div>

                    {/* Update Status */}
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-500">Update Status:</p>
                      <div className="flex gap-2 flex-wrap">
                        {ORDER_STATUSES.map(status => (
                          <button
                            key={status}
                            onClick={() => handleUpdateStatus(order.id, status)}
                            disabled={order.status === status || updating === order.id}
                            className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
                              order.status === status
                                ? `${STATUS_CONFIG[status].bg} ${STATUS_CONFIG[status].color} cursor-default`
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            {updating === order.id && order.status !== status ? '...' : STATUS_CONFIG[status].label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}