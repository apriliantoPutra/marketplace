// app/orders/[id]/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams} from 'next/navigation'
import { 
  Package, MapPin, Phone, ArrowLeft,
  FileText, CreditCard, User, Tag, Package2, Hash,
  Mail, Box, Receipt
} from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatPrice, formatTime, getStatusConfig } from '@/lib/utils/formatters'
import Loading from '@/components/user/loading'
import ErrorMessage from '@/components/user/error'
import orderApi, { OrderDetail } from '@/lib/apis/orderApi'
import { AxiosError } from 'axios'


export default function DetailOrderPage() {
  const params = useParams()
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Ambil orderId dari params
  const orderId = params.id ? parseInt(params.id as string) : null

  // Fetch order detail dari API
  const fetchOrderDetail = async () => {
    if (!orderId || isNaN(orderId)) {
      setError('Order ID tidak valid')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const data = await orderApi.getOrderById(orderId)
      setOrderDetail(data)
    } catch (err) {
      if (err instanceof AxiosError) {
            setError(err.response?.data?.error || 'Terjadi kesalahan pada data order');
        } else if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('Terjadi kesalahan pada data order');
        }} finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrderDetail()
  }, [orderId])

  // Loading state
  if (loading) {
    return <Loading />
  }

  // Error state
  if (error || !orderDetail) {
    return (
      <ErrorMessage
        title="Gagal Memuat Detail Pesanan"
        message={error || 'Data pesanan tidak ditemukan'}
        onRetry={fetchOrderDetail}
      />
    )
  }

  // Destructure data
  const { order_info, items, summary } = orderDetail
  
  // Format total amount ke number untuk perhitungan
  const totalAmount = parseFloat(order_info.total_amount) || 0
  
  // Calculate subtotal from items
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.subtotal, 0)
  }
  
  const subtotal = calculateSubtotal()
  const shippingCost = 0 // Sesuaikan dengan data sebenarnya jika ada
  const total = totalAmount
  
  // Get status configuration
  const status = getStatusConfig(order_info.status)
  const StatusIcon = status.icon
  
  // Timeline dates (contoh - sesuaikan dengan data sebenarnya)
  const timelineDates = {
    created: '2024-01-15 10:30:00',
    paid: '2024-01-15 11:45:00',
    processed: '2024-01-16 09:30:00',
    shipped: '2024-01-16 14:20:00',
    delivered: '2024-01-17 10:15:00'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header with Back Button */}
        <div className="mb-8">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Daftar Pesanan
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Detail Pesanan #{order_info.id.toString().padStart(6, '0')}
              </h1>
              <p className="text-gray-600">
                Informasi lengkap tentang pesanan Anda
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${status.color}`}>
                <StatusIcon className="w-5 h-5" />
                {status.label}
              </div>
            </div>
          </div>
        </div>

          <div className="space-y-6">
            {/* Order Status & Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Status Pesanan
                  </h2>
                  <p className="text-gray-600">
                    {status.label}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Total Pembayaran</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {formatPrice(totalAmount)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Box className="w-5 h-5 text-gray-400" />
                    <div className="text-sm text-gray-500">Jumlah Produk</div>
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    {summary.total_items}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-5 h-5 text-gray-400" />
                    <div className="text-sm text-gray-500">Total Item</div>
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    {summary.total_quantity}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt className="w-5 h-5 text-gray-400" />
                    <div className="text-sm text-gray-500">Subtotal</div>
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    {formatPrice(subtotal)}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-5 h-5 text-gray-400" />
                    <div className="text-sm text-gray-500">Status</div>
                  </div>
                  <div className="text-sm font-medium">
                    <span className={`px-2 py-1 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Produk dalam Pesanan ({summary.total_items})
              </h2>

              {items.length === 0 ? (
                <div className="text-center py-8">
                  <Package2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Tidak ada produk dalam pesanan ini</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div 
                        key={`${item.product_id}-${index}`}
                        className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                      >
                        {/* Product Image */}
                        <div className="sm:w-24 flex-shrink-0">
                          {item.image_url ? (
                            <div 
                              className="w-full h-24 bg-cover bg-center rounded-lg"
                              style={{ backgroundImage: `url(${item.image_url})` }}
                            />
                          ) : (
                            <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package2 className="w-10 h-10 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2">
                            <div>
                              <Link 
                                href={`/products/${item.slug}`}
                                className="font-bold text-gray-900 hover:text-purple-600 transition-colors mb-1 inline-block"
                              >
                                {item.product_name}
                              </Link>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Hash className="w-4 h-4" />
                                ID Produk: {item.product_id}
                              </div>
                            </div>
                            
                            <div className="mt-2 sm:mt-0 text-right">
                              <div className="text-lg font-bold text-purple-600">
                                {formatPrice(item.price)}
                              </div>
                              <div className="text-sm text-gray-500">
                                per item
                              </div>
                            </div>
                          </div>

                          {/* Quantity and Subtotal */}
                          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">Jumlah: </span>
                              <span className="font-medium">{item.quantity}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Receipt className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">Subtotal: </span>
                              <span className="font-bold text-gray-900">
                                {formatPrice(item.subtotal)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-bold text-gray-900">
                        Total Harga Produk
                      </div>
                      <div className="text-xl font-bold text-purple-600">
                        {formatPrice(subtotal)}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Shipping & Customer Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shipping Info */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Alamat Pengiriman
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {order_info.shipping_info.full_name}
                        </div>
                        <div className="text-gray-600 mt-1">
                          {order_info.shipping_info.address}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div className="text-gray-900">
                        {order_info.shipping_info.phone}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informasi Pembeli
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Username</div>
                        <div className="font-medium text-gray-900">
                          {order_info.customer.username}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <div className="font-medium text-gray-900">
                          {order_info.customer.email}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {order_info.notes && (
                <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-700 mb-2">
                    <FileText className="w-5 h-5" />
                    <span className="font-medium">Catatan Pesanan</span>
                  </div>
                  <p className="text-purple-600">{order_info.notes}</p>
                </div>
              )}
            </div>
          </div>
        
      </div>
    </div>
  )
}