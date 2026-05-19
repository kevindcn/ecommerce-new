'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { type Product } from '@/data/products'
import { productAPI } from '@/lib/api'
import Navbar from '@/components/navbar'
import ProductCard from '@/components/ui/productCard'
import { ArrowRight, Zap, Shield, RefreshCw, Search, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import LoginModal from '@/components/LoginModal'

const categories = ['Semua', 'Footwear', 'Apparel', 'Bags', 'Accessories']

export default function HomePage() {
  const searchParams  = useSearchParams()
  const router        = useRouter()
  const { isLoggedIn } = useAuth()

  const [activeCategory, setActiveCategory] = useState('Semua')
  const [allProducts, setAllProducts]       = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  // Query dari URL (?search=...)
  const urlSearch = searchParams.get('search') || ''
  const [searchInput, setSearchInput] = useState(urlSearch)

  // Sync search input saat URL berubah (misal dari navbar)
  useEffect(() => {
    setSearchInput(urlSearch)
  }, [urlSearch])

  // Fetch semua produk dari backend
  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true)
      try {
        const data = await productAPI.getAll()
        setAllProducts(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Gagal memuat produk:', err)
        setAllProducts([])
      } finally {
        setLoadingProducts(false)
      }
    }
    loadProducts()
  }, [])

  // Filter produk berdasarkan kategori + search
  const filteredProducts = useMemo(() => {
    let result = allProducts

    // Filter kategori
    if (activeCategory !== 'Semua') {
      result = result.filter(p => p.category === activeCategory)
    }

    // Filter search
    const q = (urlSearch || searchInput).trim().toLowerCase()
    if (q) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      )
    }

    return result
  }, [allProducts, activeCategory, urlSearch, searchInput])

  const handleClearSearch = () => {
    setSearchInput('')
    router.push('/home')
  }

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat)
    // Reset search saat ganti kategori
    if (urlSearch) router.push('/home')
  }

  const activeQuery = urlSearch || searchInput

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">

        {/* ── HERO ── */}
        {!activeQuery && (
          <section className="relative bg-gray-950 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1 z-10">
                <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">New Collection 2025</p>
                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-5">
                  Tampil <span className="text-blue-500">Beda</span>,<br />Tampil Percaya Diri
                </h1>
                <p className="text-gray-400 text-base mb-8 max-w-md leading-relaxed">
                  Koleksi pakaian dan aksesori premium untuk gaya hidup modern kamu.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 transition-colors"
                  >
                    Belanja Sekarang <ArrowRight size={16} />
                  </button>
                  {!isLoggedIn && (
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className="border-2 border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white font-bold px-6 py-3 rounded-2xl transition-all"
                    >
                      Daftar Gratis
                    </button>
                  )}
                </div>
              </div>

              {/* Trust badges */}
              <div className="flex md:flex-col gap-3 z-10">
                {[
                  { icon: Zap, label: 'Pengiriman Cepat', sub: '1–3 hari kerja' },
                  { icon: Shield, label: 'Produk Asli', sub: 'Garansi resmi' },
                  { icon: RefreshCw, label: 'Retur Mudah', sub: '30 hari gratis' },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                    <Icon size={18} className="text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">{label}</p>
                      <p className="text-xs text-gray-500">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── PRODUCTS SECTION ── */}
        <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Search result header */}
          {activeQuery ? (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Search size={20} className="text-gray-400" />
                <h2 className="text-xl font-bold text-gray-900">
                  Hasil untuk &quot;<span className="text-blue-600">{activeQuery}</span>&quot;
                </h2>
                <button
                  onClick={handleClearSearch}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-full transition-colors ml-auto"
                >
                  <X size={12} /> Hapus pencarian
                </button>
              </div>
              <p className="text-sm text-gray-400 ml-8">
                {loadingProducts ? 'Memuat...' : `${filteredProducts.length} produk ditemukan`}
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Produk Pilihan</h2>
                <p className="text-sm text-gray-400 mt-0.5">Temukan koleksi terbaik kami</p>
              </div>

              {/* Category filter */}
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`text-xs font-bold px-4 py-2 rounded-xl border-2 transition-all ${
                      activeCategory === cat
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading skeleton */}
          {loadingProducts && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-100 rounded-2xl aspect-square mb-3" />
                  <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Product grid */}
          {!loadingProducts && filteredProducts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Tidak ditemukan */}
          {!loadingProducts && filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search size={24} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {activeQuery ? `Tidak ada produk untuk "${activeQuery}"` : 'Belum ada produk'}
              </h3>
              <p className="text-sm text-gray-400 mb-6 max-w-sm">
                {activeQuery
                  ? 'Coba kata kunci lain atau lihat semua produk kami.'
                  : 'Produk akan segera hadir. Pantau terus!'}
              </p>
              {activeQuery && (
                <button
                  onClick={handleClearSearch}
                  className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-bold px-6 py-3 rounded-2xl transition-colors"
                >
                  Lihat Semua Produk
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  )
}