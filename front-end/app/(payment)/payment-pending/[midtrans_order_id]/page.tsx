'use client'

import { ArrowLeft, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function PaymentPendingPage() {
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

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                <div className="flex justify-center mb-4">
                <div className="bg-yellow-100 p-4 rounded-full">
                    <Clock className="w-16 h-16 text-yellow-600" />
                </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Menunggu Pembayaran
                </h1>

                <p className="text-gray-600 mb-6">
                Pembayaran Anda sedang diproses. Silakan cek secara berkala atau kembali ke halaman pembayaran.
                </p>

                {/* Button kembali ke payment */}
                <button
                onClick={handleBackToPayment}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                >
                <ArrowLeft className="w-5 h-5" />
                Kembali ke Halaman Pembayaran
                </button>
            </div>
        </div>
    )
}