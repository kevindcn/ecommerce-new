'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/data/products'
import { createNewOrder, OrderItem } from '@/data/orders' // ← pastikan ada
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  CreditCard, Smartphone, Building2, Wallet,
  Lock, Check, ChevronRight, Copy
} from 'lucide-react'

const PAYMENT_METHODS = [
  {
    id: 'transfer',
    icon: Building2,
    label: 'Transfer Bank',
    sub: 'BCA, Mandiri, BNI, BRI',
    banks: [
      { bank: 'BCA',     no: '1234567890', name: 'PT AUSTIN & CO Fashion' },
      { bank: 'Mandiri', no: '0987654321', name: 'PT AUSTIN & CO Fashion' },
      { bank: 'BNI',     no: '1122334455', name: 'PT AUSTIN & CO Fashion' },
    ],
  },
  {
    id: 'ewallet',
    icon: Smartphone,
    label: 'E-Wallet',
    sub: 'GoPay, OVO, DANA, ShopeePay',
    wallets: [
      { name: 'GoPay', no: '0812-3456-7890' },
      { name: 'OVO',   no: '0812-3456-7890' },
      { name: 'DANA',  no: '0812-3456-7890' },
    ],
  },
  {
    id: 'card',
    icon: CreditCard,
    label: 'Kartu Kredit / Debit',
    sub: 'Visa, Mastercard, JCB',
  },
  {
    id: 'cod',
    icon: Wallet,
    label: 'Bayar di Tempat (COD)',
    sub: 'Bayar tunai saat barang tiba',
  },
]

// Label metode pembayaran
const METHOD_LABELS: Record<string, string> = {
  transfer: 'Transfer Bank',
  ewallet:  'E-Wallet',
  card:     'Kartu Kredit',
  cod:      'COD',
}

// ✅ Type checkoutData yang lengkap — sebelumnya terlalu sempit
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
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart() // ← tambah items
  const [method, setMethod]   = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied]   = useState('')
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [cardForm, setCardForm] = useState({
    number: '', name: '', expiry: '', cvv: ''
  })

  useEffect(() => {
    const saved = sessionStorage.getItem('checkoutData')
    if (saved) {
      try {
        setCheckoutData(JSON.parse(saved))
      } catch {
        console.error('Gagal parse checkoutData')
      }
    }
  }, [])

  const grandTotal = checkoutData?.grandTotal ?? (totalPrice + 25000)

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(''), 2000)
  }

  // ✅ handlePay yang benar — createNewOrder dipanggil di sini
  const handlePay = async () => {
    if (!method) return
    setLoading(true)

    // Simulasi proses pembayaran
    await new Promise((r) => setTimeout(r, 2000))

    // ✅ Konversi cart items → OrderItem
    const orderItems: OrderItem[] = items.map((i) => ({
      id:       String(i.product.id),
      name:     i.product.name,
      image:    i.product.image,
      price:    i.product.price,
      quantity: i.quantity,
      size:     i.size,
      color:    undefined,
    }))

    // ✅ Buat order baru — otomatis tersimpan ke localStorage
    const newOrder = createNewOrder({
      items:            orderItems,
      totalAmount:      grandTotal,
      shippingCost:     checkoutData?.courier?.price    ?? 25000,
      courier:          checkoutData?.courier?.name     ?? 'JNE Reguler',
      shippingAddress:  checkoutData?.form?.address     ?? '-',
      shippingCity:     checkoutData?.form?.city        ?? '-',
      shippingProvince: checkoutData?.form?.province    ?? '-',
      phone:            checkoutData?.form?.phone       ?? '-',
      paymentMethod:    METHOD_LABELS[method]           ?? method,
    })

    // ✅ Simpan id & nomor order untuk ditampilkan di halaman sukses
    sessionStorage.setItem('latestOrderId',     newOrder.id)
    sessionStorage.setItem('latestOrderNumber', newOrder.orderNumber)

    // Bersihkan cart & checkout data
    clearCart()
    sessionStorage.removeItem('checkoutData')

    setLoading(false)
    router.push('/order-success')
  }

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === method)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center text-white">
            <Lock size={16} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pembayaran</h1>
            <p className="text-xs text-gray-400">Transaksi dilindungi enkripsi SSL 256-bit</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-0 mb-6 max-w-sm">
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
              {i < 2 && (
                <div className={`w-8 sm:w-12 h-px mx-1 ${i < 2 ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Total Card */}
        <div className="bg-gray-900 text-white rounded-2xl p-5 mb-5">
          <p className="text-sm text-gray-400 mb-1">Total Pembayaran</p>
          <p className="text-3xl font-bold">{formatPrice(grandTotal)}</p>
          <p className="text-xs text-gray-500 mt-1">Termasuk ongkos kirim</p>
        </div>

        {/* Pilih Metode */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <h2 className="font-bold text-gray-900 mb-4">Pilih Metode Pembayaran</h2>
          <div className="space-y-2">
            {PAYMENT_METHODS.map(({ id, icon: Icon, label, sub }) => (
              <button
                key={id}
                onClick={() => setMethod(id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                  method === id
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                  method === id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  method === id ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
                }`}>
                  {method === id && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Transfer Bank Detail */}
        {method === 'transfer' && selectedMethod && 'banks' in selectedMethod && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-4 space-y-3">
            <p className="font-bold text-blue-900 text-sm">Rekening Tujuan Transfer</p>
            {(selectedMethod.banks as { bank: string; no: string; name: string }[]).map((b) => (
              <div key={b.bank} className="bg-white rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500">Bank {b.bank}</p>
                  <p className="text-lg font-bold text-gray-900 font-mono tracking-wide">{b.no}</p>
                  <p className="text-xs text-gray-400">a.n. {b.name}</p>
                </div>
                <button
                  onClick={() => handleCopy(b.no, b.bank)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  {copied === b.bank
                    ? <><Check size={13} /> Disalin</>
                    : <><Copy size={13} /> Salin</>
                  }
                </button>
              </div>
            ))}
            <p className="text-xs text-blue-600">
              Transfer tepat sesuai nominal. Konfirmasi dalam 1x24 jam.
            </p>
          </div>
        )}

        {/* E-Wallet Detail */}
        {method === 'ewallet' && selectedMethod && 'wallets' in selectedMethod && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-5 mb-4 space-y-3">
            <p className="font-bold text-green-900 text-sm">Nomor Tujuan E-Wallet</p>
            {(selectedMethod.wallets as { name: string; no: string }[]).map((w) => (
              <div key={w.name} className="bg-white rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500">{w.name}</p>
                  <p className="text-lg font-bold text-gray-900 font-mono">{w.no}</p>
                </div>
                <button
                  onClick={() => handleCopy(w.no, w.name)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:text-green-800"
                >
                  {copied === w.name
                    ? <><Check size={13} /> Disalin</>
                    : <><Copy size={13} /> Salin</>
                  }
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Kartu Kredit Detail */}
        {method === 'card' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard size={16} /> Detail Kartu
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600">Nomor Kartu</Label>
                <Input
                  placeholder="0000 0000 0000 0000"
                  value={cardForm.number}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 16)
                    setCardForm({ ...cardForm, number: val.replace(/(\d{4})/g, '$1 ').trim() })
                  }}
                  className="h-11 rounded-xl border-gray-200 font-mono text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600">Nama Pemegang Kartu</Label>
                <Input
                  placeholder="Nama sesuai kartu"
                  value={cardForm.name}
                  onChange={(e) => setCardForm({ ...cardForm, name: e.target.value.toUpperCase() })}
                  className="h-11 rounded-xl border-gray-200 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600">Berlaku s/d</Label>
                  <Input
                    placeholder="MM/YY"
                    value={cardForm.expiry}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, '').slice(0, 4)
                      if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2)
                      setCardForm({ ...cardForm, expiry: v })
                    }}
                    className="h-11 rounded-xl border-gray-200 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600">CVV</Label>
                  <Input
                    type="password"
                    placeholder="•••"
                    maxLength={3}
                    value={cardForm.cvv}
                    onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '') })}
                    className="h-11 rounded-xl border-gray-200 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COD Detail */}
        {method === 'cod' && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-4">
            <p className="font-bold text-amber-900 text-sm mb-1">Bayar di Tempat (COD)</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              Siapkan uang tunai sebesar <strong>{formatPrice(grandTotal)}</strong> saat kurir tiba.
              Pastikan kamu berada di lokasi pengiriman.
            </p>
          </div>
        )}

        <Separator className="my-5" />

        <div className="flex justify-between items-center mb-5">
          <p className="text-sm text-gray-600">Total Pembayaran</p>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(grandTotal)}</p>
        </div>

        <Button
          onClick={handlePay}
          disabled={!method || loading}
          className="w-full h-14 bg-gray-900 hover:bg-gray-700 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Memproses Pembayaran...
            </div>
          ) : (
            <>
              <Lock size={18} />
              {method ? `Bayar ${formatPrice(grandTotal)}` : 'Pilih Metode Pembayaran'}
              {method && <ChevronRight size={18} />}
            </>
          )}
        </Button>

        <p className="text-xs text-center text-gray-400 mt-3">
          Dengan melanjutkan, kamu menyetujui Syarat & Ketentuan AUSTIN & CO
        </p>
      </div>
    </div>
  )
}