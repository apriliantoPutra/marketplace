import api from "./axiosConfig";

export interface RegisterData {
    username: string
    email: string
    password: string
}
export interface LoginData {
    username: string
    password: string
}
export interface User {
    id: number
    username: string
    email: string
    role: string
    profile?: {
        full_name?: string
        address?: string
        phone?: string
        avatar_url?: string | null
    }
}
export interface AuthResponse {
    message: string
    tokenJWT: string
    data: User
}
export interface UserProfileResponse {
    message: string
    data: User
}
class AuthApi {
    async register(userData: RegisterData): Promise<AuthResponse> {
        try {
            const response= await api.post<AuthResponse>('/auth/register', userData)
            return response.data
        } catch (error) {
            console.error('Terjadi error saat register:', error)
            throw error
        }
    }
    async login(userData: LoginData): Promise<AuthResponse> {
        try {
            const response= await api.post<AuthResponse>('/auth/login', userData)
            return response.data
        } catch (error) {
            console.error('Terjadi error saat login:', error)
            throw error
        }
    }
    async getUserProfile(): Promise<User> {
        try {
            const rensponse= await api.get<UserProfileResponse>('/user/detail')
            return rensponse.data.data
            
        } catch (error) {
            console.error('Terjadi error saat mengambil data User&Profile:', error)
            throw error
        }
    }
    
}

export default new AuthApi()
