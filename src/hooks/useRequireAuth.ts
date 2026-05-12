'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export function useRequireAuth() {
  const { isLoggedIn } = useAuth()
  const [showModal, setShowModal]     = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [redirectPath, setRedirectPath] = useState('')

  // Panggil ini sebelum aksi yang butuh login
  const requireAuth = (
    action: () => void,
    message?: string,
    redirect?: string
  ) => {
    if (isLoggedIn) {
      action()
    } else {
      setModalMessage(message || 'Silakan masuk untuk melanjutkan')
      setRedirectPath(redirect || '')
      setShowModal(true)
    }
  }

  return {
    showModal,
    modalMessage,
    redirectPath,
    requireAuth,
    closeModal: () => setShowModal(false),
  }
}