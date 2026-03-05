import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
    title: string
    message: string
    onRetry?: ()=> void
    onBack?: () => void
}

export default function ErrorMessage({
    title, 
    message, 
    onRetry,
    onBack
}: ErrorStateProps) {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto text-center">
                    {/* Icon */}
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-12 h-12 text-red-400" />
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {title}
                    </h3>
                    
                    {/* Message */}
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        {message}
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {/* Back Button */}
                        { onBack && (
                            <button
                                onClick={onBack}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Kembali
                            </button>
                        )}
                        
                        {/* Retry Button */}
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Coba Lagi
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}