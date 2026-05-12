'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Navbar from '@/components/navbar'
import { formatPrice } from '@/data/products'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { orderAPI } from '@/lib/api'
import {
  ArrowLeft, Package, Truck, MapPin, CheckCircle,
  XCircle, Clock, Copy, Check, Phone, MessageCircle,
  RefreshCw, CreditCard
} from 'lucide-react'

type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; color: string }> = {
  PENDING:    { label: 'Menunggu Pembayaran', bg: 'bg-yellow-50', color: 'text-yellow-700' },
  PAID:       { label: 'Dikonfirmasi',        bg: 'bg-blue-50',   color: 'text-blue-700'   },
  PROCESSING: { label: 'Dikemas',             bg: 'bg-purple-50', color: 'text-purple-700' },
  SHIPPED:    { label: 'Dikirim',             bg: 'bg-indigo-50', color: 'text-indigo-700' },
  DELIVERED:  { label: 'Diterima',            bg: 'bg-green-50',  color: 'text-green-700'  },
  CANCELLED:  { label: 'Dibatalkan',          bg: 'bg-red-50',    color: 'text-red-700'    },
}

const ALL_STEPS: { status: OrderStatus; label: string; desc: string; icon: React.ElementType }[] = [
  { status: 'PAID',       label: 'Pesanan Dikonfirmasi', desc: 'Pembayaran diterima, pesanan dalam antrian', icon: CheckCircle },
  { status: 'PROCESSING', label: 'Sedang Dikemas',       desc: 'Produk sedang disiapkan di gudang',          icon: Package    },
  { status: 'SHIPPED',    label: 'Dalam Pengiriman',     desc: 'Paket dalam perjalanan ke alamatmu',          icon: Truck      },
  { status: 'DELIVERED',  label: 'Pesanan Diterima',     desc: 'Paket telah sampai di tujuan',                icon: MapPin     },
]

const STATUS_ORDER: OrderStatus[] = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED']

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

export default function OrderDetailPage() {
  const { id }   = useParams()
  const router   = useRouter()
  const [order, setOrder]         = useState<any>(null)
  const [loading, setLoading]     = useState(true)
  const [copied, setCopied]       = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const loadOrder = async () => {
    try {
      const orderId = Array.isArray(id) ? id[0] : id as string
      const data    = await orderAPI.getById(Number(orderId))
      setOrder(data)
    } catch (err) {
      console.error('Gagal load order:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadOrder() }, [id])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadOrder()
    setRefreshing(false)
  }

  const handleLanjutBayar = () => {
    const orderId = Array.isArray(id) ? id[0] : id as string
    router.push(`/payment?orderId=${orderId}`)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Memuat detail pesanan...</p>
      </div>
    </div>
  )

  if (!order) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package size={28} className="text-gray-300" />
        </div>
        <p className="font-semibold text-gray-700 mb-1">Pesanan tidak ditemukan</p>
        <p className="text-sm text-gray-400 mb-5">Pesanan dengan ID ini tidak ada.</p>
        <Button
          onClick={() => router.push('/orders')}
          className="bg-gray-900 hover:bg-gray-700 text-white rounded-xl"
        >
          Lihat Semua Pesanan
        </Button>
      </div>
    </div>
  )

  const cfg            = STATUS_CONFIG[order.status as OrderStatus] ?? STATUS_CONFIG['PENDING']
  const currentStepIdx = STATUS_ORDER.indexOf(order.status)
  const isCancelled    = order.status === 'CANCELLED'
  const isPending      = order.status === 'PENDING'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Back */}
        <button
          onClick={() => router.push('/orders')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Kembali ke Pesanan Saya
        </button>

        {/* Banner Menunggu Pembayaran */}
        {isPending && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5 mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <CreditCard size={18} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-yellow-800">Menunggu Pembayaran</p>
                <p className="text-xs text-yellow-600 mt-0.5">Segera selesaikan pembayaran untuk memproses pesanan</p>
              </div>
            </div>
            <Button
              onClick={handleLanjutBayar}
              className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-bold px-5 h-10 rounded-xl flex-shrink-0"
            >
              Lanjut Bayar
            </Button>
          </div>
        )}

        {/* Header Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Nomor Pesanan</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-gray-900 font-mono">ORDER-{order.id}</p>
                <button
                  onClick={() => handleCopy(`ORDER-${order.id}`)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">{formatDate(order.createdAt)}</p>
            </div>
            <span className={`flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
              {cfg.label}
            </span>
          </div>

          {/* Payment info */}
          {order.payment && (
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              <span className="bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                💳 {order.payment.method}
              </span>
              <span className={`px-2.5 py-1 rounded-full font-medium ${
                order.payment.status === 'SUCCESS'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-yellow-50 text-yellow-700'
              }`}>
                {order.payment.status === 'SUCCESS' ? '✓ Lunas' : '⏳ Menunggu Pembayaran'}
              </span>
            </div>
          )}
        </div>

        {/* Tracking Timeline — sembunyikan kalau PENDING */}
        {!isPending && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">Status Pengiriman</h2>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors ${refreshing ? 'opacity-50' : ''}`}
              >
                <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Memperbarui...' : 'Perbarui'}
              </button>
            </div>

            {isCancelled ? (
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
                <XCircle size={24} className="text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-bold text-red-700">Pesanan Dibatalkan</p>
                  <p className="text-xs text-red-500 mt-0.5">Pesanan ini telah dibatalkan.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-0">
                {ALL_STEPS.map(({ status, label, desc, icon: Icon }, i) => {
                  const stepIdx   = STATUS_ORDER.indexOf(status)
                  const isDone    = stepIdx <= currentStepIdx
                  const isCurrent = stepIdx === currentStepIdx
                  return (
                    <div key={status} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          isCurrent
                            ? 'bg-gray-900 text-white shadow-lg ring-4 ring-gray-900/10'
                            : isDone
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-300'
                        }`}>
                          {isDone && !isCurrent
                            ? <Check size={16} strokeWidth={3} />
                            : <Icon size={16} />
                          }
                        </div>
                        {i < ALL_STEPS.length - 1 && (
                          <div className={`w-0.5 h-12 my-0.5 transition-colors ${
                            stepIdx < currentStepIdx ? 'bg-green-400' : 'bg-gray-100'
                          }`} />
                        )}
                      </div>
                      <div className={`pb-8 flex-1 ${i === ALL_STEPS.length - 1 ? 'pb-0' : ''}`}>
                        <div className={`font-bold text-sm pt-2 ${isDone ? 'text-gray-900' : 'text-gray-300'}`}>
                          {label}
                          {isCurrent && (
                            <span className="ml-2 text-xs font-semibold bg-gray-900 text-white px-2 py-0.5 rounded-full">
                              Sekarang
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 ${isDone ? 'text-gray-500' : 'text-gray-300'}`}>
                          {desc}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Shipping Address */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={16} /> Alamat Pengiriman
          </h2>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="font-semibold text-gray-900 text-sm">{order.shippingAddress}</p>
            <p className="text-sm text-gray-500 mt-0.5">
              {order.shippingCity}, {order.shippingProvince} {order.shippingZip}
            </p>
            {order.phone && (
              <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                <Phone size={12} /> {order.phone}
              </p>
            )}
            {order.notes && (
              <p className="text-xs text-gray-400 mt-1 italic">Catatan: {order.notes}</p>
            )}
            <Separator className="my-3" />
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Truck size={14} />
              <span>Dikirim via <strong>{order.courier}</strong></span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <h2 className="font-bold text-gray-900 mb-4">Detail Produk</h2>
          <div className="space-y-4">
            {order.items.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                  <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm leading-tight">{item.product.name}</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {item.size && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                        Ukuran: {item.size}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">x{item.quantity}</span>
                  </div>
                </div>
                <p className="font-bold text-gray-900 text-sm flex-shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal ({order.items.length} produk)</span>
              <span className="font-semibold text-gray-900">{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Kurir</span>
              <span className="font-semibold text-gray-900">{order.courier}</span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-900">Total</span>
            <span className="text-xl font-bold text-gray-900">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>

        {/* Help */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <p className="text-sm font-bold text-gray-900 mb-3">Butuh Bantuan?</p>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-gray-100 hover:border-gray-200 text-sm font-semibold text-gray-700 transition-colors">
              <Phone size={15} /> Hubungi CS
            </button>
            <button className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-gray-100 hover:border-gray-200 text-sm font-semibold text-gray-700 transition-colors">
              <MessageCircle size={15} /> Live Chat
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {isPending && (
            <Button
              onClick={handleLanjutBayar}
              className="w-full h-12 bg-gray-900 hover:bg-gray-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <CreditCard size={16} /> Lanjut Bayar Sekarang
            </Button>
          )}
          <Button
            onClick={() => router.push('/home')}
            variant={isPending ? 'outline' : 'default'}
            className={`w-full h-12 rounded-xl font-bold ${
              isPending
                ? 'border-2 border-gray-200 text-gray-700 hover:bg-gray-50'
                : 'bg-gray-900 hover:bg-gray-700 text-white'
            }`}
          >
            Belanja Lagi
          </Button>
        </div>

      </div>
    </div>
  )
}