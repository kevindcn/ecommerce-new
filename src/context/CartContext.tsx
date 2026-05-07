'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Product } from '@/data/products'

export interface CartItem {
  product: Product
  quantity: number
  size?: string
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number, size?: string) => void
  removeFromCart: (productId: string | number) => void
  updateQuantity: (productId: string | number, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('AUSTIN & CO_cart')
      if (saved) setItems(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem('AUSTIN & CO_cart', JSON.stringify(items))
  }, [items])

  const addToCart = (product: Product, quantity = 1, size?: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }
      return [...prev, { product, quantity, size }]
    })
  }

  const removeFromCart = (productId: string | number) =>
    setItems((prev) => prev.filter((i) => i.product.id !== productId))

  const updateQuantity = (productId: string | number, quantity: number) => {
    if (quantity <= 0) return removeFromCart(productId)
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    )
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem('AUSTIN & CO_cart')
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}