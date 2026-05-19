'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft, ShoppingBag, Zap, Heart, Star,
  Shield, RefreshCw, Truck, Minus, Plus, ChevronRight
} from 'lucide-react'
import { productAPI } from '@/lib/api'
import { type Product, formatPrice } from '@/data/products'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import Navbar from '@/components/navbar'
import LoginModal from '@/components/LoginModal'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

const SIZES_APPAREL = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const SIZES_FOOTWEAR = ['39', '40', '41', '42', '43', '44']
const COLORS = [
  { name: 'Hitam', hex: '#1a1a1a' },
  { name: 'Putih', hex: '#f5f5f5', border: true },
  { name: 'Navy', hex: '#1e3a5f' },
  { name: 'Olive', hex: '#6b7c4a' },
]

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()
  const { isLoggedIn } = useAuth()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [qty, setQty] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [activeImg, setActiveImg] = useState(0)
  const [addingToCart, setAddingToCart] = useState(false)
  const [buyingNow, setBuyingNow] = useState(false)

  const needsVariant = product?.category === 'Apparel' || product?.category === 'Footwear'

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const data = await productAPI.getById(params.id as string)
        setProduct(data)
      } catch (err) {
        console.error('Gagal memuat produk:', err)
        toast.error('Produk tidak ditemukan')
      } finally {
        setLoading(false)
      }
    }
    if (params.id) fetchProduct()
  }, [params.id])

  const discount = product?.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const validateVariant = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return false
    }
    if (needsVariant && !selectedSize) {
      toast.error('Pilih ukuran terlebih dahulu!')
      return false
    }
    return true
  }

  const handleAddToCart = async () => {
    if (!validateVariant() || !product) return
    setAddingToCart(true)
    try {
      await addToCart(product, qty, selectedSize || undefined)
      toast.success('Ditambahkan ke keranjang!', {
        description: `${product.name}${selectedSize ? ` · ${selectedSize}` : ''} · x${qty}`,
      })
    } catch {
      toast.error('Gagal menambahkan ke keranjang')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    if (!validateVariant() || !product) return
    setBuyingNow(true)
    try {
      await addToCart(product, qty, selectedSize || undefined)
      router.push('/cart')
    } catch {
      toast.error('Terjadi kesalahan')
      setBuyingNow(false)
    }
  }

  // Simulasi multiple images dari satu gambar produk
  const images = product ? [product.image, product.image, product.image] : []

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Memuat produk...</p>
          </div>
        </div>
      </>
    )
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="text-gray-500 text-lg">Produk tidak ditemukan</p>
          <Link href="/home" className="text-sm underline text-gray-700">
            Kembali ke beranda
          </Link>
        </div>
      </>
    )
  }

  const sizes = product.category === 'Footwear' ? SIZES_FOOTWEAR : SIZES_APPAREL

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-6 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
            <Link href="/home" className="hover:text-gray-700 transition-colors">Beranda</Link>
            <ChevronRight size={12} />
            <span className="text-gray-400">{product.category}</span>
            <ChevronRight size={12} />
            <span className="text-gray-700 font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

            {/* ── Gambar ── */}
            <div className="flex flex-col gap-3">
              {/* Main image */}
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-50">
                <Image
                  src={images[activeImg]}
                  alt={product.name}
                  fill
                  className="object-cover transition-all duration-500"
                  priority
                />
                {discount > 0 && (
                  <Badge className="absolute top-4 left-4 bg-red-500 text-white hover:bg-red-500 text-xs font-semibold px-2.5 py-1">
                    -{discount}%
                  </Badge>
                )}
                {product.stock <= 10 && product.stock > 0 && (
                  <Badge className="absolute top-4 right-4 bg-orange-500 text-white hover:bg-orange-500 text-xs">
                    Sisa {product.stock}
                  </Badge>
                )}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <span className="text-gray-700 font-bold text-lg">Stok Habis</span>
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      activeImg === i ? 'border-gray-900' : 'border-transparent opacity-60 hover:opacity-80'
                    }`}
                  >
                    <Image src={img} alt={`Foto ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* ── Info & CTA ── */}
            <div className="flex flex-col">

              {/* Header */}
              <div className="mb-6">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-2">
                  {product.category}
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-3">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < Math.floor(product.rating ?? 0) ? '#f59e0b' : 'none'}
                        className={i < Math.floor(product.rating ?? 0) ? 'text-amber-400' : 'text-gray-200'}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
                  <span className="text-sm text-gray-400">({product.reviews} ulasan)</span>
                </div>

                {/* Harga */}
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                  {product.originalPrice && (
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                      <span className="text-xs font-semibold text-red-500">Hemat {formatPrice(product.originalPrice - product.price)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px bg-gray-100 mb-6" />

              {/* Ukuran */}
              {needsVariant && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-bold text-gray-900">
                      Ukuran
                      {selectedSize && <span className="ml-2 font-normal text-gray-500">— {selectedSize}</span>}
                    </p>
                    <button className="text-xs text-gray-400 hover:text-gray-700 underline transition-colors">
                      Panduan ukuran
                    </button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[52px] h-11 px-3 rounded-xl text-sm font-semibold border-2 transition-all ${
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
                    <p className="text-xs text-gray-400 mt-2">* Pilih ukuran sebelum membeli</p>
                  )}
                </div>
              )}

              {/* Warna */}
              <div className="mb-6">
                <p className="text-sm font-bold text-gray-900 mb-3">
                  Warna
                  {selectedColor && <span className="ml-2 font-normal text-gray-500">— {selectedColor}</span>}
                </p>
                <div className="flex gap-2.5">
                  {COLORS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      title={color.name}
                      className={`w-9 h-9 rounded-full transition-all ${
                        selectedColor === color.name
                          ? 'ring-2 ring-gray-900 ring-offset-2 scale-110'
                          : 'hover:scale-105'
                      } ${color.border ? 'border border-gray-200' : ''}`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Jumlah */}
              <div className="mb-8">
                <p className="text-sm font-bold text-gray-900 mb-3">Jumlah</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40"
                      disabled={qty <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-5 py-3 text-sm font-bold border-x-2 border-gray-200 min-w-[56px] text-center">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty(Math.min(product.stock, qty + 1))}
                      className="px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40"
                      disabled={qty >= product.stock}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-sm text-gray-400">
                    {product.stock > 0 ? `${product.stock} tersedia` : 'Stok habis'}
                  </span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0 || buyingNow}
                  className="flex-1 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-300 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 py-4 transition-all active:scale-[0.98]"
                >
                  {buyingNow ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Zap size={16} />
                  )}
                  Beli Sekarang · {formatPrice(product.price * qty)}
                </button>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addingToCart}
                  className="flex-1 sm:flex-none sm:px-6 border-2 border-gray-900 hover:bg-gray-50 disabled:border-gray-200 disabled:text-gray-300 text-gray-900 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 py-4 transition-all active:scale-[0.98]"
                >
                  {addingToCart ? (
                    <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShoppingBag size={16} />
                  )}
                  Keranjang
                </button>

                <button
                  onClick={() => setWishlisted(!wishlisted)}
                  className={`p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${
                    wishlisted
                      ? 'border-red-500 bg-red-500 text-white'
                      : 'border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-700'
                  }`}
                >
                  <Heart size={16} fill={wishlisted ? 'white' : 'none'} />
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Truck, label: 'Gratis Ongkir', sub: 'Min. Rp 150rb' },
                  { icon: RefreshCw, label: 'Retur 7 Hari', sub: 'Tanpa ribet' },
                  { icon: Shield, label: 'Produk Asli', sub: 'Garansi resmi' },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex flex-col items-center text-center p-3 rounded-2xl bg-gray-50 gap-1.5">
                    <Icon size={18} className="text-gray-600" />
                    <p className="text-xs font-semibold text-gray-800">{label}</p>
                    <p className="text-[10px] text-gray-400">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Deskripsi singkat */}
              {product.description && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm font-bold text-gray-900 mb-2">Deskripsi</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Masuk dulu untuk melanjutkan belanja! 🛍️"
      />
    </>
  )
}