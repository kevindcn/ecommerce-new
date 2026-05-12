'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle, Package, Truck, MapPin, Home,
  ArrowRight, Bell, MessageCircle, Star, Clock
} from 'lucide-react'

export default function OrderSuccessPage() {
  const router = useRouter()
  const [showRating, setShowRating] = useState(false)
  const [rating, setRating] = useState(0)
  const [latestOrderId, setLatestOrderId]     = useState<string | null>(null)
  const [latestOrderNumber, setLatestOrderNumber] = useState<string>('')

 useEffect(() => {
  const orderId = sessionStorage.getItem('latestOrderId')

  if (orderId) {
    setLatestOrderId(orderId)
    setLatestOrderNumber(`ORDER-${orderId}`)
  } else {
    // Kalau tidak ada order, redirect ke home
    router.push('/home')
  }

  sessionStorage.removeItem('latestOrderId')
  sessionStorage.removeItem('latestOrderNumber')

  const t = setTimeout(() => setShowRating(true), 3000)
  return () => clearTimeout(t)
}, [router])

  const handleTrackOrder = () => {
    if (latestOrderId) {
      router.push(`/orders/${latestOrderId}`)
    } else {
      router.push('/orders')
    }
  }

  const ORDER_STEPS = [
    { icon: CheckCircle, label: 'Pesanan Dikonfirmasi', desc: 'Pesanan kamu sudah kami terima',      done: true,  time: 'Baru saja' },
    { icon: Package,     label: 'Sedang Dikemas',       desc: 'Produk sedang disiapkan di gudang',  done: false, time: '1–2 jam'  },
    { icon: Truck,       label: 'Dalam Pengiriman',     desc: 'Paket dalam perjalanan ke alamatmu', done: false, time: '1–2 hari' },
    { icon: MapPin,      label: 'Terkirim',             desc: 'Paket sudah sampai di tujuan',        done: false, time: '2–3 hari' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">

        {/* Success Hero */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-28 h-28 mb-5">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20" />
            <div className="absolute inset-2 bg-green-50 rounded-full animate-pulse opacity-40" />
            <div className="relative w-28 h-28 bg-white rounded-full flex items-center justify-center border-4 border-green-100 shadow-lg">
              <CheckCircle size={52} className="text-green-500" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pesanan Berhasil! 🎉</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Terima kasih sudah berbelanja di AUSTIN & CO.<br />
            Pesananmu sedang kami proses ya!
          </p>
        </div>

        {/* Order ID Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nomor Pesanan</p>
            <span className="text-xs bg-green-50 text-green-700 font-bold px-2.5 py-1 rounded-full">
              ✓ Dikonfirmasi
            </span>
          </div>
          {/* ✅ Tampilkan order number yang real */}
          <p className="text-2xl font-bold text-gray-900 font-mono tracking-wider">
            {latestOrderNumber || 'Memuat...'}
          </p>
          <p className="text-xs text-gray-400 mt-1">Simpan nomor ini untuk melacak pesananmu</p>
          <Separator className="my-3" />
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div>
              <p className="text-gray-400 mb-0.5">Estimasi Tiba</p>
              <p className="font-bold text-gray-900">2–3 Hari</p>
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">Kurir</p>
              <p className="font-bold text-gray-900">JNE</p>
            </div>
            <div>
              <p className="text-gray-400 mb-0.5">Metode</p>
              <p className="font-bold text-gray-900">Transfer</p>
            </div>
          </div>
        </div>

        {/* Tracking Steps */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Bell size={16} /> Status Pesanan
          </h2>
          <div className="space-y-0">
            {ORDER_STEPS.map(({ icon: Icon, label, desc, done, time }, i) => (
              <div key={label} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    done
                      ? 'bg-gray-900 text-white shadow-md ring-4 ring-gray-900/10'
                      : 'bg-gray-100 text-gray-300'
                  }`}>
                    <Icon size={18} />
                  </div>
                  {i < ORDER_STEPS.length - 1 && (
                    <div className={`w-0.5 h-10 mt-0.5 ${done ? 'bg-gray-300' : 'bg-gray-100'}`} />
                  )}
                </div>
                <div className="pt-2 pb-4 flex-1">
                  <p className={`text-sm font-bold ${done ? 'text-gray-900' : 'text-gray-400'}`}>
                    {label}
                    {done && (
                      <span className="ml-2 text-xs font-semibold bg-gray-900 text-white px-2 py-0.5 rounded-full">
                        Sekarang
                      </span>
                    )}
                  </p>
                  <p className={`text-xs mt-0.5 ${done ? 'text-gray-500' : 'text-gray-300'}`}>{desc}</p>
                  <p className={`text-xs mt-1 flex items-center gap-1 font-medium ${done ? 'text-green-600' : 'text-gray-300'}`}>
                    <Clock size={10} /> {time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rating */}
        {showRating && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-xl flex-shrink-0">
                <Star size={16} className="text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-900 mb-1">Bagaimana pengalaman belanjamu?</p>
                <p className="text-xs text-amber-700 mb-3">Beri rating untuk membantu pembeli lain</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setRating(star)}>
                      <Star
                        size={24}
                        fill={star <= rating ? '#f59e0b' : 'none'}
                        className={star <= rating ? 'text-amber-400' : 'text-amber-300'}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-xs text-amber-700 mt-2 font-medium">
                    {rating === 5 ? 'Luar biasa! Terima kasih 🙏' :
                     rating >= 3 ? 'Terima kasih atas penilaianmu!' :
                     'Maaf atas pengalaman yang kurang baik'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <MessageCircle size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              Notifikasi update status pesanan akan dikirim ke <strong>email</strong> kamu.
              Pantau juga di halaman <strong>Pesanan Saya</strong>.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => router.push('/home')}
            className="w-full h-12 bg-gray-900 hover:bg-gray-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <Home size={16} /> Kembali Berbelanja
          </Button>

          {/* ✅ Lacak pesanan sekarang berfungsi dan mengarah ke order yang benar */}
          <Button
            onClick={handleTrackOrder}
            variant="outline"
            className="w-full h-12 rounded-xl font-semibold border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            Lacak Pesanan <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}