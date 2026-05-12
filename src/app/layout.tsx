import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import { Toaster } from '@/components/ui/sonner'
import ChatBotWrapper from '@/components/ChatBotWrapper'
import { AuthProvider } from '@/context/AuthContext'
import Script from 'next/script'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AUSTIN & CO — Fashion Store',
  description: 'Your premium urban fashion destination',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={geist.className}>
        <AuthProvider>
        <CartProvider>
          {children}
          <Toaster />
            <ChatBotWrapper /> 
        </CartProvider>
        </AuthProvider>

        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="afterInteractive"
        />

      </body>
    </html>
  )
}