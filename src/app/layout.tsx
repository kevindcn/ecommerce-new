import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import { Toaster } from '@/components/ui/sonner'
import ChatBot from '@/components/ChatBot'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AUSTIN & CO — Fashion Store',
  description: 'Your premium urban fashion destination',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={geist.className}>
        <CartProvider>
          {children}
          <Toaster />
            <ChatBot /> 
        </CartProvider>
      </body>
    </html>
  )
}