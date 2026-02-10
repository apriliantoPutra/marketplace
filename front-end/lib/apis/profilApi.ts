import api from "./axiosConfig"

export interface ProfilData {
    full_name: string,
    address: string,
    phone: string,
    avatar?: File | null
}

class ProfilApi {
    async createProfil(profilData: ProfilData): Promise<void> {
        try {
            const formData= new FormData()

            formData.append('full_name', profilData.full_name)
            formData.append('address', profilData.address)
            formData.append('phone', profilData.phone)

            if(profilData.avatar) {
                formData.append('avatar', profilData.avatar)
            }

            await api.post('/profil', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

        } catch (error) {
            console.error('Error creating profile:', error)
            throw error
        }
    }
    async updateProfil(profilData: ProfilData): Promise<void> {
        try {
            const formData= new FormData()

            if(profilData.full_name) {
                formData.append('full_name', profilData.full_name)
            }
            if(profilData.address) {
                formData.append('address', profilData.address)
            }
            if(profilData.phone) {
                formData.append('phone', profilData.phone)
            }
            if(profilData.avatar) {
                formData.append('avatar', profilData.avatar)
            }

            await api.put(`/profil`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

        } catch (error) {
            console.error('Error creating profile:', error)
            throw error
        }
    }
}
export default new ProfilApi()