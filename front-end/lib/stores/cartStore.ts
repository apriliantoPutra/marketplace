import { persist } from 'zustand/middleware';
import {create} from 'zustand'
import cartApi from '../apis/cartApi';
import { CartState, CartItem, CartSummary, CheckoutData } from '../types/cartType';

const initialSummary: CartSummary = {
    total_items: 0,
    total_quantity: 0,
    total_amount: 0
}

export const useCartStore= create<CartState>()(
    persist(
        (set, get)=> ({
            items: [],
            summary: initialSummary,
            isLoading: false,
            error: null,

            // Computed properties
            itemCount: () => get().items.length,
            totalQuantity: () => get().summary?.total_quantity || 0, 
            totalAmount: () => get().summary?.total_amount || 0,    
            isEmpty: () => get().items.length === 0,

            // action
            initialize: async() => {
                try {
                    set({isLoading: true, error: null})

                    const response= await cartApi.getCartByLogin()
                    set({
                        items: response.data,
                        summary: response.summary,
                        isLoading: false
                    })
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to load cart',
                        isLoading: false
                    })
                }
            },
            refresh: async() => {
                try {
                    set({ isLoading: true })
                    
                    const response = await cartApi.getCartByLogin()
                    set({
                        items: response.data,
                        summary: response.summary,
                        isLoading: false
                    })
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to refresh cart',
                        isLoading: false
                    })
                }
            },
            addItem: async(productId: number)=> {
                try {
                    set({isLoading: true, error: null})

                    await cartApi.createCart(productId)
                    await get().refresh()
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to add item',
                        isLoading: false
                    })
                    throw error
                }
            },
            updateItem: async(cartId: number, action: 'increase' | 'decrease')=> {
                try {
                    set({isLoading: true})

                    await cartApi.updateCart(cartId, action)
                    await get().refresh()
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to update item',
                        isLoading: false
                    })
                    throw error
                }
            },
            removeItem: async(cartId: number)=> {
                try {
                    set({isLoading: true})

                    await cartApi.deleteCart(cartId)
                    await get().refresh()
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to delete item',
                        isLoading: false
                    })
                    throw error
                }
            },
            clearCart: async()=> {
                try {
                    set({isLoading: true})

                    await cartApi.deleteAllCart()
                    set({
                        items: [],
                        summary: initialSummary,
                        isLoading: false
                    })

                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to delete all item',
                        isLoading: false
                    })
                    throw error
                }
            },
            checkout: async(checkoutData: CheckoutData)=> {
                try {
                    set({isLoading: true})

                    const response= await cartApi.checkoutCart(checkoutData)

                    set({
                        items: [],
                        summary: initialSummary,
                        isLoading: false
                    })
                    return response
                } catch (error) {
                    set({
                        error: error instanceof Error ? error.message : 'Failed to checkout all item',
                        isLoading: false
                    })
                    throw error
                }
            },

            // setters
            setLoading: (isLoading: boolean) => {
                set({ isLoading })
            },
            
            setError: (error: string | null) => {
                set({ error })
            }
        }),
        {
            name: 'cart-storage',
            // Hanya simpan items dan summary
            partialize: (state) => ({
                items: state.items,
                summary: state.summary
            })
        }
    )
)

// Hook untuk mudah digunakan
export const useCart = () => {
    const store = useCartStore()
    
    return {
        // State
        items: store.items,
        summary: store.summary,
        isLoading: store.isLoading,
        error: store.error,
        
        // Computed
        itemCount: store.itemCount(),
        totalQuantity: store.totalQuantity(),
        totalAmount: store.totalAmount(),
        isEmpty: store.isEmpty(),
        
        // Actions
        initialize: store.initialize,
        refresh: store.refresh,
        addItem: store.addItem,
        updateItem: store.updateItem,
        removeItem: store.removeItem,
        clearCart: store.clearCart,
        checkout: store.checkout,
        setLoading: store.setLoading,
        setError: store.setError
    }
}
