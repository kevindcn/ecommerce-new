'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/navbar'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/data/products'
import { paymentAPI } from '@/lib/api'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Lock, ShieldCheck, ChevronRight, Check, Package, Truck } from 'lucide-react'

interface CheckoutData {
  form: {
    name:     string
    phone:    string
    email:    string
    address:  string
    city:     string
    province: string
    zip:      string
    notes:    string
  }
  courier: {
    name:  string
    time:  string
    price: number
  }
  grandTotal: number
}

export default function PaymentPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { items, totalPrice, clearCart } = useCart()
  const [loading, setLoading]           = useState(false)
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)

  // Bisa dipanggil dari /payment?orderId=X (lanjut bayar dari orders page)
  const queryOrderId = searchParams.get('orderId')

  useEffect(() => {
    const saved = sessionStorage.getItem('checkoutData')
    if (saved) {
      try { setCheckoutData(JSON.parse(saved)) } catch {}
    }
  }, [])

  const grandTotal   = checkoutData?.grandTotal ?? (totalPrice + 25000)
  const shippingCost = checkoutData?.courier?.price ?? 25000
  const subtotal     = grandTotal - shippingCost

  const openSnap = (orderId: string, snapToken: string) => {
    ;(window as any).snap.pay(snapToken, {
      onSuccess: (_result: any) => {
        sessionStorage.setItem('latestOrderId', orderId)
        sessionStorage.removeItem('currentOrderId')
        sessionStorage.removeItem('checkoutData')
        clearCart()
        toast.success('Pembayaran berhasil! 🎉')
        router.push('/order-success')
      },
      onPending: (_result: any) => {
        toast.info('Pembayaran pending. Selesaikan di halaman pesanan.')
        router.push(`/orders/${orderId}`)
      },
      onError: (_result: any) => {
        toast.error('Pembayaran gagal, silakan coba lagi')
      },
      onClose: () => {
        // Tetap di halaman ini, tidak redirect
      },
    })
  }

  const handlePay = async () => {
    setLoading(true)
    try {
      const orderId = queryOrderId ?? sessionStorage.getItem('currentOrderId')
      if (!orderId) {
        toast.error('Order tidak ditemukan, silakan checkout ulang')
        router.push('/cart')
        return
      }

      const response  = await paymentAPI.create(Number(orderId), 'midtrans')
      const snapToken = response.snapToken

      if (!snapToken) {
        toast.error('Gagal mendapatkan token pembayaran')
        return
      }

      openSnap(orderId, snapToken)

    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal memproses pembayaran')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white">
            <Lock size={18} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Konfirmasi Pembayaran</h1>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <ShieldCheck size={11} /> Transaksi dilindungi enkripsi SSL 256-bit
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center mb-8">
          {['Keranjang', 'Checkout', 'Pembayaran'].map((step, i) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center gap-2 ${i === 2 ? 'text-gray-900' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < 2 ? 'bg-green-500 text-white' : 'bg-gray-900 text-white'
                }`}>
                  {i < 2 ? <Check size={12} /> : i + 1}
                </div>
                <span className="text-xs font-semibold hidden sm:block">{step}</span>
              </div>
              {i < 2 && <div className="w-8 sm:w-12 h-px mx-1 bg-green-500" />}
            </div>
          ))}
        </div>

        {/* Shipping Info */}
        {checkoutData && (
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Truck size={15} className="text-gray-500" />
              <p className="text-sm font-bold text-gray-900">Info Pengiriman</p>
            </div>
            <p className="text-sm font-semibold text-gray-800">{checkoutData.form.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{checkoutData.form.phone}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {checkoutData.form.address}, {checkoutData.form.city},{' '}
              {checkoutData.form.province} {checkoutData.form.zip}
            </p>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">Kurir</p>
              <p className="text-xs font-semibold text-gray-800">
                {checkoutData.courier.name} · {checkoutData.courier.time}
              </p>
            </div>
          </div>
        )}

        {/* Order Items */}
        {items.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Package size={15} className="text-gray-500" />
              <p className="text-sm font-bold text-gray-900">Item Pesanan</p>
            </div>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-xl object-cover bg-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{item.product.name}</p>
                    {item.size && <p className="text-xs text-gray-400">Size: {item.size}</p>}
                    <p className="text-xs text-gray-400">x{item.quantity}</p>
                  </div>
                  <p className="text-xs font-bold text-gray-900 whitespace-nowrap">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ringkasan Biaya */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <p className="text-sm font-bold text-gray-900 mb-3">Ringkasan Biaya</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-800">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ongkos Kirim</span>
              <span className="text-gray-800">{formatPrice(shippingCost)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-xl text-gray-900">{formatPrice(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Tombol Bayar */}
        <Button
          onClick={handlePay}
          disabled={loading}
          className="w-full h-14 bg-gray-900 hover:bg-gray-700 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Memproses...
            </div>
          ) : (
            <>
              <Lock size={16} />
              Bayar Sekarang · {formatPrice(grandTotal)}
              <ChevronRight size={16} />
            </>
          )}
        </Button>

        {/* Powered by Midtrans */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <ShieldCheck size={13} className="text-gray-400" />
          <p className="text-xs text-gray-400">
            Pembayaran diproses secara aman oleh{' '}
            <span className="font-semibold text-gray-500">Midtrans</span>
          </p>
        </div>

      </div>
    </div>
  )
}