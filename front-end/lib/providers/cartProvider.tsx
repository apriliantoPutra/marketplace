// providers/CartProvider.tsx
'use client'

import { useEffect } from 'react'
import { useAuth } from '../stores/authStore'
import { useCartStore } from '../stores/cartStore'

interface CartProviderProps {
    children: React.ReactNode
}

export default function CartProvider({ children }: CartProviderProps) {
    const { isAuthenticated, isAdmin } = useAuth()
    const initialize = useCartStore(state => state.initialize)
    
    useEffect(() => {
        // Hanya initialize cart jika user adalah regular user (bukan admin)
        if (isAuthenticated && !isAdmin) {
            console.log('🛒 Initializing cart for regular user')
            initialize()
        } else {
            // Jika bukan user atau admin, clear cart
            useCartStore.setState({
                items: [],
                summary: { total_items: 0, total_quantity: 0, total_amount: 0 }
            })
        }
    }, [isAuthenticated, isAdmin, initialize])
    
    return <>{children}</>
}