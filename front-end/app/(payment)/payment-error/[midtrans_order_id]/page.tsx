'use client'

import { ArrowLeft, ShoppingBag, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function PaymentErrorPage() {
    const router = useRouter()
    const [orderId, setOrderId] = useState('')

    useEffect(()=> {
        const path = window.location.pathname
        const id = path.split('/').pop() || ''
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOrderId(id)
    }, [])

    const handleBackToPayment = ()=> {
        router.push(`/payment/${orderId}`)
    }
    const handleBackToProducts = () => {
        router.push('/products')
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            {/* Icon XCircle dari lucide-react */}
            <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-4 rounded-full">
                <XCircle className="w-16 h-16 text-red-600" />
            </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Pembayaran Gagal
            </h1>

            <p className="text-gray-600 mb-6">
            Maaf, terjadi kesalahan saat memproses pembayaran Anda. Silakan coba lagi atau hubungi customer service.
            </p>

            {/* Tombol aksi */}
            <div className="space-y-3">
            <button
                onClick={handleBackToPayment}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
                <ArrowLeft className="w-5 h-5" />
                Coba Bayar Lagi
            </button>

            <button
                onClick={handleBackToProducts}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
                <ShoppingBag className="w-5 h-5" />
                Kembali Belanja
            </button>
            </div>
        </div>
    </div>
    )
}