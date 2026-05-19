'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { authAPI } from '@/lib/api'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'

function LoginContent() {
  const router = useRouter()
  const { login, isLoggedIn } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [form, setForm] = useState({ email: '', password: '' })

  // Jika sudah login redirect langsung
  // useEffect(() => {
  //   if (isLoggedIn) {
  //     const redirect = sessionStorage.getItem('redirectAfterLogin')
  //     sessionStorage.removeItem('redirectAfterLogin')
  //     router.replace(redirect || '/home')
  //   }
  // }, [isLoggedIn, router])

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError('')

  try {
    const res = await authAPI.login(form.email, form.password)
    
    // ✅ Cek role SEBELUM login() dipanggil
    const isAdmin = res.user.role === 'ADMIN'
    
    login(res.user, res.token)
    toast.success(`Selamat datang, ${res.user.name}! 👋`)

    // ✅ Redirect berdasarkan role
    if (isAdmin) {
      router.replace('/admin')
      return
    }

    const redirect = sessionStorage.getItem('redirectAfterLogin')
    sessionStorage.removeItem('redirectAfterLogin')
    router.replace(redirect || '/home')

  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=1200&fit=crop"
          alt="Fashion"
          fill
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/30 to-transparent" />
        <div className="absolute bottom-12 left-10 right-10 text-white">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 mb-8 text-gray-400 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={15} /> Kembali ke toko
          </Link>
          <h1 className="text-5xl font-black tracking-tighter mb-3">
            AUSTIN <span className="text-blue-400">&</span> CO
          </h1>
          <p className="text-gray-300 leading-relaxed">
            Temukan fashion urban terbaik dengan pilihan premium yang eksklusif.
          </p>
          <div className="flex gap-6 mt-6">
            {[
              { value: '10K+', label: 'Produk' },
              { value: '50K+', label: 'Pembeli' },
              { value: '4.9★', label: 'Rating' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-xl font-black">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-md">

          {/* Mobile back + logo */}
          <div className="lg:hidden mb-8">
            <Link
              href="/home"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft size={15} /> Kembali ke toko
            </Link>
            <h1 className="text-3xl font-black tracking-tighter text-gray-900">
              AUSTIN <span className="text-blue-600">&</span> CO
            </h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              Selamat Datang
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Masuk untuk melanjutkan belanja
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-gray-600">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-12 rounded-xl border-gray-200 text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs font-bold text-gray-600">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Lupa password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="h-12 rounded-xl border-gray-200 text-sm pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gray-900 hover:bg-gray-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Masuk <ArrowRight size={16} /></>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">atau lanjutkan dengan</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Social Login — placeholder, belum terhubung OAuth */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'Google',   letter: 'G', color: 'text-red-500',  bg: 'hover:bg-red-50' },
              { name: 'Facebook', letter: 'f', color: 'text-blue-600', bg: 'hover:bg-blue-50' },
            ].map((s) => (
              <button
                key={s.name}
                onClick={() => toast.info(`Login ${s.name} belum tersedia`)}
                className={`h-12 border-2 border-gray-100 ${s.bg} rounded-xl text-sm font-semibold text-gray-700 flex items-center justify-center gap-2 transition-all hover:border-gray-200`}
              >
                <span className={`font-black text-base ${s.color}`}>{s.letter}</span>
                {s.name}
              </button>
            ))}
          </div>

          {/* Ke register */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Belum punya akun?{' '}
            <Link
              href="/register"
              className="font-bold text-gray-900 hover:underline transition-colors"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}