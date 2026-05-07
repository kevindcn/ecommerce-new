'use client'

import Link from 'next/link'
import { ShoppingBag, Search, User, Menu, Package } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { Separator } from '@/components/ui/separator'

export default function Navbar() {
  const { totalItems } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/home" className="font-bold text-2xl tracking-tighter text-gray-900">
            AUSTIN & CO
          </Link>

          {/* Nav Links Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {['New In', 'Men', 'Women', 'Accessories', 'Sale'].map((item) => (
              <Link
                key={item}
                href="/home"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="text-gray-600 hover:text-gray-900 transition-colors hidden md:block">
              <Search size={20} />
            </button>

            {/* ✅ Link Pesanan Saya */}
            <Link
              href="/orders"
              className="text-gray-600 hover:text-gray-900 transition-colors hidden md:flex items-center gap-1.5 text-sm font-semibold"
            >
              <Package size={20} />
              <span className="hidden lg:block">Pesanan</span>
            </Link>

            <Link
              href="/home"
              className="text-gray-600 hover:text-gray-900 transition-colors hidden md:block"
            >
              <User size={20} />
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative text-gray-600 hover:text-gray-900 transition-colors">
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gray-900 text-white rounded-full">
                  {totalItems}
                </Badge>
              )}
            </Link>

            <button
              className="md:hidden text-gray-600"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-1">
            {['New In', 'Men', 'Women', 'Accessories', 'Sale'].map((item) => (
              <Link
                key={item}
                href="/home"
                className="block py-2.5 px-2 text-sm text-gray-700 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-50"
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
            <Separator />
            {/* ✅ Mobile: link pesanan */}
            <Link
              href="/orders"
              className="flex items-center gap-2 py-2.5 px-2 text-sm text-gray-700 hover:text-gray-900 font-semibold rounded-lg hover:bg-gray-50"
              onClick={() => setMenuOpen(false)}
            >
              <Package size={16} /> Pesanan Saya
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}