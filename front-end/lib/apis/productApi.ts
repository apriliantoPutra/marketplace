import api from "./axiosConfig";

export interface Product {
    id: number
    name: string
    description: string
    price: number
    stock: number
    slug: string
    image_url: string | null
    category: {
        id: number
        name: string
    }
}
export interface ProductsResponse{
    message: string
    count: number
    data: Product[]
}

export interface ProductData {
    name: string 
    description: string 
    price: number 
    stock: number 
    category_id: number
    product? : File | null
}

class ProductApi {
    async getProducts(): Promise<Product[]> {
        try {
            const response= await api.get<ProductsResponse>('/product')
            return response.data.data

        } catch (error) {
            console.error('Terjadi error saat mengambil data product:', error)
            throw error
        }
    }

    async getProductBySlug(slug: string): Promise<Product> {
        try {
            const response= await api.get<{data: Product}>(`/product/${slug}`)
            return response.data.data

        } catch (error) {
            console.error('Terjadi error saat mengambil data product:', error)
            throw error
        }
    }

    // admin
    async createProduct(productData: ProductData): Promise<void> {
        try {
            const formData= new FormData()

            formData.append('name', productData.name)
            formData.append('description', productData.description)
            formData.append('price', productData.price.toString())
            formData.append('stock', productData.stock.toString())
            formData.append('category_id', productData.category_id.toString())

            if(productData.product) {
                formData.append('product', productData.product)
            }
            await api.post('/product', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            
        } catch (error) {
            console.error('Terjadi error saat menambah data product:', error)
            throw error
        }
    }
    async updateProduct(productId: number, productData: ProductData): Promise<void> {
        try {
            const formData= new FormData()

            if(productData.name) {
                formData.append('name', productData.name)
            }
            if(productData.description) {
                formData.append('description', productData.description)
            }
            if(productData.price) {
                formData.append('price', productData.price.toString())
            }
            if(productData.stock) {
                formData.append('stock', productData.stock.toString())
            }
            if(productData.category_id) {
                formData.append('category_id', productData.category_id.toString())
            }

            if(productData.product) {
                formData.append('product', productData.product)
            }

            await api.put(`/product/${productId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            
        } catch (error) {
            console.error('Terjadi error saat update data product:', error)
            throw error
        }
    }
    async deleteProduct(productId: number): Promise<void> {
        try {
            await api.delete(`/product/${productId}`)
            
        } catch (error) {
            console.error('Terjadi error saat delete data product:', error)
            throw error
        }
    }
}

export default new ProductApi()