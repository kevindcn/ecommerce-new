'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Navbar from '@/components/navbar'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/data/products'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { MapPin, User, Package, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { orderAPI } from '@/lib/api'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

const COURIERS = [
  { name: 'JNE Reguler', time: '2-3 hari', price: 25000 },
  { name: 'JNE YES', time: '1-2 hari', price: 45000 },
  { name: 'SiCepat BEST', time: '2-3 hari', price: 22000 },
  { name: 'AnterAja', time: '3-5 hari', price: 18000 },
]

export default function CheckoutPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { isLoggedIn } = useAuth()
  const { items, totalPrice } = useCart()
  const [courier, setCourier] = useState(COURIERS[0])
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    address: '', city: '', province: '', zip: '', notes: '',
  })

  const grandTotal = totalPrice + courier.price

  if (items.length === 0) {
    router.push('/cart')
    return null
  }

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    const orderItems = items.map((item) => ({
      productId: Number(item.product.id),
      quantity: item.quantity,
      size: item.size,
    }))

    const order = await orderAPI.create({
      items: orderItems,
      shippingAddress: form.address,
      shippingCity: form.city,
      shippingProvince: form.province,
      shippingZip: form.zip,
      phone: form.phone,
      notes: form.notes,
      courier: courier.name,
    })

    // Simpan order id untuk halaman payment
    sessionStorage.setItem('currentOrderId', String(order.id))
    sessionStorage.setItem('currentOrderTotal', String(grandTotal))

    toast.success('Pesanan berhasil dibuat!')
    router.push('/payment')

  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : 'Gagal membuat pesanan')
  } finally {
    setLoading(false)
  }
}

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/cart')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={16} /> Kembali ke Keranjang
          </button>
          <div className="h-4 w-px bg-gray-300" />
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-0 mb-8 max-w-sm">
          {['Keranjang', 'Checkout', 'Pembayaran'].map((step, i) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center gap-2 ${i === 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < 1 ? 'bg-green-500 text-white' : i === 1 ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {i < 1 ? <Check size={12} /> : i + 1}
                </div>
                <span className="text-xs font-semibold hidden sm:block">{step}</span>
              </div>
              {i < 2 && <div className={`w-8 sm:w-12 h-px mx-1 ${i < 1 ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Left */}
            <div className="lg:col-span-2 space-y-5">
              {/* Data Penerima */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center text-white">
                    <User size={15} />
                  </div>
                  <h2 className="font-bold text-gray-900">Data Penerima</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-600">Nama Lengkap *</Label>
                    <Input placeholder="Nama penerima" value={form.name} onChange={set('name')}
                      className="h-11 rounded-xl border-gray-200 text-sm" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-600">No. HP *</Label>
                    <Input placeholder="08xx-xxxx-xxxx" value={form.phone} onChange={set('phone')}
                      className="h-11 rounded-xl border-gray-200 text-sm" required />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-600">Email *</Label>
                    <Input type="email" placeholder="email@contoh.com" value={form.email} onChange={set('email')}
                      className="h-11 rounded-xl border-gray-200 text-sm" required />
                  </div>
                </div>
              </div>

              {/* Alamat */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center text-white">
                    <MapPin size={15} />
                  </div>
                  <h2 className="font-bold text-gray-900">Alamat Pengiriman</h2>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-600">Alamat Lengkap *</Label>
                    <Input placeholder="Jl. Nama Jalan No. XX, RT/RW, Kelurahan" value={form.address} onChange={set('address')}
                      className="h-11 rounded-xl border-gray-200 text-sm" required />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-600">Kota *</Label>
                      <Input placeholder="Bandung" value={form.city} onChange={set('city')}
                        className="h-11 rounded-xl border-gray-200 text-sm" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-600">Provinsi *</Label>
                      <Input placeholder="Jawa Barat" value={form.province} onChange={set('province')}
                        className="h-11 rounded-xl border-gray-200 text-sm" required />
                    </div>
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <Label className="text-xs font-semibold text-gray-600">Kode Pos *</Label>
                      <Input placeholder="40111" value={form.zip} onChange={set('zip')}
                        className="h-11 rounded-xl border-gray-200 text-sm" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-600">Catatan untuk Kurir (opsional)</Label>
                    <Input placeholder="Contoh: Tolong jangan dititip, hubungi dulu" value={form.notes} onChange={set('notes')}
                      className="h-11 rounded-xl border-gray-200 text-sm" />
                  </div>
                </div>
              </div>

              {/* Pilih Kurir */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center text-white">
                    <Package size={15} />
                  </div>
                  <h2 className="font-bold text-gray-900">Pilih Kurir</h2>
                </div>
                <div className="space-y-2">
                  {COURIERS.map((opt) => (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => setCourier(opt)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                        courier.name === opt.name
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          courier.name === opt.name ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
                        }`}>
                          {courier.name === opt.name && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{opt.name}</p>
                          <p className="text-xs text-gray-400">Estimasi {opt.time}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{formatPrice(opt.price)}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary Right */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                <h2 className="font-bold text-gray-900 mb-4">Detail Pesanan</h2>

                {/* Items */}
                <div className="space-y-3 mb-4 max-h-52 overflow-y-auto">
                  {items.map(({ product, quantity, size }) => (
                    <div key={product.id} className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-400">
                          x{quantity}{size ? ` · ${size}` : ''}
                        </p>
                      </div>
                      <p className="text-xs font-bold text-gray-900 flex-shrink-0">
                        {formatPrice(product.price * quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2.5 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-semibold">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ongkir ({courier.name})</span>
                    <span className="font-semibold">{formatPrice(courier.price)}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center mb-5">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">{formatPrice(grandTotal)}</span>
                </div>

               <Button
                   type="submit"
                   disabled={loading}
                   className="w-full h-12 bg-gray-900 hover:bg-gray-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
>
                  {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                         ) : (
                  <>Lanjut ke Pembayaran <ArrowRight size={16} /></>
                         )}
               </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}