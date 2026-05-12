'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import ChatBot from './ChatBot'

export default function ChatBotWrapper() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const checkLogin = () => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }

  useEffect(() => {
    checkLogin()
    window.addEventListener('storage', checkLogin)
    return () => window.removeEventListener('storage', checkLogin)
  }, [])

  useEffect(() => {
    checkLogin()
  }, [pathname])

  if (pathname === '/' || !isLoggedIn) return null

  return <ChatBot />
}