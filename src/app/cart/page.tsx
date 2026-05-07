'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/data/products'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Trash2, ShoppingBag, ArrowRight, Tag, Plus, Minus, ArrowLeft } from 'lucide-react'
import { useState } from 'react'

export default function CartPage() {
  const router = useRouter()
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart()
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponError, setCouponError] = useState('')

  const shipping = totalPrice >= 500000 ? 0 : 25000
  const discount = couponApplied ? Math.round(totalPrice * 0.1) : 0
  const grandTotal = totalPrice + shipping - discount

  const handleApplyCoupon = () => {
    if (coupon.toUpperCase() === 'AUSTIN & CO10') {
      setCouponApplied(true)
      setCouponError('')
    } else {
      setCouponError('Kode promo tidak valid')
      setCouponApplied(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag size={40} className="text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Keranjangmu kosong</h2>
          <p className="text-gray-500 mb-8 text-sm">Yuk, mulai belanja dan temukan produk favoritmu!</p>
          <Button
            onClick={() => router.push('/home')}
            className="bg-gray-900 hover:bg-gray-700 text-white rounded-xl px-8 h-12 font-semibold"
          >
            Mulai Belanja
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/home')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={16} /> Lanjut Belanja
          </button>
          <div className="h-4 w-px bg-gray-300" />
          <h1 className="text-2xl font-bold text-gray-900">
            Keranjang <span className="text-gray-400 font-normal text-lg">({items.length} item)</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(({ product, quantity, size }) => (
              <div key={product.id} className="bg-white rounded-2xl p-5 flex gap-4 shadow-sm">
                {/* Product Image */}
                <Link href={`/product/${product.id}`}>
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
                    <Image src={product.image} alt={product.name} fill className="object-cover hover:scale-105 transition-transform" />
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-xs text-gray-400 font-medium mb-0.5">{product.category}</p>
                      <Link href={`/product/${product.id}`}>
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight hover:text-gray-600 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      {/* Variant info */}
                      <div className="flex gap-2 mt-1">
                        {size && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                            Ukuran: {size}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity Control */}
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="px-4 py-2 text-sm font-bold border-x border-gray-200 min-w-[44px] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatPrice(product.price * quantity)}</p>
                      {quantity > 1 && (
                        <p className="text-xs text-gray-400">{formatPrice(product.price)} / item</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24 space-y-5">
              <h2 className="text-lg font-bold text-gray-900">Ringkasan Pesanan</h2>
              <Separator />

              {/* Coupon */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Tag size={14} /> Kode Promo
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Masukkan kode"
                    value={coupon}
                    onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponError('') }}
                    className="h-10 rounded-xl text-sm border-gray-200"
                    disabled={couponApplied}
                  />
                  <Button
                    onClick={handleApplyCoupon}
                    variant="outline"
                    className="h-10 px-4 rounded-xl text-xs font-semibold flex-shrink-0"
                    disabled={couponApplied || !coupon}
                  >
                    {couponApplied ? '✓' : 'Pakai'}
                  </Button>
                </div>
                {couponApplied && (
                  <p className="text-xs text-green-600 font-medium">✓ Diskon 10% berhasil!</p>
                )}
                {couponError && (
                  <p className="text-xs text-red-500">{couponError}</p>
                )}
                {!couponApplied && !couponError && (
                  <p className="text-xs text-gray-400">Coba: AUSTIN & CO10</p>
                )}
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} item)</span>
                  <span className="font-semibold">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ongkos Kirim</span>
                  <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : ''}`}>
                    {shipping === 0 ? 'GRATIS' : formatPrice(shipping)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Diskon Promo</span>
                    <span className="font-semibold">-{formatPrice(discount)}</span>
                  </div>
                )}
              </div>

              {totalPrice < 500000 && (
                <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700 font-medium">
                  🚚 Tambah {formatPrice(500000 - totalPrice)} lagi untuk gratis ongkir!
                </div>
              )}

              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900 text-base">Total</span>
                <span className="text-2xl font-bold text-gray-900">{formatPrice(grandTotal)}</span>
              </div>

              <Button
                onClick={() => router.push('/checkout')}
                className="w-full h-12 bg-gray-900 hover:bg-gray-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                Checkout <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}