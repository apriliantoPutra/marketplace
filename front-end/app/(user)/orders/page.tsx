// app/orders/page.tsx
'use client'
import { useState, useEffect, useCallback } from 'react'
import { ShoppingBag, RefreshCcw } from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatPrice, getStatusConfig, statusConfig } from '@/lib/utils/formatters'
import orderApi, { Order } from '@/lib/apis/orderApi'
import ErrorMessage from '@/components/user/error'
import Loading from '@/components/user/loading'
import EmptyMessage from '@/components/user/empty'
import { AxiosError } from 'axios'


export default function OrderPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await orderApi.getOrdersByLogin()
      setOrders(response.data || [])
      
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error || 'Terjadi kesalahan pada data order');
    } else if (err instanceof Error) {
        setError(err.message);
    } else {
        setError('Terjadi kesalahan pada data order');
    }} finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Get status payment
    const getStatusPaymentColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'paid':
                return 'bg-green-100 text-green-800'
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }
    const getStatusPaymentText = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Belum bayar'
            case 'paid':
                return 'Sudah bayar'
            case 'cancelled':
                return 'Dibatalkan'
            default:
                return status
        }
    }


  // Empty state
  if (orders.length === 0) {
    return (
      <EmptyMessage
        title="Belum Ada Pesanan" 
        message="Mulai belanja dan buat pesanan pertama Anda untuk melihatnya di sini."
        onBack='/products' />
    )
  }
  if(isLoading) {
    return <Loading/>
  }
  if (error) {
    return (
      <ErrorMessage
        title="Gagal Memuat Pesanan"
        message={error}
        onRetry={fetchOrders}
      />
    )
  }

  // Calculate statistics
  const totalSpent = orders.reduce((sum, order) => sum + order.total_amount, 0)
  const totalItems = orders.reduce((sum, order) => sum + order.total_items, 0)
  const latestOrderDate = orders.length > 0 ? orders[0].created_at : ''

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Riwayat Pesanan
              </h1>
              <p className="text-gray-600">
                Lacak dan kelola semua pesanan Anda
              </p>
            </div>
            
            <button
              onClick={fetchOrders}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
              <div className="text-sm text-gray-500 mb-1">Total Pesanan</div>
              <div className="text-2xl font-bold text-purple-600">{orders.length}</div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
              <div className="text-sm text-gray-500 mb-1">Total Belanja</div>
              <div className="text-2xl font-bold text-purple-600">
                {formatPrice(totalSpent)}
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
              <div className="text-sm text-gray-500 mb-1">Total Item</div>
              <div className="text-2xl font-bold text-purple-600">
                {totalItems}
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
              <div className="text-sm text-gray-500 mb-1">Pesanan Terbaru</div>
              <div className="text-2xl font-bold text-purple-600">
                {latestOrderDate ? formatDate(latestOrderDate) : '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Status Legend */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Status Pesanan
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(statusConfig).map(([key, config]) => {
              const Icon = config.icon
              return (
                <div key={key} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{config.label}</div>
                    <div className="text-sm text-gray-500">
                      {orders.filter(order => order.status === key).length} pesanan
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Ringkasan Pesanan
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Status Pembayaran</th>
                  <th className="px-6 py-3">Items</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const status = getStatusConfig(order.status)
                  return (
                    <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        #{order.id.toString().padStart(6, '0')}
                      </td>
                      <td className="px-6 py-4">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusPaymentColor(order.payment_status)}`}>
                          {getStatusPaymentText(order.payment_status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {order.total_items} item
                      </td>
                      <td className="px-6 py-4 font-bold text-purple-600">
                        {formatPrice(order.total_amount)}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="text-center mt-12">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            <ShoppingBag className="w-5 h-5" />
            Lanjutkan Belanja
          </Link>
        </div>
      </div>
    </div>
  )
}