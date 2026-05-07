'use client'

import { useState, useEffect, useRef } from 'react'
import {
  MessageCircle, X, Send, Bot, User,
  Sparkles, Trash2, ChevronDown
} from 'lucide-react'
import { useChat } from '@/hooks/use-chat'

const QUICK_REPLIES = [
  '🎁 Promo apa yang ada?',
  '📦 Cara lacak pesanan',
  '🔥 Produk trending',
  '🚚 Info pengiriman',
  '↩️ Kebijakan return',
  '📏 Panduan ukuran',
]

function RenderText({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i, arr) => {
        const parts = line.split(/\*\*(.*?)\*\*/g)
        return (
          <span key={i}>
            {parts.map((part, j) =>
              j % 2 === 1
                ? <strong key={j}>{part}</strong>
                : <span key={j}>{part}</span>
            )}
            {i < arr.length - 1 && <br />}
          </span>
        )
      })}
    </>
  )
}

export default function ChatBot() {
  const [isOpen, setIsOpen]               = useState(false)
  const [input, setInput]                 = useState('')
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [hasNewMsg, setHasNewMsg]         = useState(true)

  const { messages, isTyping, sendMessage, clearChat } = useChat()
  const chatEndRef    = useRef<HTMLDivElement>(null)
  const inputRef      = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
      setHasNewMsg(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      setHasNewMsg(true)
    }
  }, [messages, isOpen])

  const handleScroll = () => {
    const el = scrollAreaRef.current
    if (!el) return
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setShowScrollBtn(distFromBottom > 100)
  }

  const handleSend = () => {
    if (!input.trim() || isTyping) return
    sendMessage(input)
    setInput('')
  }

  const handleQuickReply = (q: string) => {
    const clean = q.replace(/^[\p{Emoji}\s]+/u, '').trim()
    sendMessage(clean)
  }

  const showQuickReplies = messages.length <= 2 && !isTyping

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Buka chat"
        className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${
          isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
        }`}
      >
        <div className="relative w-14 h-14 bg-gray-900 hover:bg-gray-700 rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110">
          <MessageCircle size={24} className="text-white" />
          <span className="absolute inset-0 rounded-full bg-gray-900 animate-ping opacity-20" />
          {hasNewMsg && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white text-white text-xs flex items-center justify-center font-bold">
              !
            </span>
          )}
        </div>
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 origin-bottom-right ${
        isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
      }`}>
        <div
          className="flex flex-col bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
          style={{ width: '360px', height: '540px' }}
        >
          {/* Header */}
          <div className="bg-gray-900 px-5 py-3.5 flex items-center gap-3 flex-shrink-0">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles size={17} className="text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm">URBI</p>
              <p className="text-xs text-gray-400 truncate">
                {isTyping
                  ? <span className="text-green-400 font-medium">Sedang mengetik...</span>
                  : 'Asisten Virtual URBANE · Online'
                }
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                title="Hapus chat"
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <Trash2 size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollAreaRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm ${
                  msg.role === 'assistant'
                    ? 'bg-gradient-to-br from-blue-400 to-violet-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {msg.role === 'assistant' ? <Bot size={13} /> : <User size={13} />}
                </div>

                <div className={`flex flex-col gap-1 max-w-[78%] ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}>
                  <div className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed break-words ${
                    msg.role === 'user'
                      ? 'bg-gray-900 text-white rounded-tr-sm'
                      : msg.error
                      ? 'bg-red-50 text-red-700 border border-red-100 rounded-tl-sm'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm'
                  }`}>
                    <RenderText text={msg.content} />
                  </div>
                  <span className="text-gray-400 text-xs px-1">{msg.time}</span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2 items-end">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Bot size={13} className="text-white" />
                </div>
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Scroll to bottom */}
          {showScrollBtn && (
            <button
              onClick={() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="absolute bottom-24 right-6 w-8 h-8 bg-white border border-gray-200 shadow-md rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-50 z-10"
            >
              <ChevronDown size={16} />
            </button>
          )}

          {/* Quick Replies */}
          {showQuickReplies && (
            <div className="px-4 pt-3 pb-2 bg-gray-50 border-t border-gray-100 flex-shrink-0">
              <p className="text-xs text-gray-400 mb-2 font-medium">Tanya langsung:</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REPLIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleQuickReply(q)}
                    disabled={isTyping}
                    className="text-xs bg-white border border-gray-200 text-gray-700 hover:border-gray-900 hover:text-gray-900 px-2.5 py-1.5 rounded-xl transition-all font-medium disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 bg-white border-t border-gray-100 flex-shrink-0">
            <div className="flex gap-2 items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder={isTyping ? 'URBI sedang mengetik...' : 'Ketik pesanmu...'}
                disabled={isTyping}
                className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 outline-none focus:border-gray-400 focus:bg-white transition-all disabled:opacity-60"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 bg-gray-900 hover:bg-gray-700 disabled:opacity-40 text-white rounded-2xl flex items-center justify-center transition-all hover:scale-105 flex-shrink-0"
              >
                <Send size={15} />
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              Powered by Claude AI · URBANE
            </p>
          </div>
        </div>
      </div>
    </>
  )
}