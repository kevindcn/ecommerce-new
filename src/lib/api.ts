const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Helper utama
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Terjadi kesalahan' }))
    throw new Error(err.message || 'Request gagal')
  }
  return res.json()
}

// ── AUTH ──────────────────────────────────────────────
export const authAPI = {
  login: (email: string, password: string) =>
    fetchAPI('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    fetchAPI('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

    getProfile: () => fetchAPI('/api/auth/profile'),
}

// ── PRODUCTS ──────────────────────────────────────────
export const productAPI = {
  getAll: (category?: string) =>
    fetchAPI(`/api/products${category ? `?category=${category}` : ''}`),

  getById: (id: string | number) =>
    fetchAPI(`/api/products/${id}`),
}

// ── CART ──
export const cartAPI = {
  get: () => fetchAPI('/api/cart'),

  add: (productId: number, quantity: number, size?: string) =>
    fetchAPI('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, size }),
    }),

  update: (itemId: number, quantity: number) =>
    fetchAPI(`/api/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),

  remove: (itemId: number) =>
    fetchAPI(`/api/cart/${itemId}`, { method: 'DELETE' }),

  clear: () => fetchAPI('/api/cart/clear', { method: 'DELETE' }),
}

// ── ORDERS ────────────────────────────────────────────
export const orderAPI = {
  create: (data: {
    items: { productId: number; quantity: number }[]
    shippingAddress: string
    shippingCity: string
    shippingProvince: string
    shippingZip: string
    phone: string
    notes?: string
    courier: string
  }) =>
    fetchAPI('/api/orders', { method: 'POST', body: JSON.stringify(data) }),

  getMyOrders: () => fetchAPI('/api/orders/my'),
  getById: (id: number) => fetchAPI(`/api/orders/${id}`),
}

// ── PAYMENT ───────────────────────────────────────────
export const paymentAPI = {
  create: (orderId: number, method: string) =>
    fetchAPI('/api/payments', {
      method: 'POST',
      body: JSON.stringify({ orderId, method }),
    }),
}