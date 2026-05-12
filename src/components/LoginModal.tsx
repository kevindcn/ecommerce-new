'use client'

import { useRouter } from 'next/navigation'
import { X, UserCheck, UserPlus, ShoppingBag, Lock } from 'lucide-react'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  redirectAfterLogin?: string
  message?: string
}

export default function LoginModal({
  isOpen,
  onClose,
  redirectAfterLogin,
  message,
}: LoginModalProps) {
  const router = useRouter()

  if (!isOpen) return null

 const handleLogin = () => {
  if (redirectAfterLogin) {
    sessionStorage.setItem('redirectAfterLogin', redirectAfterLogin)
  }
  onClose()
  router.push('/login')      // ← ke halaman login
}

const handleRegister = () => {
  if (redirectAfterLogin) {
    sessionStorage.setItem('redirectAfterLogin', redirectAfterLogin)
  }
  onClose()
  router.push('/register')   // ← ke halaman register
}

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl pointer-events-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden">

          {/* Header */}
          <div className="relative bg-gray-900 px-6 pt-8 pb-6 text-center overflow-hidden">
            {/* Decorative background */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 50%)',
              }}
            />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-colors z-10"
            >
              <X size={16} />
            </button>

            {/* Icon */}
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {message
                  ? <Lock size={28} className="text-white" />
                  : <ShoppingBag size={28} className="text-white" />
                }
              </div>
              <h2 className="text-xl font-black text-white mb-2">
                Masuk ke Akun Kamu
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                {message || 'Untuk melanjutkan, kamu perlu masuk atau daftar terlebih dahulu.'}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-3">

            {/* Pertanyaan */}
            <p className="text-center text-sm font-semibold text-gray-700 mb-4">
              Apakah kamu sudah memiliki akun?
            </p>

            {/* Tombol Sudah Punya Akun → ke halaman Login */}
            <button
              onClick={handleLogin}
              className="w-full flex items-center gap-4 p-4 bg-gray-900 hover:bg-gray-700 text-white rounded-2xl transition-all hover:scale-[1.02] group"
            >
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <UserCheck size={20} className="text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-sm">Ya, saya sudah punya akun</p>
                <p className="text-xs text-gray-400 mt-0.5">Masuk ke akun yang sudah ada</p>
              </div>
              <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
            </button>

            {/* Tombol Belum Punya Akun → ke halaman Register */}
            <button
              onClick={handleRegister}
              className="w-full flex items-center gap-4 p-4 bg-white hover:bg-gray-50 text-gray-900 rounded-2xl transition-all hover:scale-[1.02] border-2 border-gray-200 hover:border-gray-300 group"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <UserPlus size={20} className="text-blue-600" />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-sm text-gray-900">Belum, saya ingin daftar</p>
                <p className="text-xs text-gray-500 mt-0.5">Buat akun baru secara gratis</p>
              </div>
              <span className="text-gray-300 group-hover:translate-x-1 transition-transform">→</span>
            </button>

            {/* Skip */}
            <button
              onClick={onClose}
              className="w-full text-center text-xs text-gray-400 hover:text-gray-600 py-2 transition-colors"
            >
              Lanjut tanpa masuk
            </button>
          </div>
        </div>
      </div>
    </>
  )
}