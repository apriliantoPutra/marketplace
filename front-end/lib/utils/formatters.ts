import { CheckCircle, Clock, Package, ShoppingCart, Truck, XCircle } from "lucide-react"

// format ke rupiah
export const formatPrice= (price: number): string=> {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(price)
}

// format angka ribuan
export const formatNumber= (num: number): string=> {
    return new Intl.NumberFormat('id-ID').format(num)
}

// format tanggal
export const formatDate= (dateString: string): string=> {
    const date= new Date(dateString)
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
}

export const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
}

// status
export const statusConfig = {
  pending: {
    label: 'Menunggu Pembayaran',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  processing: {
    label: 'Sedang Diproses',
    color: 'bg-blue-100 text-blue-800',
    icon: ShoppingCart,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  finished: {
    label: 'Telah Diterima',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  cancelled: {
    label: 'Dibatalkan',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  }
}
// Helper function untuk mendapatkan status config
export const getStatusConfig = (status: string) => {
  const config = statusConfig[status as keyof typeof statusConfig]
  return config || {
    label: status,
    color: 'bg-gray-100 text-gray-800',
    icon: Package,
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  }
}