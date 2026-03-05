'use client'

import EmptyMessage from "@/components/user/empty"
import ErrorMessage from "@/components/user/error"
import Loading from "@/components/user/loading"
import { useAuth } from "@/lib/stores/authStore"
import { useCart } from "@/lib/stores/cartStore"
import { formatPrice } from "@/lib/utils/formatters"
import { AxiosError } from "axios"
import { AlertCircle, ArrowLeft, CheckCircle, FileText, MapPin, Package, Phone, ShoppingBag, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"

export default function KonfirmasiPage() {
    const router= useRouter()
    const {user: userData, isLoading: userLoading, error: userError}= useAuth()
    const {items: cartData, summary, isLoading: cartLoading, error: cartError, refresh, checkout}= useCart()
    
    // load data cart
    useEffect(()=> {
        refresh()
    }, [refresh])

    // form state
    const [formData, setFormData]= useState({
        shipping_full_name: '',
        shipping_phone: '',
        shipping_address: '',
        notes: '' 
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [submitSuccess, setSubmitSuccess] = useState(false)

    // initialize form with user data
    useEffect(()=> {
        if(userData?.profile) {
            setFormData({
                shipping_full_name: userData.profile.full_name || '',
                shipping_phone: userData.profile.phone || '',
                shipping_address: userData.profile.address || '',
                notes: '' 
            })
        }
    }, [userData])

    // handle form input
    const handleInputChange= (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> {
        const {name, value}= e.target
        setFormData(prev=> ({
            ...prev,
            [name]: value
        }))

        // Clear errors when user starts typing
        if (submitError) setSubmitError(null)
    }

    const validateForm = () => {
        if (!formData.shipping_full_name.trim()) {
        return 'Nama lengkap penerima harus diisi'
        }
        if (!formData.shipping_phone.trim()) {
        return 'Nomor telepon harus diisi'
        }
        if (!formData.shipping_address.trim()) {
        return 'Alamat pengiriman harus diisi'
        }
        if (formData.shipping_phone.length < 10) {
        return 'Nomor telepon minimal 10 digit'
        }
        return null
    }

    const handleSubmit= async(e: FormEvent)=> {
        e.preventDefault()

        const validationError = validateForm()
        if (validationError) {
            setSubmitError(validationError)
            return
        }

        // Check if cart is empty
        if (cartData.length === 0) {
            setSubmitError('Keranjang belanja kosong')
            return
        }
        try {
            setIsSubmitting(true)
            setSubmitError(null)

            const checkoutData= {
                shipping_full_name: formData.shipping_full_name.trim(),
                shipping_phone: formData.shipping_phone.trim(),
                shipping_address: formData.shipping_address.trim(),
                notes: formData.notes.trim() || null
            }
            const paymentData = await checkout(checkoutData)
            
            setSubmitSuccess(true)
            const queryString = new URLSearchParams({
                token: paymentData.payment_token,
                url: paymentData.payment_url
            }).toString()
            router.push(`/payment/${paymentData.midtrans_order_id}?${queryString}`)

        } catch (err) {
            if (err instanceof AxiosError) {
                setSubmitError(err.response?.data?.error || 'Terjadi kesalahan saat checkout');
            } else if (err instanceof Error) {
                setSubmitError(err.message);
            } else {
                setSubmitError('Terjadi kesalahan saat checkout');
        }} finally {
            setIsSubmitting(false)
        }
    }

    if(userLoading || cartLoading) {
        return <Loading/>
    }
    if (userError || cartError) {
        return (
            <ErrorMessage 
                title="Terjadi Kesalahan" 
                message={userError || cartError || 'Kesalahan pada data user/ cart'} 
                onRetry={() => refresh()}
            />
        )
    }
    if(cartData.length === 0 && !cartLoading) {
        return (
            <EmptyMessage
                title="Keranjang Belanja Kosong" 
                message="Tidak ada item untuk dikonfirmasi. Tambahkan produk ke keranjang terlebih dahulu."
                onBack='/products' />
        )
    }
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            {/* Success Overlay */}
            {submitSuccess && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center animate-fade-in">
                    <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Pesanan Berhasil!
                    </h2>
                    <p className="text-gray-600 mb-6">
                    Pesanan Anda sedang diproses. Anda akan diarahkan ke halaman detail pesanan.
                    </p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                </div>
                </div>
            )}

            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <Link
                    href="/products/cart"
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">
                    Konfirmasi Pesanan
                    </h1>
                </div>
                <p className="text-gray-600">
                    Periksa dan konfirmasi detail pesanan Anda sebelum melanjutkan
                </p>
                </div>

                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column - Order Details */}
                <div className="lg:w-2/3">
                    {/* Shipping Information Form */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">
                        Informasi Pengiriman
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Error Message */}
                        {submitError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p>{submitError}</p>
                        </div>
                        )}

                        <div className="space-y-6">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nama Lengkap Penerima <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                name="shipping_full_name"
                                value={formData.shipping_full_name}
                                onChange={handleInputChange}
                                required
                                placeholder="Masukkan nama lengkap penerima"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                            />
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nomor Telepon <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="tel"
                                name="shipping_phone"
                                value={formData.shipping_phone}
                                onChange={handleInputChange}
                                required
                                placeholder="Masukkan nomor telepon yang aktif"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                            />
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                            Alamat Pengiriman <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <textarea
                                name="shipping_address"
                                value={formData.shipping_address}
                                onChange={handleInputChange}
                                required
                                rows={4}
                                placeholder="Masukkan alamat lengkap pengiriman (termasuk RT/RW, kecamatan, kota)"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none transition"
                            />
                            </div>
                        </div>

                        {/* Notes (Optional) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                            Catatan Tambahan (Opsional)
                            </label>
                            <div className="relative">
                            <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="Contoh: Tinggal di rumah warna biru, dekat masjid, dll."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none transition"
                            />
                            </div>
                        </div>
                        </div>
                    </form>
                    </div>

                    {/* Order Items List */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-purple-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">
                        Detail Pesanan ({summary.total_items} item)
                        </h2>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-4">
                        {cartData.map((item, index) => (
                        <div 
                            key={item.cart_id} 
                            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                        >
                            {/* Item Number */}
                            <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                            </div>

                            {/* Product Image */}
                            <div className="w-20 h-20 flex-shrink-0">
                            <div 
                                className="w-full h-full bg-cover bg-center rounded-lg"
                                style={{ 
                                backgroundImage: `url(${item.product.image_url})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                                }}
                            />
                            </div>

                            {/* Product Info */}
                            <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                <h3 className="font-bold text-gray-900 mb-1">
                                    {item.product.name}
                                </h3>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                    {item.product.category}
                                    </span>
                                    <span className="text-gray-600">
                                    {item.quantity} × {formatPrice(item.product.price)}
                                    </span>
                                </div>
                                </div>
                                <div className="text-lg font-bold text-purple-600">
                                {formatPrice(item.subTotal)}
                                </div>
                            </div>
                            </div>
                        </div>
                        ))}
                    </div>
                    </div>
                </div>

                {/* Right Column - Order Summary */}
                <div className="lg:w-1/3">
                    <div className="sticky top-6 space-y-6">
                    {/* Order Summary Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">
                        Ringkasan Pesanan
                        </h2>

                        {/* Order Details */}
                        <div className="space-y-4 mb-6">
                        {/* Item Count */}
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Jumlah Produk</span>
                            <span className="font-medium">{summary.total_items} item</span>
                        </div>

                        {/* Total Quantity */}
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Kuantitas</span>
                            <span className="font-medium">{summary.total_quantity} unit</span>
                        </div>                    

                        {/* Total Price */}
                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                            <span className="text-xl font-bold text-gray-900">Total Pembayaran</span>
                            <span className="text-2xl font-bold text-purple-600">
                            {formatPrice(summary.total_amount)}
                            </span>
                        </div>
                        </div>

                        {/* Submit Button */}
                        <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || cartLoading}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                        {isSubmitting ? (
                            <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Memproses...</span>
                            </>
                        ) : (
                            <>
                            <CheckCircle className="w-5 h-5" />
                            <span>Konfirmasi & Bayar Sekarang</span>
                            </>
                        )}
                        </button>

                        
                    </div>

                    {/* User Information Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">
                        Informasi Akun
                        </h2>
                        <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                            <p className="text-sm text-gray-500">Username</p>
                            <p className="font-medium">{userData?.username || '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Phone className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{userData?.email || '-'}</p>
                            </div>
                        </div>
                        </div>
                    </div>

                    {/* Back to Cart Link */}
                    <Link
                        href="/products/cart"
                        className="flex items-center justify-center gap-2 py-3 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Kembali ke Keranjang
                    </Link>
                    </div>
                </div>
                </div>
            </div>    
        </div>
    )
}