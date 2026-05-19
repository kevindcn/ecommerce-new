'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role?: string 
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  login: (user: User, token: string) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Baca dari localStorage saat pertama load
  useEffect(() => {
    try {
      const savedUser  = localStorage.getItem('urbane_user')
      const savedToken = localStorage.getItem('token')
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser))
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  const login = (userData: User, token: string) => {
    setUser(userData)
    localStorage.setItem('urbane_user', JSON.stringify(userData))
    localStorage.setItem('token', token)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('urbane_user')
    localStorage.removeItem('token')
    localStorage.removeItem('urbane_cart')
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      login,
      logout,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}