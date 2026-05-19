'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { adminAPI } from '@/lib/api'
import { formatPrice } from '@/data/products'
import { Plus, Pencil, Trash2, ArrowLeft, Search, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'

const CATEGORIES = ['Apparel', 'Footwear', 'Accessories', 'Bags']

const emptyForm = {
  name: '', description: '', price: '',
  originalPrice: '', image: '', category: 'Apparel', stock: '',
}

export default function AdminProductsPage() {
  const router = useRouter()
  const { user, isLoggedIn, loading } = useAuth()
  const [products, setProducts] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState<any>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn || user?.role !== 'ADMIN') {
        router.replace('/home')
        return
      }
      loadProducts()
    }
  }, [loading, isLoggedIn, user])

  const loadProducts = async () => {
    try {
      const data = await adminAPI.getProducts()
      setProducts(data)
    } catch (err) {
      toast.error('Gagal load produk')
    } finally {
      setLoadingData(false)
    }
  }

  const handleOpenAdd = () => {
    setEditProduct(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const handleOpenEdit = (product: any) => {
    setEditProduct(product)
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      image: product.image,
      category: product.category,
      stock: String(product.stock),
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.price || !form.image || !form.category) {
      toast.error('Nama, harga, gambar, dan kategori wajib diisi!')
      return
    }
    setSaving(true)
    try {
      if (editProduct) {
        await adminAPI.updateProduct(editProduct.id, form)
        toast.success('Produk berhasil diupdate!')
      } else {
        await adminAPI.createProduct(form)
        toast.success('Produk berhasil ditambahkan!')
      }
      setShowModal(false)
      loadProducts()
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan produk')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin hapus produk ini?')) return
    setDeleting(id)
    try {
      await adminAPI.deleteProduct(id)
      toast.success('Produk berhasil dihapus!')
      loadProducts()
    } catch (err: any) {
      toast.error(err.message || 'Gagal hapus produk')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-xl font-black tracking-tight">
            AUSTIN <span className="text-blue-400">&</span> CO Admin
          </Link>
          <div className="hidden md:flex items-center gap-4 text-sm">
            <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/admin/products" className="text-white font-semibold">Produk</Link>
            <Link href="/admin/orders" className="text-gray-400 hover:text-white transition-colors">Orders</Link>
            <Link href="/admin/users" className="text-gray-400 hover:text-white transition-colors">Users</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gray-500 hover:text-gray-900">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kelola Produk</h1>
              <p className="text-sm text-gray-500">{products.length} produk total</p>
            </div>
          </div>
          <Button
            onClick={handleOpenAdd}
            className="bg-gray-900 hover:bg-gray-700 text-white rounded-xl flex items-center gap-2"
          >
            <Plus size={16} /> Tambah Produk
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 rounded-xl border-gray-200"
          />
        </div>

        {/* Loading */}
        {loadingData ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Produk</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Kategori</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Harga</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Stok</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-6 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400">
                      <Package size={32} className="mx-auto mb-2 text-gray-200" />
                      Tidak ada produk
                    </td>
                  </tr>
                ) : (
                  filtered.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image src={product.image} alt={product.name} fill className="object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[200px]">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">{formatPrice(product.price)}</p>
                        {product.originalPrice && (
                          <p className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                          product.stock === 0 ? 'bg-red-50 text-red-700' :
                          product.stock <= 10 ? 'bg-amber-50 text-amber-700' :
                          'bg-green-50 text-green-700'
                        }`}>
                          {product.stock} pcs
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deleting === product.id}
                            className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            {deleting === product.id
                              ? <div className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
                              : <Trash2 size={15} />
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-5">
              {editProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h2>

            <div className="space-y-4">
              <div>
                <Label className="text-xs font-semibold text-gray-600">Nama Produk *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nama produk"
                  className="mt-1 h-11 rounded-xl border-gray-200"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-600">Deskripsi</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Deskripsi produk"
                  className="mt-1 h-11 rounded-xl border-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-gray-600">Harga *</Label>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="150000"
                    className="mt-1 h-11 rounded-xl border-gray-200"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-600">Harga Asli (opsional)</Label>
                  <Input
                    type="number"
                    value={form.originalPrice}
                    onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                    placeholder="200000"
                    className="mt-1 h-11 rounded-xl border-gray-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-gray-600">Kategori *</Label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="mt-1 w-full h-11 rounded-xl border border-gray-200 px-3 text-sm bg-white"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-600">Stok *</Label>
                  <Input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="50"
                    className="mt-1 h-11 rounded-xl border-gray-200"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-600">URL Gambar *</Label>
                <Input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="mt-1 h-11 rounded-xl border-gray-200"
                />
                {form.image && (
                  <div className="relative w-full h-32 mt-2 rounded-xl overflow-hidden bg-gray-100">
                    <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowModal(false)}
                variant="outline"
                className="flex-1 h-11 rounded-xl"
              >
                Batal
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 h-11 bg-gray-900 hover:bg-gray-700 text-white rounded-xl"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : editProduct ? 'Update Produk' : 'Tambah Produk'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}