import api from "./axiosConfig"

export interface Order {
    id: number
    total_amount: number
    shipping_full_name: string
    shipping_phone: string
    shipping_address: string
    status: string
    items_count: number
    total_items: number
    created_at: string
    payment_status: string
}
export interface OrderResponse {
    message: string
    count: number
    data: Order[]
}
interface OrderDetail {
    order_info: {
        id: number
        status: string
        total_amount: string | number
        shipping_info: {
            full_name: string
            phone: string
            address: string
        }
        notes?: string
        customer: {
            username: string
            email: string
        }
        created_at?: string
    }
    items: {
        id: number
        product_id: number
        product_name: string
        quantity: number
        price: number
        subtotal: number
        image_url: string | null
        slug: string
    }[]
    summary: {
        total_items: number
        total_quantity: number
    }
}

export interface OrderDetailResponse {
    message: string
    data: OrderDetail
}

export interface OrderStatusData {
    status: 'pending' | 'processing' | 'cancelled' | 'finished'
}

class OrderApi {
    async getOrdersByLogin(): Promise<OrderResponse> {
        try {
            const response= await api.get<OrderResponse>('/order/my-orders')
            return response.data

        } catch (error) {
            console.error('Terjadi error saat mengambil order:', error)
            throw error
        }
    }
    async getOrderById(orderId: number): Promise<OrderDetail> {
        try {
            const response= await api.get<OrderDetailResponse>(`/order/${orderId}`)
            return response.data.data

        } catch (error) {
            console.error('Terjadi error saat mengambil detail order:', error)
            throw error
        }
    }

    // admin
    async getOrders(): Promise<Order[]> {
        try {
            const response= await api.get<OrderResponse>(`order`)
            return response.data.data

        } catch (error) {
            console.error('Terjadi error saat mengambil order:', error)
            throw error
        }
    }
    
    async updateStatusOrder(orderId: number, orderStatusData: OrderStatusData): Promise<void> {
        try {
            await api.put<OrderResponse>(`order/${orderId}/status`, orderStatusData)

        } catch (error) {
            console.error('Terjadi error saat update status order:', error)
            throw error
        }
    }
}

export default new OrderApi()