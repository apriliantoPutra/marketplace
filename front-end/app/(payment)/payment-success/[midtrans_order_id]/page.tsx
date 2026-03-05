'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import paymentApi, { CheckPayment } from '@/lib/apis/paymentApi'
import Loading from '@/components/user/loading'
import ErrorMessage from '@/components/user/error'

export default function PaymentSuccessPage() {
    const router = useRouter()
    const [orderId, setOrderId] = useState('')
    const [order, setOrder] = useState<CheckPayment | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const path = window.location.pathname
        const id = path.split('/').pop() || ''
        setOrderId(id)
        
        fetchOrderDetails(id)
    }, [])

    const fetchOrderDetails = async (id: string) => {
        try {
            setLoading(true)
            const data = await paymentApi.checkPayment(id)
            
            setOrder(data)
            setError(null)
        } catch (error) {
            console.error('Error fetching order:', error)
            setError('Gagal memuat detail pesanan')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <Loading/>
    }

    if(error){
        return (<ErrorMessage title='Gagal Memuat data pembayaran' message={error}  />)
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                    {/* Icon Sukses */}
                    <div className="mb-6">
                        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Pembayaran Berhasil! 🎉
                    </h1>
                    
                    <p className="text-gray-600 mb-6">
                        Terima kasih, pesanan Anda sedang diproses
                    </p>

                    {/* Info Order - Data dari PaymentAPI */}
                    {order && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                            <p className="text-sm text-gray-600 mt-1">
                                <span className="font-semibold">Total:</span> Rp {parseInt(order.total_amount).toLocaleString('id-ID')}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                                <span className="font-semibold">Metode:</span> {order.payment_method || '-'}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                                <span className="font-semibold">Status:</span> 
                                <span className="text-green-600 font-semibold ml-1">
                                    {order.status === 'processing' ? 'Diproses' : order.status}
                                </span>
                            </p>
                            {order.payment_expiry && (
                                <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-semibold">Waktu Bayar:</span> 
                                    {new Date(order.payment_expiry).toLocaleString('id-ID')}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Tombol Aksi */}
                    <div className="space-y-3">
                        <Link href={`/orders/${order?.id}`}>
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 mb-2">
                                Lihat Detail Pesanan
                            </button>
                        </Link>
                        
                        <Link href="/products">
                            <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200">
                                Belanja Lagi
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}