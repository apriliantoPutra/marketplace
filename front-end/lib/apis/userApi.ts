import { User, UserProfileResponse } from "./authApi"
import api from "./axiosConfig"

export interface UsersResponse {
    message: string
    count: number
    data: User[]
}

export interface CreateUserData {
    username: string
    email: string
    password: string
    role: 'admin' | 'user'
}
export interface UpdateUserData {
    username?: string
    email?: string
    password?: string
    role?: 'admin' | 'user'
}

class UserApi {
    // admin
    async getUsers(): Promise<User[]> {
        try {
            const response= await api.get<UsersResponse>('/user')
            return response.data.data

        } catch (error) {
            console.error('Terjadi error saat mengambil data users:', error)
            throw error
        }
    }
    async getUserDetail(userId: number): Promise<User> {
        try {
            const rensponse= await api.get<UserProfileResponse>(`/user/${userId}`)
            return rensponse.data.data
            
        } catch (error) {
            console.error('Terjadi error saat mengambil data User detail:', error)
            throw error
        }
    }
    async createUser(userData: CreateUserData): Promise<void> {
        try {
            await api.post('/user', userData)
            
        } catch (error) {
            console.error('Terjadi error saat menambah data user:', error)
            throw error
        }
    }
    async updateUser(userId: number, userData: UpdateUserData): Promise<void> {
        try {
            await api.put(`/user/${userId}`, userData)
            
        } catch (error) {
            console.error('Terjadi error saat update data user:', error)
            throw error
        }
    }
    async deleteUser(userId: number): Promise<void> {
        try {
            await api.delete(`/user/${userId}`)
            
        } catch (error) {
            console.error('Terjadi error saat delete data user:', error)
            throw error
        }
    }
}
export default new UserApi()