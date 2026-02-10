export interface CartSummary {
    total_items: number
    total_quantity: number
    total_amount: number
}
export interface CartItem {
    cart_id: number
    quantity: number
    product: {
        id: number
        name: string
        price: number
        stock: number
        image_url: string
        slug: string
        category: string            
    }
    subTotal: number
}

export interface CartState {
    // core state
    items: CartItem[]
    summary: CartSummary
    isLoading: boolean
    error: string | null

    // computed
    itemCount: () => number
    totalQuantity: () => number
    totalAmount: () => number
    isEmpty: () => boolean

    // action
    initialize: () => Promise<void>
    refresh: () => Promise<void>
    addItem: (productId: number) => Promise<void>
    updateItem: (cartId: number, action: 'increase' | 'decrease') => Promise<void>
    removeItem: (cartId: number) => Promise<void>
    clearCart: () => Promise<void>
    checkout: (checkoutData: CheckoutData) => Promise<CheckoutResponse>
    
    // Setters
    setLoading: (isLoading: boolean) => void
    setError: (error: string | null) => void
}

export interface CheckoutData {
    shipping_full_name: string
    shipping_phone: string
    shipping_address: string
    notes?: string | null
}

export interface CheckoutResponse {
    id: number
    total_amount: number
    items_count: number
    shipping_info: {
        full_name: string
        phone: string
        address: string
    }
}