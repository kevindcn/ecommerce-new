'use client'
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Product } from '@/data/products'
import { cartAPI } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

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
  const { isLoggedIn } = useAuth()

  const loadCart = useCallback(async () => {
    if (isLoggedIn) {
      try {
        const data = await cartAPI.get()
        const mapped: CartItem[] = data.map((item: any) => ({
          product: item.product,
          quantity: item.quantity,
          size: item.size,
        }))
        setItems(mapped)
      } catch {
        try {
          const saved = localStorage.getItem('AUSTIN & CO_cart')
          if (saved) setItems(JSON.parse(saved))
        } catch {}
      }
    } else {
      try {
        const saved = localStorage.getItem('AUSTIN & CO_cart')
        if (saved) setItems(JSON.parse(saved))
      } catch {}
    }
  }, [isLoggedIn])

  useEffect(() => {
    loadCart()
  }, [loadCart])

  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem('AUSTIN & CO_cart', JSON.stringify(items))
    }
  }, [items, isLoggedIn])

  const addToCart = async (product: Product, quantity = 1, size?: string) => {
    if (isLoggedIn) {
      try {
        await cartAPI.add(Number(product.id), quantity, size)
        await loadCart()
      } catch (err) {
        console.error('Gagal tambah ke cart:', err)
      }
    } else {
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
  }

  const removeFromCart = async (productId: string | number) => {
    if (isLoggedIn) {
      try {
        const data = await cartAPI.get()
        const item = data.find((i: any) => i.product.id === productId)
        if (item) await cartAPI.remove(item.id)
        await loadCart()
      } catch (err) {
        console.error('Gagal hapus dari cart:', err)
      }
    } else {
      setItems((prev) => prev.filter((i) => i.product.id !== productId))
    }
  }

  const updateQuantity = async (productId: string | number, quantity: number) => {
    if (quantity <= 0) return removeFromCart(productId)
    if (isLoggedIn) {
      try {
        const data = await cartAPI.get()
        const item = data.find((i: any) => i.product.id === productId)
        if (item) await cartAPI.update(item.id, quantity)
        await loadCart()
      } catch (err) {
        console.error('Gagal update cart:', err)
      }
    } else {
      setItems((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
      )
    }
  }

  const clearCart = async () => {
    if (isLoggedIn) {
      try {
        await cartAPI.clear()
      } catch (err) {
        console.error('Gagal clear cart:', err)
      }
    }
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