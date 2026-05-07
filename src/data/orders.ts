import { Package, Truck, MapPin, CheckCircle, XCircle } from 'lucide-react'

// ── TYPES ────────────────────────────────────────────
export type OrderStatus = 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderLog {
  status: OrderStatus
  message: string
  timestamp: string
}

export interface OrderItem {
  id: string
  name: string
  image: string
  price: number
  quantity: number
  size?: string
  color?: string
}

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  createdAt: string
  items: OrderItem[]
  totalAmount: number
  shippingCost: number
  courier: string
  trackingNumber?: string
  shippingAddress: string
  shippingCity: string
  shippingProvince: string
  phone: string          // ← tambah
  paymentMethod: string  // ← tambah
  logs: OrderLog[]
}

// ── STATUS CONFIG ─────────────────────────────────────
export const STATUS_CONFIG: Record<OrderStatus, {
  label: string
  color: string
  bg: string
  icon: React.ElementType
}> = {
  confirmed:  { label: 'Dikonfirmasi', color: 'text-blue-700',   bg: 'bg-blue-50',   icon: CheckCircle },
  processing: { label: 'Dikemas',      color: 'text-amber-700',  bg: 'bg-amber-50',  icon: Package },
  shipped:    { label: 'Dikirim',      color: 'text-purple-700', bg: 'bg-purple-50', icon: Truck },
  delivered:  { label: 'Diterima',     color: 'text-green-700',  bg: 'bg-green-50',  icon: MapPin },
  cancelled:  { label: 'Dibatalkan',   color: 'text-red-700',    bg: 'bg-red-50',    icon: XCircle },
}

// ── STORAGE HELPERS ───────────────────────────────────
const STORAGE_KEY = 'AUSTIN & CO_orders'

export function saveOrder(order: Order): void {
  if (typeof window === 'undefined') return
  try {
    const existing = getOrders()
    // Kalau sudah ada, update — kalau belum, tambah di depan
    const updated = [order, ...existing.filter((o) => o.id !== order.id)]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (e) {
    console.error('Gagal menyimpan order:', e)
  }
}

export function getOrders(): Order[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: Order[] = JSON.parse(raw)
    // Urutkan terbaru di atas
    return parsed.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  } catch {
    return []
  }
}

export function getOrderById(id: string): Order | null {
  if (typeof window === 'undefined') return null
  try {
    const orders = getOrders()
    return orders.find((o) => o.id === id) ?? null
  } catch {
    return null
  }
}

export function clearAllOrders(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

// ── ORDER BUILDER ─────────────────────────────────────
export function createNewOrder(params: {
  items: OrderItem[]
  totalAmount: number
  shippingCost: number
  courier: string
  shippingAddress: string
  shippingCity: string
  shippingProvince: string
  phone: string
  paymentMethod: string
}): Order {
  const now = new Date().toISOString()
  const id = Date.now().toString()
  const orderNumber = `URB-${Date.now().toString().slice(-8)}`

  const order: Order = {
    id,
    orderNumber,
    status: 'confirmed',
    createdAt: now,
    trackingNumber: undefined,
    logs: [
      {
        status: 'confirmed',
        message: `Pesanan #${orderNumber} dikonfirmasi. Pembayaran via ${params.paymentMethod} diterima.`,
        timestamp: now,
      },
    ],
    ...params,
  }

  // ✅ Langsung simpan ke localStorage saat dibuat
  saveOrder(order)
  return order
}

// ── MOCK DATA ─────────────────────────────────────────
// Dipakai untuk inisialisasi awal jika localStorage kosong
export const MOCK_ORDERS: Order[] = [
  {
    id: 'mock-1',
    orderNumber: 'URB-87654321',
    status: 'shipped',
    createdAt: '2025-05-04T10:30:00Z',
    courier: 'JNE YES',
    trackingNumber: 'JNE1234567890',
    shippingAddress: 'Jl. Sudirman No. 45',
    shippingCity: 'Bandung',
    shippingProvince: 'Jawa Barat',
    phone: '081234567890',
    paymentMethod: 'Transfer Bank',
    items: [
      {
        id: '1',
        name: 'Sneakers Urban Pro X1',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop',
        price: 899000,
        quantity: 1,
        size: '42',
      },
      {
        id: '2',
        name: 'Hoodie Oversized Essential',
        image: 'https://images.unsplash.com/photo-1680292783974-a9a336c10366?w=200&h=200&fit=crop',
        price: 459000,
        quantity: 1,
        size: 'L',
        color: 'Hitam',
      },
    ],
    totalAmount: 1383000,
    shippingCost: 25000,
    logs: [
      { status: 'confirmed',  message: 'Pesanan dikonfirmasi dan pembayaran diterima.', timestamp: '2025-05-04T10:35:00Z' },
      { status: 'processing', message: 'Pesanan sedang dikemas oleh tim gudang.', timestamp: '2025-05-04T13:00:00Z' },
      { status: 'shipped',    message: 'Paket diserahkan ke kurir JNE YES. No. resi: JNE1234567890', timestamp: '2025-05-05T09:00:00Z' },
    ],
  },
  {
    id: 'mock-2',
    orderNumber: 'URB-12345678',
    status: 'delivered',
    createdAt: '2025-04-28T14:00:00Z',
    courier: 'SiCepat BEST',
    trackingNumber: 'SCP9876543210',
    shippingAddress: 'Jl. Asia Afrika No. 10',
    shippingCity: 'Bandung',
    shippingProvince: 'Jawa Barat',
    phone: '081234567890',
    paymentMethod: 'E-Wallet',
    items: [
      {
        id: '3',
        name: 'Tas Ransel Laptop Minimalist',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop',
        price: 649000,
        quantity: 1,
      },
    ],
    totalAmount: 674000,
    shippingCost: 25000,
    logs: [
      { status: 'confirmed',  message: 'Pesanan dikonfirmasi dan pembayaran diterima.', timestamp: '2025-04-28T14:10:00Z' },
      { status: 'processing', message: 'Pesanan sedang dikemas oleh tim gudang.', timestamp: '2025-04-28T16:00:00Z' },
      { status: 'shipped',    message: 'Paket diserahkan ke kurir SiCepat. No. resi: SCP9876543210', timestamp: '2025-04-29T08:30:00Z' },
      { status: 'delivered',  message: 'Paket telah diterima. Terima kasih sudah berbelanja!', timestamp: '2025-04-30T14:20:00Z' },
    ],
  },
  {
    id: 'mock-3',
    orderNumber: 'URB-11223344',
    status: 'confirmed',
    createdAt: '2025-05-06T08:00:00Z',
    courier: 'JNE Reguler',
    shippingAddress: 'Jl. Braga No. 7',
    shippingCity: 'Bandung',
    shippingProvince: 'Jawa Barat',
    phone: '081234567890',
    paymentMethod: 'COD',
    items: [
      {
        id: '7',
        name: 'Jam Tangan Analog Minimalist',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
        price: 799000,
        quantity: 1,
      },
    ],
    totalAmount: 824000,
    shippingCost: 25000,
    logs: [
      { status: 'confirmed', message: 'Pesanan dikonfirmasi dan pembayaran diterima.', timestamp: '2025-05-06T08:05:00Z' },
    ],
  },
]

// ── INIT MOCK DATA ────────────────────────────────────
// Isi localStorage dengan mock data jika masih kosong
// Panggil fungsi ini sekali di layout atau orders/page
export function initMockOrdersIfEmpty(): void {
  if (typeof window === 'undefined') return
  const existing = getOrders()
  if (existing.length === 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_ORDERS))
  }
}