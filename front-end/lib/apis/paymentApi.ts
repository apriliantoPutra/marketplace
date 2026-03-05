import api from "./axiosConfig"

export interface CheckPayment {
    id: string,
    total_amount: string,
    status: string, 
    payment_method: string,
    payment_status: string,
    payment_expiry: string
}

class PaymentAPi {
    async checkPayment(midtransOrderId: string): Promise<CheckPayment>{
        try {
            const response= await api.get(`/payment/status/${midtransOrderId}`)
            return response.data.data

        } catch (error) {
            console.error('Terjadi error saat mengecek payment:', error)
            throw error
        }
    }
}

export default new PaymentAPi()