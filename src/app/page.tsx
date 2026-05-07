'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authAPI } from '@/lib/api'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      let res
      if (isRegister) {
        res = await authAPI.register(name, form.email, form.password)
      } else {
        res = await authAPI.login(form.email, form.password)
      }
      // simpan token & user
      localStorage.setItem('token', res.token)
      localStorage.setItem('user', JSON.stringify(res.user))
      router.push('/home')
    } catch (err: unknown) {
      // Fallback demo mode (saat backend belum running)
      if (err instanceof Error && err.message.includes('fetch')) {
        // Demo: langsung masuk tanpa backend
        router.push('/home')
      } else {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900">
        <Image
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=1200&fit=crop"
          alt="Fashion"
          fill
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />
        <div className="absolute bottom-12 left-10 right-10 text-white">
          <h1 className="text-5xl font-bold tracking-tighter mb-4">AUSTIN & CO</h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            Temukan fashion urban terbaik dengan pilihan premium yang eksklusif.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tighter text-gray-900">AUSTIN & CO</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              {isRegister ? 'Buat Akun' : 'Selamat Datang'}
            </h2>
            <p className="text-gray-500 mt-2">
              {isRegister ? 'Daftar dan mulai belanja' : 'Masuk untuk melanjutkan belanja'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Nama Lengkap</Label>
                <Input
                  placeholder="Nama kamu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 rounded-xl border-gray-200"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-12 rounded-xl border-gray-200"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                {!isRegister && (
                  <button type="button" className="text-xs text-gray-500 hover:text-gray-900">
                    Lupa password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="h-12 rounded-xl border-gray-200 pr-12"
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
              className="w-full h-12 bg-gray-900 hover:bg-gray-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>{isRegister ? 'Daftar' : 'Masuk'} <ArrowRight size={16} /></>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
            <button
              onClick={() => { setIsRegister(!isRegister); setError('') }}
              className="font-semibold text-gray-900 hover:underline"
            >
              {isRegister ? 'Masuk di sini' : 'Daftar sekarang'}
            </button>
          </p>

          <p className="mt-4 text-center text-xs text-gray-400">
            Demo mode: klik Masuk tanpa mengisi form jika backend belum aktif
          </p>
        </div>
      </div>
    </div>
  )
}