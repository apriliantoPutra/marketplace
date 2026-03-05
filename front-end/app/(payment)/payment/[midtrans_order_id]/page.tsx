'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { useRouter, useSearchParams } from 'next/navigation'
import paymentApi, { CheckPayment } from '@/lib/apis/paymentApi'

export default function PaymentPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // ambil data dari url
    const midtransOrderId = window.location.pathname.split('/').pop() || ''
    const token = searchParams.get('token')
    const url = searchParams.get('url')

    const [countdown, setCountdown] = useState('')
    const [paymentStatus, setPaymentStatus] = useState('pending')
    const [isLoading, setIsLoading] = useState(true)
    const [orderData, setOrderData] = useState<CheckPayment | null>(null)

    // load snap midtrans
    useEffect(()=> {
        const script = document.createElement('script')
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
        script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '')

        script.onload = () => {
            setIsLoading(false)  // Script sudah siap
            console.log('✅ Snap Midtrans loaded')
        }
        document.body.appendChild(script)
        return () => {
            document.body.removeChild(script)
        }
    }, [])

    // hitung expired
    useEffect(() => {
        // Hitung expired (1 jam dari sekarang)
        const expiryTime = new Date()
        expiryTime.setHours(expiryTime.getHours() + 1)

        const interval = setInterval(() => {
            const now = new Date()
            const diff = expiryTime.getTime() - now.getTime()

            if (diff <= 0) {
                setCountdown('Waktu habis')
                clearInterval(interval)
            } else {
                const minutes = Math.floor(diff / 60000)
                const seconds = Math.floor((diff % 60000) / 1000)
                setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    // fungsi buka snap
    const handlePay = () => {
        if (!token) {
            alert('Token pembayaran tidak ditemukan')
            return
        }
        window.snap.pay(token, {
            onSuccess: function(result) {
                console.log('✅ Payment success:', result)
                setPaymentStatus('success')
                
                // Redirect ke halaman sukses
                setTimeout(() => {
                    router.push(`/payment-success/${midtransOrderId}`)
                }, 2000)
            },
            onPending: function(result) {
                console.log('⏳ Payment pending:', result)
                setPaymentStatus('pending')
                alert('Pembayaran sedang diproses. Silakan cek status secara berkala.')
            },
            onError: function(result) {
                console.log('❌ Payment error:', result)
                setPaymentStatus('error')
                alert('Pembayaran gagal. Silakan coba lagi.')
            },
            onClose: function() {
                console.log('❌ Popup ditutup tanpa menyelesaikan pembayaran')
                alert('Anda menutup halaman pembayaran. Silakan klik "Bayar Sekarang" jika ingin melanjutkan.')
            }
        })
    }

    const checkPaymentStatus = async ()=> {
        try {
            setIsLoading(true)
            const data = await paymentApi.checkPayment(midtransOrderId)
            
            if(data.payment_status === 'paid') {
                router.push(`/payment-success/${midtransOrderId}`)
            } else {
                alert(`Status pembayaran: ${data.payment_status}`)
            }
            
        } catch (error) {
             console.error('Error checking status:', error)
            alert('Gagal mengecek status pembayaran')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <Script 
                src="https://app.sandbox.midtrans.com/snap/snap.js"
                data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
                strategy="lazyOnload"
                onLoad={() => setIsLoading(false)}
            />

            <div className="container mx-auto px-4 max-w-2xl">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold mb-6 text-center">
                        Selesaikan Pembayaran
                    </h1>

                    {/* Tampilkan total_amount dari API jika ada */}
                    {orderData && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <p className="text-sm text-gray-600">
                                <span className="font-semibold">Total:</span> Rp {parseInt(orderData.total_amount).toLocaleString('id-ID')}
                            </p>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="text-center py-4">
                            <p className="text-gray-600">Memuat halaman pembayaran...</p>
                        </div>
                    )}

                    {/* Info Order */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800">
                            <span className="font-semibold">Order ID:</span> {midtransOrderId}
                        </p>
                        <p className="text-sm text-blue-800 mt-1">
                            <span className="font-semibold">Sisa Waktu:</span> 
                            <span className={
                                countdown === 'Waktu habis' 
                                    ? 'text-red-600 font-bold' 
                                    : 'text-green-600'
                            }>
                                {' '}{countdown}
                            </span>
                        </p>
                    </div>

                    {/* Tombol Bayar */}
                    {countdown !== 'Waktu habis' && !isLoading && (
                        <button
                            onClick={handlePay}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg mb-4 transition duration-200"
                        >
                            Bayar Sekarang
                        </button>
                    )}

                    {/* Tombol Cek Status Manual (pakai PaymentAPI) */}
                    <button
                        onClick={checkPaymentStatus}
                        disabled={isLoading}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg mb-4 transition duration-200 disabled:bg-gray-400"
                    >
                        {isLoading ? 'Memuat...' : 'Cek Status Pembayaran'}
                    </button>

                    {/* Link Alternatif */}
                    {url && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800 mb-2">
                                Jika popup bayar tidak muncul, klik link berikut:
                            </p>
                            <a 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm break-all"
                            >
                                {url}
                            </a>
                        </div>
                    )}

                    {/* Status Message */}
                    {paymentStatus === 'success' && (
                        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                            ✅ Pembayaran berhasil! Mengalihkan...
                        </div>
                    )}
                    
                    {paymentStatus === 'error' && (
                        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            ❌ Pembayaran gagal. Silakan coba lagi.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}