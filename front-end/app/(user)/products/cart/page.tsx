'use client'
import { useState, useEffect } from 'react'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/lib/stores/cartStore'
import { formatPrice } from '@/lib/utils/formatters'
import { useRouter } from "next/navigation"
import EmptyMessage from '@/components/user/empty'


export default function CartPage() {
  const router= useRouter()
  const {items: cartData, summary, isLoading, error, refresh, updateItem, removeItem, clearCart}= useCart()
  
  const [localLoading, setLocalLoading] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // load cart data
  useEffect(()=> {
    refresh()
  }, [refresh])
  

  // Handle quantity increase
  const handleIncrease = async (cartId: number) => {
    try {
      setLocalLoading(`increase-${cartId}`)
      await updateItem(cartId, 'increase')
      setSuccessMessage('Kuantitas berhasil ditambah')
      setTimeout(()=> setSuccessMessage(null), 2000)

    } catch (error) {
      console.error('Failed to increase quantity:', error)
    } finally {
      setLocalLoading(null)
    }
  }

  // Handle quantity decrease
  const handleDecrease = async (cartId: number) => {
    try {
      setLocalLoading(`decrease-${cartId}`)
      await updateItem(cartId, 'decrease')
      setSuccessMessage('Kuantitas berhasil dikurangi')
      setTimeout(() => setSuccessMessage(null), 2000)

    } catch (error) {
      console.error('Failed to decrease quantity:', error)
    } finally {
      setLocalLoading(null)
    }
  }

  // Handle delete single item
  const handleDeleteItem = async (cartId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus item ini dari keranjang?')) {
      return
    }
    try {
      setLocalLoading(`delete-${cartId}`)
      await removeItem(cartId)
      setSuccessMessage('Item berhasil dihapus dari keranjang')
      setTimeout(() => setSuccessMessage(null), 2000)
      
    } catch (error) {
      console.error('Failed to delete item:', error)
    } finally {
      setLocalLoading(null)
    }
  }

  // Handle delete all items
  const handleDeleteAll = async () => {
    if(cartData.length === 0) return

    if (!confirm('Apakah Anda yakin ingin menghapus semua item dari keranjang?')) {
      return
    }
    try {
      setLocalLoading('delete-all')
      await clearCart()
      setSuccessMessage('Semua item berhasil dihapus dari keranjang')
      setTimeout(() => setSuccessMessage(null), 2000)

    } catch (error) {
      console.error('Failed to delete all items:', error)
    } finally {
      setLocalLoading(null)
    }
  }

  // Handle checkout
  const handleCheckout = () => {
    if (cartData.length === 0) {
      alert('Keranjang belanja kosong!')
      return
    }
    router.push('/products/konfirmasi')
  }

  // Empty cart state
  if (cartData.length === 0) {
    return (
      <EmptyMessage title='Keranjang Belanja Kosong' 
      message='Tambahkan beberapa produk ke keranjang belanja Anda untuk melihatnya di sini' 
      onBack='/products' />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Success Message Toast */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-lg">
            <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Keranjang Belanja
          </h1>
          <p className="text-gray-600">
            Kelola produk dalam keranjang belanja Anda
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Cart Items */}
          <div className="lg:w-2/3">
            {/* Cart Items List */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Produk dalam Keranjang ({summary.total_items} item)
                </h2>
                <button
                  onClick={handleDeleteAll}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  Hapus Semua
                </button>
              </div>

              {/* Cart Items */}
              <div className="space-y-6">
                {cartData.map(item => (
                  <div 
                    key={item.cart_id} 
                    className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 rounded-xl hover:border-purple-300 transition-colors"
                  >
                    {/* Product Image */}
                    <div className="sm:w-32">
                      <div 
                        className="w-full h-32 bg-cover bg-center rounded-lg"
                        style={{ backgroundImage: `url(${item.product.image_url})` }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between">
                        <div className="mb-4 sm:mb-0">
                          {/* Category Badge */}
                          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium mb-2">
                            {item.product.category}
                          </span>
                          
                          {/* Product Name */}
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {item.product.name}
                          </h3>
                          
                          {/* Price */}
                          <div className="text-xl font-bold text-purple-600 mb-2">
                            {formatPrice(item.product.price)}
                          </div>
                          
                          {/* Stock Info */}
                          <div className="text-sm text-gray-500 mb-4">
                            Stok tersedia: {item.product.stock} unit
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4">
                          {/* Quantity Selector */}
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => handleDecrease(item.cart_id)}
                              disabled={item.quantity <= 1}
                              className={`px-3 py-2 ${
                                item.quantity <= 1 
                                  ? 'text-gray-300 cursor-not-allowed' 
                                  : 'text-gray-600 hover:text-purple-600'
                              }`}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            
                            <span className="px-4 py-2 border-x border-gray-300 font-medium">
                              {item.quantity}
                            </span>
                            
                            <button
                              onClick={() => handleIncrease(item.cart_id)}
                              disabled={item.quantity >= item.product.stock}
                              className={`px-3 py-2 ${
                                item.quantity >= item.product.stock
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-600 hover:text-purple-600'
                              }`}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteItem(item.cart_id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <div className="text-sm text-gray-500">
                          Subtotal untuk item ini:
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatPrice(item.subTotal)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="flex justify-center">
              <Link
                href="/products"
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                Lanjutkan Belanja
              </Link>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Ringkasan Pesanan
              </h2>

              {/* Order Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Item</span>
                  <span className="font-medium">{summary.total_items} produk</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Kuantitas</span>
                  <span className="font-medium">{summary.total_quantity} unit</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total Harga</span>
                    <div className="text-2xl font-bold text-purple-600">
                      {formatPrice(summary.total_amount)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-200 transition-all mb-4"
              >
                Lanjutkan ke Checkout
              </button>

              {/* Delete All Button (Mobile) */}
              <button
                onClick={handleDeleteAll}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-red-600 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors lg:hidden"
              >
                <Trash2 className="w-5 h-5" />
                Hapus Semua Item
              </button>

              {/* Info */}
              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700">
                  💡 Setelah checkout, Anda akan diarahkan ke halaman konfirmasi pesanan
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cart Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
            <div className="text-sm text-gray-500 mb-1">Total Produk</div>
            <div className="text-2xl font-bold text-purple-600">{summary.total_items}</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
            <div className="text-sm text-gray-500 mb-1">Total Kuantitas</div>
            <div className="text-2xl font-bold text-purple-600">{summary.total_quantity}</div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
            <div className="text-sm text-gray-500 mb-1">Total Harga</div>
            <div className="text-2xl font-bold text-purple-600">{formatPrice(summary.total_amount)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}