'use client'

import { useState, useCallback } from 'react'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  time: string
  error?: boolean
}

const getTime = () =>
  new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: '👋 Halo! Aku **URBI**, asisten virtual URBANE.\n\nAku siap membantumu dengan info produk, promo, pengiriman, atau lacak pesanan. Ada yang bisa aku bantu? 😊',
      time: getTime(),
    },
  ])
  const [isTyping, setIsTyping] = useState(false)

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return

    const userMsg: ChatMessage = {
      role: 'user',
      content: text.trim(),
      time: getTime(),
    }

    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    try {
      const history = [...messages, userMsg]
        .filter((m) => !m.error)
        .map((m) => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mendapatkan respons')
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
          time: getTime(),
        },
      ])
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Terjadi kesalahan'
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ Maaf, ${errMsg}. Coba lagi ya!`,
          time: getTime(),
          error: true,
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }, [messages, isTyping])

  const clearChat = useCallback(() => {
    setMessages([
      {
        role: 'assistant',
        content: '👋 Halo lagi! Ada yang bisa aku bantu? 😊',
        time: getTime(),
      },
    ])
  }, [])

  return { messages, isTyping, sendMessage, clearChat }
}