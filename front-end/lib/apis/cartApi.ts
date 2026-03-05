import { CheckoutData, CheckoutResponse } from "../types/cartType";
import api from "./axiosConfig";

export interface Cart {
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
    },
    subTotal: number
}
export interface responseGetCart {
    message: string
    count: number,
    summary: {
        total_items: number
        total_quantity: number
        total_amount: number
    },
    data: Cart[]
}



class CartApi{
    async getCartByLogin(): Promise<responseGetCart> {
        try {
            const response= await api.get<responseGetCart>('/cart')
            return response.data
            
        } catch (error) {
            console.error('Terjadi error saat mengambil data cart:', error)
            throw error
        }
    }
    async createCart(product_id: number): Promise<void> {
        try {
            await api.post('/cart', {product_id})
            
        } catch (error) {
            console.error('Terjadi error saat membuat data cart:', error)
            throw error
        }
    }
    async updateCart(cartId: number, action: 'increase' | 'decrease'): Promise<void> {
        try {
            if(!action || !['increase', 'decrease'].includes(action) ){
                throw new Error('Action harus "increase" atau "decrease"')
            }

            await api.put(`/cart/${cartId}`, {action})
            
        } catch (error) {
            console.error('Terjadi error saat update data cart:', error)
            throw error
        }
    }
    async deleteCart(cartId: number,): Promise<void> {
        try {
            await api.delete(`/cart/${cartId}`)
            
        } catch (error) {
            console.error('Terjadi error saat menghapus data cart:', error)
            throw error
        }
    }
    async deleteAllCart(): Promise<void> {
        try {
            await api.delete(`/cart`)
            
        } catch (error) {
            console.error('Terjadi error saat menghapus semua data cart:', error)
            throw error
        }
    }
    async checkoutCart(checkOut: CheckoutData): Promise<CheckoutResponse> {
        try {
            const response= await api.post(`/cart/checkout`, checkOut)
            return response.data.payment
            
        } catch (error) {
            console.error('Terjadi error saat checkout semua data cart:', error)
            throw error
        }
    }

}

export default new CartApi()