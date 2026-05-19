'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag, Star, X, Plus, Minus } from 'lucide-react'
import { Product, formatPrice } from '@/data/products'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import LoginModal from '@/components/LoginModal'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useState } from 'react'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const COLORS = [
  { name: 'Hitam', hex: '#1a1a1a' },
  { name: 'Putih', hex: '#f5f5f5' },
  { name: 'Navy', hex: '#1e3a5f' },
  { name: 'Olive', hex: '#6b7c4a' },
]

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const { isLoggedIn } = useAuth()

  const [wishlisted, setWishlisted] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [qty, setQty] = useState(1)

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const needsVariant = product.category === 'Apparel' || product.category === 'Footwear'

  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return
    }
    if (needsVariant) {
      setShowModal(true)
    } else {
      addToCart(product, 1)
      toast.success('Ditambahkan ke keranjang!', {
        description: product.name,
      })
    }
  }

  const handleConfirmAdd = () => {
    if (!isLoggedIn) {
      setShowModal(false)
      setShowLoginModal(true)
      return
    }
    if (needsVariant && !selectedSize) {
      toast.error('Pilih ukuran dulu!', {
        description: 'Ukuran wajib dipilih sebelum menambahkan ke keranjang.',
      })
      return
    }
    addToCart(product, qty, selectedSize || undefined)
    toast.success('Berhasil ditambahkan!', {
      description: `${product.name}${selectedSize ? ` · ${selectedSize}` : ''}${selectedColor ? ` · ${selectedColor}` : ''} · x${qty}`,
    })
    setShowModal(false)
    setSelectedSize('')
    setSelectedColor('')
    setQty(1)
  }

  return (
    <>
      {/* ✅ Link diubah ke /products/[id] agar konsisten dengan halaman detail */}
      <Link href={`/products/${product.id}`} className="group block">
        <div className="relative overflow-hidden rounded-2xl bg-gray-50 aspect-square mb-3">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {discount > 0 && (
            <Badge className="absolute top-3 left-3 bg-red-500 text-white hover:bg-red-500 text-xs font-semibold">
              -{discount}%
            </Badge>
          )}
          {product.stock <= 10 && (
            <Badge className="absolute top-3 right-3 bg-orange-500 text-white hover:bg-orange-500 text-xs">
              Sisa {product.stock}
            </Badge>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />

          {/* Hover Actions */}
          <div className="absolute bottom-3 left-3 right-3 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={handleAddClick}
              className="flex-1 bg-gray-900 text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors"
            >
              <ShoppingBag size={14} />
              {needsVariant ? 'Pilih Varian' : 'Add to Cart'}
            </button>
            <button
              onClick={(e) => { e.preventDefault(); setWishlisted(!wishlisted) }}
              className={`p-2.5 rounded-xl transition-colors ${
                wishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Heart size={14} fill={wishlisted ? 'white' : 'none'} />
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{product.category}</p>
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-gray-600 transition-colors leading-tight">
            {product.name}
          </h3>
          <div className="flex items-center gap-1">
            <Star size={11} fill="#f59e0b" className="text-amber-400" />
            <span className="text-xs text-gray-500">{product.rating} ({product.reviews})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Variant Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl z-10 animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                <Image src={product.image} alt={product.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{product.category}</p>
                <h3 className="font-bold text-gray-900 leading-tight">{product.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-gray-900">{formatPrice(product.price)}</span>
                  {product.originalPrice && (
                    <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Size */}
            {needsVariant && (
              <div className="mb-5">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-bold text-gray-900">Ukuran</p>
                  <button className="text-xs text-gray-400 hover:text-gray-700 underline">
                    Panduan Ukuran
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(product.category === 'Footwear'
                    ? ['39', '40', '41', '42', '43', '44']
                    : SIZES
                  ).map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[48px] h-11 px-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                        selectedSize === size
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {!selectedSize && (
                  <p className="text-xs text-gray-400 mt-2">* Wajib pilih ukuran</p>
                )}
              </div>
            )}

            {/* Color */}
            <div className="mb-5">
              <p className="text-sm font-bold text-gray-900 mb-3">
                Warna{' '}
                {selectedColor && (
                  <span className="font-normal text-gray-500">— {selectedColor}</span>
                )}
              </p>
              <div className="flex gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    title={color.name}
                    className={`w-9 h-9 rounded-full transition-all border-2 ${
                      selectedColor === color.name
                        ? 'border-gray-900 scale-110 shadow-md'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-sm font-bold text-gray-900 mb-3">Jumlah</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-5 py-2.5 text-sm font-bold border-x-2 border-gray-200 min-w-[52px] text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="text-sm text-gray-400">Stok: {product.stock}</span>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleConfirmAdd}
              className="w-full bg-gray-900 hover:bg-gray-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-colors py-4"
            >
              <ShoppingBag size={18} />
              Tambah ke Keranjang · {formatPrice(product.price * qty)}
            </button>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Masuk dulu untuk menambahkan produk ke keranjang! 🛍️"
      />
    </>
  )
}