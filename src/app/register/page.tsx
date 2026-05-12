'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Eye, EyeOff, ArrowRight, ArrowLeft,
  User, Mail, Lock, CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { authAPI } from '@/lib/api'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'

const BENEFITS = [
  'Gratis ongkir untuk pembelian pertama',
  'Akses flash sale & promo eksklusif',
  'Lacak pesanan real-time',
  'Cashback hingga Rp25.000',
]

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [showPassword, setShowPassword]   = useState(false)
  const [showConfirm, setShowConfirm]     = useState(false)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '',
  })

  const set = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }))

  // Validasi password strength
  const passwordStrength = (() => {
    const p = form.password
    if (p.length === 0) return { score: 0, label: '', color: '' }
    if (p.length < 4)   return { score: 1, label: 'Lemah',   color: 'bg-red-400' }
    if (p.length < 7)   return { score: 2, label: 'Sedang',  color: 'bg-yellow-400' }
    return               { score: 3, label: 'Kuat',    color: 'bg-green-400' }
  })()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Password dan konfirmasi password tidak cocok')
      return
    }
    if (form.password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }

    setLoading(true)

    try {
      let userData: { id: string; name: string; email: string }
      let token: string

      try {
        const res = await authAPI.register(form.name, form.email, form.password)
        userData  = res.user
        token     = res.token
      } catch (apiErr) {
        // Fallback demo
        if (apiErr instanceof Error && apiErr.message.includes('fetch')) {
          userData = {
            id:    Date.now().toString(),
            name:  form.name,
            email: form.email,
          }
          token = `demo-token-${Date.now()}`
        } else {
          throw apiErr
        }
      }

      login(userData, token)
      toast.success(`Akun berhasil dibuat! Selamat datang, ${userData.name} 🎉`)

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
      <div className="hidden lg:flex lg:w-5/12 relative bg-gray-900 overflow-hidden flex-col justify-between p-12">
        <Image
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1200&fit=crop"
          alt="Fashion"
          fill
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-900/70 to-blue-900/50" />

        {/* Top — Logo */}
        <div className="relative z-10">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={15} /> Kembali ke toko
          </Link>
        </div>

        {/* Middle — Benefits */}
        <div className="relative z-10">
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2">
            AUSTIN <span className="text-blue-400">&</span> CO
          </h1>
          <p className="text-gray-300 text-sm mb-8 leading-relaxed">
            Bergabung dengan ribuan fashion enthusiast dan nikmati berbagai keuntungan eksklusif.
          </p>
          <div className="space-y-3">
            {BENEFITS.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-500/20 border border-blue-400/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={13} className="text-blue-400" />
                </div>
                <p className="text-sm text-gray-300">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — Stats */}
        <div className="relative z-10 flex gap-6">
          {[
            { value: '50K+', label: 'Member aktif' },
            { value: '4.9★', label: 'Rating toko' },
            { value: 'Free', label: 'Daftar gratis' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-xl font-black text-white">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-gray-50 overflow-y-auto">
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

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-sm p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                Buat Akun Baru
              </h2>
              <p className="text-gray-500 mt-1.5 text-sm">
                Daftar gratis dan mulai belanja sekarang
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Nama */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                  <User size={11} /> Nama Lengkap
                </Label>
                <Input
                  placeholder="Nama lengkap kamu"
                  value={form.name}
                  onChange={set('name')}
                  className="h-11 rounded-xl border-gray-200 text-sm bg-gray-50 focus:bg-white"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                  <Mail size={11} /> Email
                </Label>
                <Input
                  type="email"
                  placeholder="nama@email.com"
                  value={form.email}
                  onChange={set('email')}
                  className="h-11 rounded-xl border-gray-200 text-sm bg-gray-50 focus:bg-white"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                  <Lock size={11} /> Password
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 karakter"
                    value={form.password}
                    onChange={set('password')}
                    className="h-11 rounded-xl border-gray-200 text-sm pr-11 bg-gray-50 focus:bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password strength bar */}
                {form.password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 h-1.5 rounded-full transition-all ${
                            i <= passwordStrength.score
                              ? passwordStrength.color
                              : 'bg-gray-100'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${
                      passwordStrength.score === 1 ? 'text-red-500' :
                      passwordStrength.score === 2 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      Password {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Konfirmasi Password */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                  <Lock size={11} /> Konfirmasi Password
                </Label>
                <div className="relative">
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Ulangi password"
                    value={form.confirm}
                    onChange={set('confirm')}
                    className={`h-11 rounded-xl border-gray-200 text-sm pr-11 bg-gray-50 focus:bg-white ${
                      form.confirm && form.confirm !== form.password
                        ? 'border-red-300 focus:border-red-400'
                        : form.confirm && form.confirm === form.password
                        ? 'border-green-300 focus:border-green-400'
                        : ''
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  {/* Match indicator */}
                  {form.confirm && (
                    <div className={`absolute right-10 top-1/2 -translate-y-1/2 ${
                      form.confirm === form.password ? 'text-green-500' : 'text-red-400'
                    }`}>
                      {form.confirm === form.password
                        ? <CheckCircle size={15} />
                        : <span className="text-xs font-bold">✕</span>
                      }
                    </div>
                  )}
                </div>
              </div>

              {/* Terms */}
              <p className="text-xs text-gray-400 leading-relaxed">
                Dengan mendaftar, kamu menyetujui{' '}
                <button type="button" className="text-blue-600 font-medium hover:underline">
                  Syarat & Ketentuan
                </button>{' '}
                dan{' '}
                <button type="button" className="text-blue-600 font-medium hover:underline">
                  Kebijakan Privasi
                </button>{' '}
                kami.
              </p>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gray-900 hover:bg-gray-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Buat Akun <ArrowRight size={16} /></>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">atau daftar dengan</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Social Register */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Google',   letter: 'G', color: 'text-red-500',  bg: 'hover:bg-red-50' },
                { name: 'Facebook', letter: 'f', color: 'text-blue-600', bg: 'hover:bg-blue-50' },
              ].map((s) => (
                <button
                  key={s.name}
                  onClick={() => {
                    login(
                      {
                        id:    Date.now().toString(),
                        name:  s.name + ' User',
                        email: `user@${s.name.toLowerCase()}.com`,
                      },
                      `token_${Date.now()}`
                    )
                    toast.success(`Akun berhasil dibuat! 🎉`)
                    const redirect = sessionStorage.getItem('redirectAfterLogin')
                    sessionStorage.removeItem('redirectAfterLogin')
                    router.replace(redirect || '/home')
                  }}
                  className={`h-11 border-2 border-gray-100 ${s.bg} rounded-xl text-sm font-semibold text-gray-700 flex items-center justify-center gap-2 transition-all hover:border-gray-200`}
                >
                  <span className={`font-black text-base ${s.color}`}>{s.letter}</span>
                  {s.name}
                </button>
              ))}
            </div>

            {/* Ke login */}
            <p className="mt-5 text-center text-sm text-gray-500">
              Sudah punya akun?{' '}
              <Link
                href="/login"
                className="font-bold text-gray-900 hover:underline"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}