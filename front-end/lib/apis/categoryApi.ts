import api from "./axiosConfig";

export interface Category {
    id: number
    name: string
    description?: string
    slug: string
}

export interface CategoriesResponse {
    message: string
    count: number
    data: Category[]
}

export interface CategoryData {
    name: string 
    description: string
}

class CategoryApi {
    async getCategoryBySlug(slug: string): Promise<Category> {
        try {
            const response= await api.get<{data: Category}>(`/category/${slug}`)
            return response.data.data
            
        } catch (error) {
            console.error('Terjadi error saat mengambil data category by slug:', error)
            throw error
        }
    }

    async getAllCategories(): Promise<Category[]> {
        try {
            const response= await api.get<CategoriesResponse>('/category')
            return response.data.data
            
        } catch (error) {
            console.error('Terjadi error saat mengambil data categories:', error)
            throw error
        }
    }
    // admin
    async createCategory(categoryData: CategoryData): Promise<void> {
        try {
            await api.post('/category', categoryData)
            
        } catch (error) {
            console.error('Terjadi error saat menambah data kategori:', error)
            throw error
        }
    }
    async deleteCategory(categoryId: number): Promise<void> {
        try {
            await api.delete(`/category/${categoryId}`)
            
        } catch (error) {
            console.error('Terjadi error saat delete data kategori:', error)
            throw error
        }
    }
}

export default new CategoryApi()
