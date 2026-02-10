'use client'

import { useState, useEffect } from 'react'
import { Search, Package, Clock, CheckCircle, XCircle, Filter, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import orderApi, { Order, OrderStatusData } from '@/lib/apis/orderApi'
import ErrorMessage from '@/components/user/error'
import Loading from '@/components/user/loading'

export default function AdminOrderPage() {
    // State core
    const [orders, setOrders] = useState<Order[]>([])
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // State filter & search
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

    // State modal
    const [showStatusModal, setShowStatusModal] = useState(false)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState<OrderStatusData['status']>('pending')

    // State pagination
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Fetch orders
    const fetchOrders = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await orderApi.getOrders()
            setOrders(response)
            setFilteredOrders(response)
        } catch (err) {
            setError('Gagal memuat data order. Silakan coba lagi.')
            console.error('Error fetching orders:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    // Apply filters and search
    useEffect(() => {
        let result = [...orders]

        // Apply search
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase()
            result = result.filter(order =>
                order.shipping_full_name.toLowerCase().includes(searchLower) ||
                order.shipping_phone.includes(searchTerm) ||
                order.shipping_address.toLowerCase().includes(searchLower)
            )
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            result = result.filter(order => order.status === statusFilter)
        }

        setFilteredOrders(result)
        setCurrentPage(1) // Reset to first page when filter changes
    }, [searchTerm, statusFilter, orders])

    // Calculate statistics
    const totalOrders = orders.length
    const pendingOrders = orders.filter(order => order.status === 'pending').length
    const finishedOrders = orders.filter(order => order.status === 'finished').length
    const cancelledOrders = orders.filter(order => order.status === 'cancelled').length
    const processingOrders = orders.filter(order => order.status === 'processing').length

    // Pagination calculations
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentOrders = filteredOrders.slice(startIndex, endIndex)

    // Handle page change
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    // Handle status update
    const handleUpdateStatus = async () => {
        if (!selectedOrder) return

        try {
            setLoading(true)
            await orderApi.updateStatusOrder(selectedOrder.id, { status: selectedStatus })
            
            // Update local state
            setOrders(prev => prev.map(order => 
                order.id === selectedOrder.id 
                    ? { ...order, status: selectedStatus } 
                    : order
            ))
            
            setShowStatusModal(false)
            setSelectedOrder(null)
        } catch (err) {
            setError('Gagal mengupdate status order. Silakan coba lagi.')
            console.error('Error updating status:', err)
        } finally {
            setLoading(false)
        }
    }

    // Open status modal
    const openStatusModal = (order: Order) => {
        setSelectedOrder(order)
        setSelectedStatus(order.status as OrderStatusData['status'])
        setShowStatusModal(true)
    }

    // Open detail modal
    const openDetailModal = (order: Order) => {
        setSelectedOrder(order)
        setShowDetailModal(true)
    }

    // Reset filters
    const handleResetFilters = () => {
        setSearchTerm('')
        setStatusFilter('all')
    }

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    // Get status badge color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'processing':
                return 'bg-blue-100 text-blue-800'
            case 'finished':
                return 'bg-green-100 text-green-800'
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    // Get status text
    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Menunggu'
            case 'processing':
                return 'Diproses'
            case 'finished':
                return 'Selesai'
            case 'cancelled':
                return 'Dibatalkan'
            default:
                return status
        }
    }

    if (loading && orders.length === 0) {
        return <Loading />
    }

    if (error && orders.length === 0) {
        return (
            <ErrorMessage
                title="Gagal Memuat Data"
                message={error}
                onRetry={fetchOrders}
            />
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Manajemen Order
                            </h1>
                            <p className="text-gray-600">
                                Kelola dan pantau semua order pelanggan
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-xl p-4 shadow-sm border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Package className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Total Order</div>
                                    <div className="text-xl font-bold text-gray-900">{totalOrders}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Menunggu</div>
                                    <div className="text-xl font-bold text-gray-900">{pendingOrders}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Package className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Diproses</div>
                                    <div className="text-xl font-bold text-gray-900">{processingOrders}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Selesai</div>
                                    <div className="text-xl font-bold text-gray-900">{finishedOrders}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search Input */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Cari nama, nomor telepon, atau alamat..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-gray-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="pending">Menunggu</option>
                                    <option value="processing">Diproses</option>
                                    <option value="finished">Selesai</option>
                                    <option value="cancelled">Dibatalkan</option>
                                </select>
                            </div>
                        </div>

                        {/* Results Info */}
                        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <p className="text-gray-600">
                                Menampilkan {currentOrders.length} dari {filteredOrders.length} order
                                {statusFilter !== 'all' && ` dengan status ${getStatusText(statusFilter)}`}
                            </p>
                            {(searchTerm || statusFilter !== 'all') && (
                                <button
                                    onClick={handleResetFilters}
                                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                                >
                                    Reset Filter
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pelanggan
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tanggal
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {currentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                #{order.id}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {order.items_count} item
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {order.shipping_full_name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {order.shipping_phone}
                                                </div>
                                                <div className="text-sm text-gray-400 truncate max-w-xs">
                                                    {order.shipping_address}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-lg font-bold text-gray-900">
                                                {formatCurrency(order.total_amount)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {getStatusText(order.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(order.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openDetailModal(order)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Detail"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => openStatusModal(order)}
                                                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                    title="Ubah Status"
                                                >
                                                    <Filter className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty State */}
                    {filteredOrders.length === 0 && (
                        <div className="text-center py-12">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Tidak ada order ditemukan
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Coba ubah filter pencarian Anda'
                                    : 'Belum ada order yang dibuat'}
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-gray-600 text-sm">
                                    Halaman {currentPage} dari {totalPages} • Total {filteredOrders.length} order
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`p-2 rounded-lg ${currentPage === 1
                                                ? 'text-gray-400 cursor-not-allowed'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {/* First Page */}
                                        {currentPage > 3 && (
                                            <>
                                                <button
                                                    onClick={() => handlePageChange(1)}
                                                    className="w-10 h-10 rounded-lg hover:bg-gray-100"
                                                >
                                                    1
                                                </button>
                                                {currentPage > 4 && <span className="px-2">...</span>}
                                            </>
                                        )}

                                        {/* Middle Pages */}
                                        {[...Array(totalPages)].map((_, i) => {
                                            const pageNum = i + 1
                                            if (
                                                pageNum === currentPage ||
                                                pageNum === currentPage - 1 ||
                                                pageNum === currentPage + 1 ||
                                                (currentPage === 1 && pageNum <= 3) ||
                                                (currentPage === totalPages && pageNum >= totalPages - 2)
                                            ) {
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => handlePageChange(pageNum)}
                                                        className={`w-10 h-10 rounded-lg font-medium ${currentPage === pageNum
                                                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                                                                : 'hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                )
                                            }
                                            return null
                                        })}

                                        {/* Last Page */}
                                        {currentPage < totalPages - 2 && (
                                            <>
                                                {currentPage < totalPages - 3 && <span className="px-2">...</span>}
                                                <button
                                                    onClick={() => handlePageChange(totalPages)}
                                                    className="w-10 h-10 rounded-lg hover:bg-gray-100"
                                                >
                                                    {totalPages}
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`p-2 rounded-lg ${currentPage === totalPages
                                                ? 'text-gray-400 cursor-not-allowed'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Update Modal */}
            {showStatusModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-md">
                        <div className="p-6">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                                    <Filter className="w-8 h-8 text-purple-600" />
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Ubah Status Order
                                </h3>

                                <p className="text-gray-600 mb-6">
                                    Ubah status order #{selectedOrder.id} dari{' '}
                                    <span className={`font-medium ${getStatusColor(selectedOrder.status)} px-2 py-1 rounded`}>
                                        {getStatusText(selectedOrder.status)}
                                    </span>
                                </p>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status Baru
                                    </label>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value as OrderStatusData['status'])}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                    >
                                        <option value="pending">Menunggu</option>
                                        <option value="processing">Diproses</option>
                                        <option value="finished">Selesai</option>
                                        <option value="cancelled">Dibatalkan</option>
                                    </select>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowStatusModal(false)
                                            setSelectedOrder(null)
                                        }}
                                        className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleUpdateStatus}
                                        disabled={loading}
                                        className={`flex-1 px-4 py-2 rounded-lg font-medium ${loading
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg'
                                            }`}
                                    >
                                        {loading ? 'Menyimpan...' : 'Simpan'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Detail Modal */}
            {showDetailModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">
                                    Detail Order #{selectedOrder.id}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowDetailModal(false)
                                        setSelectedOrder(null)
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <XCircle className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Order Info */}
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Informasi Order
                                    </h4>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="text-sm text-gray-500">Status</div>
                                            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                                                {getStatusText(selectedOrder.status)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">Total Amount</div>
                                            <div className="text-lg font-bold text-gray-900">
                                                {formatCurrency(selectedOrder.total_amount)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">Jumlah Item</div>
                                            <div className="text-gray-900">
                                                {selectedOrder.items_count} item ({selectedOrder.total_items} total barang)
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">Tanggal Order</div>
                                            <div className="text-gray-900">
                                                {formatDate(selectedOrder.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Info */}
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Informasi Pengiriman
                                    </h4>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="text-sm text-gray-500">Nama Lengkap</div>
                                            <div className="text-gray-900">{selectedOrder.shipping_full_name}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">Nomor Telepon</div>
                                            <div className="text-gray-900">{selectedOrder.shipping_phone}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-500">Alamat Pengiriman</div>
                                            <div className="text-gray-900 whitespace-pre-line">
                                                {selectedOrder.shipping_address}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-6 border-t">
                                <button
                                    onClick={() => {
                                        setShowDetailModal(false)
                                        openStatusModal(selectedOrder)
                                    }}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                                >
                                    Ubah Status
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDetailModal(false)
                                        setSelectedOrder(null)
                                    }}
                                    className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}