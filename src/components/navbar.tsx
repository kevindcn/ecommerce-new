'use client'

import Link from 'next/link'
import {
  ShoppingBag, Search, User, Menu, Package,
  X, LogOut, ChevronDown, Clock, TrendingUp
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import LoginModal from '@/components/LoginModal'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { productAPI } from '@/lib/api'
import { type Product, formatPrice } from '@/data/products'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const POPULAR_SEARCHES = ['Sneakers', 'Hoodie', 'Tas Kulit', 'Kaos Polos', 'Jaket']
const HISTORY_KEY = 'austin_search_history'

export default function Navbar() {
  const { totalItems }               = useCart()
  const { isLoggedIn, user, logout } = useAuth()
  const router = useRouter()

  const [menuOpen, setMenuOpen]           = useState(false)
  const [searchOpen, setSearchOpen]       = useState(false)
  const [searchVal, setSearchVal]         = useState('')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showUserMenu, setShowUserMenu]   = useState(false)

  // Search state
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showDropdown, setShowDropdown]   = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  const searchRef    = useRef<HTMLDivElement>(null)
  const inputRef     = useRef<HTMLInputElement>(null)
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load history dari localStorage
  useEffect(() => {
    try {
      const h = localStorage.getItem(HISTORY_KEY)
      if (h) setSearchHistory(JSON.parse(h))
    } catch {}
  }, [])

  const saveHistory = (query: string) => {
    const trimmed = query.trim()
    if (!trimmed) return
    const next = [trimmed, ...searchHistory.filter(h => h !== trimmed)].slice(0, 5)
    setSearchHistory(next)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
  }

  const clearHistory = () => {
    setSearchHistory([])
    localStorage.removeItem(HISTORY_KEY)
  }

  // Tutup dropdown saat klik luar
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Debounced search ke API
  const doSearch = useCallback(async (q: string) => {
    const query = q.trim()
    if (!query) {
      setSearchResults([])
      setSearchLoading(false)
      return
    }
    setSearchLoading(true)
    try {
      const data = await productAPI.getAll()
      const filtered: Product[] = data.filter((p: Product) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category?.toLowerCase().includes(query.toLowerCase())
      )
      setSearchResults(filtered.slice(0, 5))
    } catch {
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }, [])

  const handleSearchChange = (val: string) => {
    setSearchVal(val)
    setShowDropdown(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(val), 350)
  }

  const handleSearchSubmit = (query: string) => {
    const q = query.trim()
    if (!q) return
    saveHistory(q)
    setShowDropdown(false)
    setSearchOpen(false)
    router.push(`/home?search=${encodeURIComponent(q)}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearchSubmit(searchVal)
    if (e.key === 'Escape') { setShowDropdown(false); setSearchOpen(false) }
  }

  const handleSelectSuggestion = (name: string) => {
    setSearchVal(name)
    handleSearchSubmit(name)
  }

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    setMenuOpen(false)
    toast.success('Berhasil keluar. Sampai jumpa! 👋')
  }

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  const showEmptyState = searchVal.trim() === ''
  const showNoResult   = searchVal.trim() !== '' && !searchLoading && searchResults.length === 0

  // Shared search dropdown content
  const SearchDropdown = () => (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Loading */}
      {searchLoading && (
        <div className="flex items-center gap-3 px-4 py-3 text-sm text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          Mencari produk...
        </div>
      )}

      {/* Hasil pencarian */}
      {!searchLoading && searchResults.length > 0 && (
        <div>
          <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Hasil Pencarian
          </p>
          {searchResults.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              onClick={() => { saveHistory(searchVal); setShowDropdown(false); setSearchOpen(false) }}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                <Image src={product.image} alt={product.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                <p className="text-xs text-gray-400">{product.category}</p>
              </div>
              <p className="text-sm font-bold text-gray-900 flex-shrink-0">{formatPrice(product.price)}</p>
            </Link>
          ))}
          <button
            onClick={() => handleSearchSubmit(searchVal)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors border-t border-gray-100"
          >
            <Search size={14} />
            Lihat semua hasil untuk &quot;{searchVal}&quot;
          </button>
        </div>
      )}

      {/* Tidak ditemukan */}
      {showNoResult && (
        <div className="px-4 py-4 text-center">
          <p className="text-sm font-semibold text-gray-700 mb-1">Produk tidak ditemukan</p>
          <p className="text-xs text-gray-400">Coba kata kunci lain</p>
        </div>
      )}

      {/* Empty state: history + popular */}
      {showEmptyState && (
        <div className="py-2">
          {searchHistory.length > 0 && (
            <>
              <div className="flex items-center justify-between px-4 pt-2 pb-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Pencarian Terakhir</p>
                <button onClick={clearHistory} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Hapus</button>
              </div>
              {searchHistory.map((h) => (
                <button
                  key={h}
                  onClick={() => handleSelectSuggestion(h)}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                >
                  <Clock size={13} className="text-gray-300 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{h}</span>
                </button>
              ))}
              <Separator className="my-2" />
            </>
          )}
          <div className="flex items-center gap-2 px-4 pt-1 pb-1">
            <TrendingUp size={13} className="text-gray-300" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Populer</p>
          </div>
          <div className="flex flex-wrap gap-2 px-4 py-2">
            {POPULAR_SEARCHES.map((s) => (
              <button
                key={s}
                onClick={() => handleSelectSuggestion(s)}
                className="text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      <header className="sticky top-0 z-50">

        {/* TOP BAR */}
        <div className="bg-gray-900 text-white py-1.5 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-6 text-xs text-gray-400">
              <span>🚚 Gratis ongkir min. Rp500.000</span>
              <span>|</span>
              <span>↩️ Return 30 hari</span>
              <span>|</span>
              <span>✅ 100% Original</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>Kode promo: <strong className="text-yellow-400">URBANE10</strong></span>
            </div>
          </div>
        </div>

        {/* MAIN NAV */}
        <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 gap-4">

              {/* Logo */}
              <Link
                href="/home"
                className="font-black text-xl tracking-tighter text-gray-900 flex-shrink-0 hover:opacity-80 transition-opacity"
              >
                AUSTIN <span className="text-blue-600">&</span> CO
              </Link>

              {/* Nav Links Desktop */}
              <div className="hidden md:flex items-center gap-1">
                {['New In', 'Men', 'Women', 'Accessories', 'Sale'].map((item) => (
                  <Link
                    key={item}
                    href="/home"
                    className={`text-sm font-semibold px-3 py-2 rounded-xl transition-all hover:bg-gray-100 hover:text-gray-900 text-gray-600 ${
                      item === 'Sale' ? 'text-red-500 hover:text-red-600 hover:bg-red-50' : ''
                    }`}
                  >
                    {item}
                  </Link>
                ))}
              </div>

              {/* Search Bar Desktop */}
              <div className="hidden md:flex flex-1 max-w-sm relative" ref={searchRef}>
                <div className={`w-full flex items-center bg-gray-50 border-2 rounded-2xl overflow-visible transition-all ${
                  showDropdown ? 'border-blue-500 bg-white shadow-sm' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <Search size={15} className="ml-3 text-gray-400 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchVal}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Cari produk..."
                    className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none text-gray-700 placeholder-gray-400"
                  />
                  {searchVal && (
                    <button
                      onClick={() => { setSearchVal(''); setSearchResults([]); inputRef.current?.focus() }}
                      className="px-2 text-gray-300 hover:text-gray-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => handleSearchSubmit(searchVal)}
                    className="mx-1 px-3 py-1.5 bg-gray-900 hover:bg-gray-700 text-white text-xs font-bold rounded-xl transition-colors flex-shrink-0"
                  >
                    Cari
                  </button>
                </div>

                {/* Dropdown desktop */}
                {showDropdown && <SearchDropdown />}
              </div>

              {/* ACTIONS */}
              <div className="flex items-center gap-1 flex-shrink-0">

                {/* Search Mobile toggle */}
                <button
                  className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                  onClick={() => { setSearchOpen(!searchOpen); setShowDropdown(!searchOpen) }}
                >
                  <Search size={18} />
                </button>

                {/* Pesanan */}
                {isLoggedIn && (
                  <Link
                    href="/orders"
                    className="hidden md:flex w-10 h-10 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all"
                  >
                    <Package size={20} />
                  </Link>
                )}

                {/* Cart */}
                <Link
                  href="/cart"
                  className="relative w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all"
                >
                  <ShoppingBag size={20} />
                  {totalItems > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs bg-red-500 text-white rounded-full border-2 border-white">
                      {totalItems > 9 ? '9+' : totalItems}
                    </Badge>
                  )}
                </Link>

                {/* USER AREA */}
                {isLoggedIn ? (
                  <div className="hidden md:block relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {user?.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white text-xs font-black">{initials}</span>
                        )}
                      </div>
                      <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showUserMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                        <div className="absolute right-0 top-12 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 overflow-hidden animate-in zoom-in-95 slide-in-from-top-2 duration-150">
                          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-sm font-black">{initials}</span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                              </div>
                            </div>
                          </div>
                          <div className="py-1.5">
                            <Link href="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                              <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center"><User size={13} className="text-gray-500" /></div>
                              Profil Saya
                            </Link>
                            <Link href="/orders" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center"><Package size={13} className="text-blue-500" /></div>
                              Pesanan Saya
                            </Link>
                          </div>
                          <Separator />
                          <div className="py-1.5">
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                              <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center"><LogOut size={13} className="text-red-500" /></div>
                              Keluar
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="hidden md:flex items-center gap-2 ml-1">
                    <button onClick={() => setShowLoginModal(true)} className="border-2 border-gray-900 text-gray-900 font-bold text-sm px-4 py-1.5 rounded-xl hover:bg-gray-900 hover:text-white transition-all">Masuk</button>
                    <button onClick={() => setShowLoginModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-1.5 rounded-xl transition-colors">Daftar</button>
                  </div>
                )}

                {/* Mobile Menu Toggle */}
                <button className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
                  {menuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              </div>
            </div>

            {/* Search Mobile expandable */}
            {searchOpen && (
              <div className="md:hidden pb-3 animate-in slide-in-from-top-2 duration-200">
                <div className="relative" ref={searchRef}>
                  <div className={`flex items-center border-2 rounded-2xl overflow-hidden transition-all ${showDropdown ? 'border-blue-500 bg-white' : 'bg-gray-50 border-gray-200'}`}>
                    <Search size={15} className="ml-3 text-gray-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={searchVal}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onFocus={() => setShowDropdown(true)}
                      onKeyDown={handleKeyDown}
                      placeholder="Cari produk, brand, kategori..."
                      autoFocus
                      className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none text-gray-700 placeholder-gray-400"
                    />
                    {searchVal ? (
                      <button onClick={() => { setSearchVal(''); setSearchResults([]) }} className="px-2 text-gray-300 hover:text-gray-500">
                        <X size={14} />
                      </button>
                    ) : (
                      <button onClick={() => { setSearchOpen(false); setShowDropdown(false) }} className="px-3 py-2.5 text-gray-400 hover:text-gray-700">
                        <X size={15} />
                      </button>
                    )}
                  </div>
                  {showDropdown && <SearchDropdown />}
                </div>
              </div>
            )}

            {/* MOBILE MENU */}
            {menuOpen && (
              <div className="md:hidden py-3 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                <div className="space-y-0.5 mb-2">
                  {['New In', 'Men', 'Women', 'Accessories'].map((item) => (
                    <Link key={item} href="/home" onClick={() => setMenuOpen(false)} className="flex items-center py-2.5 px-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">{item}</Link>
                  ))}
                  <Link href="/home" onClick={() => setMenuOpen(false)} className="flex items-center py-2.5 px-3 text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">Sale 🔥</Link>
                </div>

                <Separator className="my-2" />

                {isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-3 bg-gray-50 rounded-xl mb-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-black">{initials}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                    <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-2.5 px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center"><User size={14} className="text-gray-500" /></div>
                      Profil Saya
                    </Link>
                    <Link href="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-2.5 px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center"><Package size={14} className="text-blue-500" /></div>
                      Pesanan Saya
                    </Link>
                    <Link href="/cart" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-2.5 px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center relative">
                        <ShoppingBag size={14} className="text-gray-600" />
                        {totalItems > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{totalItems}</span>}
                      </div>
                      Keranjang
                      {totalItems > 0 && <span className="ml-auto bg-red-50 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{totalItems} item</span>}
                    </Link>
                    <Separator className="my-2" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 py-2.5 px-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                      <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center"><LogOut size={14} className="text-red-500" /></div>
                      Keluar
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/cart" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-2.5 px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors mb-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center relative">
                        <ShoppingBag size={14} className="text-gray-600" />
                        {totalItems > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{totalItems}</span>}
                      </div>
                      Keranjang
                      {totalItems > 0 && <span className="ml-auto bg-red-50 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{totalItems} item</span>}
                    </Link>
                    <div className="flex gap-2 px-1">
                      <button onClick={() => { setShowLoginModal(true); setMenuOpen(false) }} className="flex-1 border-2 border-gray-900 text-gray-900 font-bold text-sm py-2.5 rounded-xl hover:bg-gray-900 hover:text-white transition-all">Masuk</button>
                      <button onClick={() => { setShowLoginModal(true); setMenuOpen(false) }} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 rounded-xl transition-colors">Daftar</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </header>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  )
}