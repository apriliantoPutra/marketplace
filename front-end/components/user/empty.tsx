import { ArrowLeft, Package } from "lucide-react"
import Link from "next/link"

interface EmptyMessageProps {
    title: string
    message: string
    onBack?: string
}

export default function EmptyMessage({
    title, 
    message, 
    onBack
}: EmptyMessageProps) {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-purple-400" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {title}
                    </h3>
                    
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        {message}
                    </p>
                    
                    {onBack && (
                        <Link
                            href={onBack}
                            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Kembali
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}