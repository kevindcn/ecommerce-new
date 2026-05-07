'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Navbar from '@/components/navbar'
import { formatPrice } from '@/data/products' 
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Order,
  OrderStatus,
  STATUS_CONFIG,
  MOCK_ORDERS,
  getOrders
} from '@/data/orders'
import { Package, ChevronRight, ShoppingBag } from 'lucide-react'


const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [activeTab, setActiveTab] = useState<'all' | OrderStatus>('all')

 useEffect(() => {
  // ✅ Baca dari localStorage — sinkron dengan pesanan yang baru dibuat
  const saved = getOrders()
  setOrders(saved)
}, [])

  const TABS: { key: 'all' | OrderStatus; label: string }[] = [
    { key: 'all',       label: 'Semua' },
    { key: 'confirmed', label: 'Dikonfirmasi' },
    { key: 'processing',label: 'Dikemas' },
    { key: 'shipped',   label: 'Dikirim' },
    { key: 'delivered', label: 'Diterima' },
    { key: 'cancelled', label: 'Dibatalkan' },
  ]

  const filtered = activeTab === 'all'
    ? orders
    : orders.filter((o) => o.status === activeTab)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center text-white">
            <Package size={16} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pesanan Saya</h1>
            <p className="text-xs text-gray-400">{orders.length} total pesanan</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {TABS.map(({ key, label }) => {
            const count = key === 'all' ? orders.length : orders.filter((o) => o.status === key).length
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === key
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {label}
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Order List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={28} className="text-gray-300" />
            </div>
            <p className="font-semibold text-gray-600">Belum ada pesanan</p>
            <p className="text-sm text-gray-400 mt-1 mb-5">Yuk mulai belanja sekarang!</p>
            <Button
              onClick={() => router.push('/home')}
              className="bg-gray-900 hover:bg-gray-700 text-white rounded-xl"
            >
              Mulai Belanja
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => {
              const cfg = STATUS_CONFIG[order.status]
              const StatusIcon = cfg.icon
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/orders/${order.id}`)}
                >
                  {/* Order Header */}
                  <div className="p-5 pb-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">{formatDate(order.createdAt)}</p>
                        <p className="font-bold text-gray-900 font-mono text-sm">{order.orderNumber}</p>
                      </div>
                      <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                        <StatusIcon size={12} />
                        {cfg.label}
                      </span>
                    </div>

                    {/* Items preview */}
                    <div className="flex gap-2 mb-3">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                          {i === 2 && order.items.length > 3 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">+{order.items.length - 3}</span>
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="flex-1 flex flex-col justify-center ml-1">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                          {order.items[0].name}
                          {order.items.length > 1 && (
                            <span className="text-gray-400 font-normal"> +{order.items.length - 1} lainnya</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{order.courier}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <p className="text-xs text-gray-400">Total Pembayaran</p>
                        <p className="font-bold text-gray-900">{formatPrice(order.totalAmount)}</p>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-900">
                        Lihat Detail <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {order.status !== 'cancelled' && (
                    <div className="px-5 pb-4">
                      <div className="flex items-center gap-1">
                        {(['confirmed', 'processing', 'shipped', 'delivered'] as OrderStatus[]).map((s, i, arr) => {
                          const steps: OrderStatus[] = ['confirmed', 'processing', 'shipped', 'delivered']
                          const currentIdx = steps.indexOf(order.status)
                          const stepIdx = steps.indexOf(s)
                          const done = stepIdx <= currentIdx
                          return (
                            <div key={s} className="flex items-center flex-1">
                              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors ${
                                done ? 'bg-gray-900' : 'bg-gray-200'
                              }`} />
                              {i < arr.length - 1 && (
                                <div className={`flex-1 h-0.5 transition-colors ${
                                  stepIdx < currentIdx ? 'bg-gray-900' : 'bg-gray-200'
                                }`} />
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex justify-between mt-1">
                        {['Konfirmasi', 'Kemas', 'Kirim', 'Terima'].map((label) => (
                          <p key={label} className="text-xs text-gray-400" style={{ fontSize: '10px' }}>{label}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}