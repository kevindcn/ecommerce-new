// File ini dipakai sebagai FALLBACK / mock data
// Saat backend sudah siap, data dari API akan replace ini
export interface Product {
  id: string | number
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  rating: number
  reviews: number
  stock: number
  description: string
  features?: string[]
  images?: string[]
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Sneakers Urban Pro X1',
    price: 899000,
    originalPrice: 1299000,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop',
    ],
    category: 'Footwear',
    rating: 4.8,
    reviews: 234,
    stock: 15,
    description: 'Sneakers premium dengan teknologi cushioning terdepan untuk kenyamanan sepanjang hari.',
    features: ['Sole anti-slip', 'Material breathable', 'Cushioning terbaru', 'Tersedia 6 warna'],
  },
  {
    id: '2',
    name: 'Hoodie Oversized Essential',
    price: 459000,
    originalPrice: 599000, 
    image: 'https://images.unsplash.com/photo-1680292783974-a9a336c10366?w=400&h=400&fit=crop',
      images: ['https://images.unsplash.com/photo-1680292783974-a9a336c10366?w=600&h=600&fit=crop',],
    category: 'Apparel',
    rating: 4.6,
    reviews: 189,
    stock: 32,
    description: 'Hoodie oversized dari bahan fleece premium 320gsm.',
    features: ['Bahan 320gsm fleece', 'Fit oversized', 'Pocket kangaroo', 'S-XXL'],
  },
  {
    id: '3',
    name: 'Tas Ransel Laptop Minimalist',
    price: 649000,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop'],
    category: 'Bags',
    rating: 4.9,
    reviews: 312,
    stock: 8,
    description: 'Ransel minimalist dengan kompartemen laptop hingga 15.6 inch.',
    features: ['Muat laptop 15.6"', 'Water resistant', 'USB charging port', 'Nylon premium'],
  },
  {
    id: '4',
    name: 'Topi Bucket Canvas',
    price: 189000,
    originalPrice: 249000,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&h=600&fit=crop'],
    category: 'Accessories',
    rating: 4.4,
    reviews: 98,
    stock: 50,
    description: 'Bucket hat canvas premium. Warna earth tone yang timeless.',
    features: ['Canvas premium', 'Adjustable', 'Sun protection', 'Bisa dicuci'],
  },
  {
    id: '5',
    name: 'Kacamata Pilot Polarized',
    price: 329000,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop'],
    category: 'Accessories',
    rating: 4.7,
    reviews: 156,
    stock: 25,
    description: 'Kacamata hitam pilot dengan lensa polarized UV400.',
    features: ['Lensa polarized', 'UV400', 'Frame metal', 'Case included'],
  },
  {
    id: '6',
    name: 'Celana Cargo Utility',
    price: 529000,
    originalPrice: 699000,
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=600&fit=crop'],
    category: 'Apparel',
    rating: 4.5,
    reviews: 201,
    stock: 18,
    description: 'Celana cargo dengan 6 kantong fungsional. Bahan ripstop.',
    features: ['6 kantong', 'Bahan ripstop', 'Adjustable waist', 'S-XXXL'],
  },
  {
    id: '7',
    name: 'Jam Tangan Analog Minimalist',
    price: 799000,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop'],
    category: 'Accessories',
    rating: 4.8,
    reviews: 445,
    stock: 10,
    description: 'Jam tangan analog minimalist dengan tali genuine leather.',
    features: ['Genuine leather', 'Water resistant 3ATM', 'Quartz movement', '38mm'],
  },
  {
    id: '8',
    name: 'Kaos Graphic Art Series',
    price: 249000,
    originalPrice: 319000,
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=600&fit=crop'],
    category: 'Apparel',
    rating: 4.3,
    reviews: 67,
    stock: 40,
    description: 'Kaos print grafis eksklusif koleksi Art Series. Cotton combed 30s.',
    features: ['Cotton combed 30s', 'Sablon plastisol', 'Pre-shrunk', 'S-XXL'],
  },
]

export const formatPrice = (price: number): string =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price)