'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { User, Mail, LogOut } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoggedIn, logout, loading } = useAuth()

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace('/login')
    }
  }, [isLoggedIn, loading, router])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-sm text-gray-500">Member</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <User size={18} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Nama</p>
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <Mail size={18} className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => { logout(); router.replace('/home') }}
            variant="outline"
            className="w-full h-12 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 font-semibold flex items-center justify-center gap-2"
          >
            <LogOut size={16} /> Keluar
          </Button>
        </div>
      </div>
    </div>
  )
}