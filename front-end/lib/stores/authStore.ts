import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../apis/axiosConfig'
import { AuthState, User } from '../types/authType'
import authApi from '../apis/authApi'
import profilApi, { ProfilData } from '../apis/profilApi'

const checkHasProfile = (user: User | null): boolean => {
  if (!user || !user.profile) return false
  const profile = user.profile
    const requiredFields = ['full_name', 'address', 'phone'] as const

    return requiredFields.every(field => {
        const value = profile[field]
        return value && String(value).trim() !== ''
    })
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,
      error: null,

       // Computed properties
      isAuthenticated: () => !!get().token,
      hasProfile: () => checkHasProfile(get().user),
      isAdmin: () => get().user?.role === 'admin',

      // actions
      login: async (token: string)=> {
        try {
          set({ isLoading: true, error: null, token: null, user: null })
          console.log('🔵 LOGIN ACTION START - Token:', token)
    
          localStorage.setItem('token', token)
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`

          const userData = await authApi.getUserProfile()

          // update state
          set({
            token,
            user: userData,
            isLoading: false 
          })
          

        } catch (error) {
          set({ 
              error: error instanceof Error ? error.message : 'Login failed',
              isLoading: false 
            })
            throw error
        }
      },
      logout: async() => {
        try {
          set({
            token: null,
            user: null,
            error: null,
            isLoading: false
          })

          // clear localStorage
          localStorage.removeItem('token')
          localStorage.removeItem('auth-storage')

          // Remove axios header
          delete api.defaults.headers.common['Authorization']
        } catch (error) {
          set({
            token: null,
            user: null,
            error: null,
            isLoading: false
          })

          localStorage.removeItem('token')
          delete api.defaults.headers.common['Authorization']

          console.error('Logout error:', error)
        }
      },

      // create and update
      createProfile: async(profileData: ProfilData)=> {
        try {
          if (!get().isAuthenticated()) {
            throw new Error('Anda harus login untuk membuat profil')
          }
          if (get().hasProfile()) {
            throw new Error('Anda sudah memiliki profil. Gunakan edit profil untuk mengubah.')
          }

          set({isLoading: true, error: null})
          await profilApi.createProfil(profileData)

          await get().refreshUser()
          set({
            isLoading: false
          })
          
          console.log('✅ Profile created successfully')
        } catch (error) {
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'Gagal membuat profil'
          
          set({
            error: errorMessage,
            isLoading: false
          })
          throw error
        }
      },
      updateProfile: async(profileData: ProfilData)=> {
        try {
          if (!get().isAuthenticated()) {
            throw new Error('Anda harus login untuk membuat profil')
          }
          if (!get().hasProfile()) {
            throw new Error('Anda belum memiliki profil. Buat profil terlebih dahulu.')
          }

          set({isLoading: true, error: null})
          
          await profilApi.updateProfil(profileData)
          await get().refreshUser()
          set({
            isLoading: false
          })
          console.log('✅ Profile updated successfully')

        } catch (error) {
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'Gagal mengedit profil'
          
          set({
            error: errorMessage,
            isLoading: false
          })
          throw error
        }
      },
      refreshUser: async () => {
        try {
          const token = get().token
          if (!token) return
          
          set({ isLoading: true, error: null })
          
          const userData = await authApi.getUserProfile()
          
          set({
            user: userData,
            isLoading: false
          })
          
          console.log('✅ User data refreshed')
          
        } catch (error) {
          set({
            error: 'Gagal refresh data user',
            isLoading: false
          })
        }
      },

      setUser: (user: User | null) => {
        set({ user })
      },
            
      setLoading: (isLoading: boolean) => {
        set({ isLoading })
      },
            
      setError: (error: string | null) => {
        set({ error })
      },

  initialize: async () => {
    console.log('🔵 INITIALIZE START')
    const token = localStorage.getItem('token')
    console.log('Token from localStorage:', token)
    
    if(!token){
        console.log('🟡 No token found')
        set({token: null, user: null})
        return
    }

    try {
        set({ isLoading: true, error: null })
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        const userData = await authApi.getUserProfile()
        
        set({
            token,
            user: userData,
            isLoading: false
        })
        
        console.log('🟢 INITIALIZE END - State:', {
            token: get().token,
            user: get().user,
            isAuthenticated: get().isAuthenticated(),
            hasProfile: get().hasProfile(),
            isAdmin: get().isAdmin()
        })

    } catch (error) {
        console.log('🔴 INITIALIZE ERROR:', error)
        set({
            token: null,
            user: null,
            error: 'Session expired. Please login again.',
            isLoading: false
        })
        localStorage.removeItem('token')
        delete api.defaults.headers.common['Authorization']
    }
}
    }),
    {
      name: 'auth-storage',
      partialize: (state)=> ({
        token: state.token,
      })
    }
  )
)

export const useAuth = () => {
    const store = useAuthStore()
    
    return {
        // State
        token: store.token,
        user: store.user,
        isLoading: store.isLoading,
        error: store.error,
        
        // Computed 
        isAuthenticated: store.isAuthenticated(),
        hasProfile: store.hasProfile(),
        isAdmin: store.isAdmin(),
        
        // Actions
        createProfile: store.createProfile,
        updateProfile: store.updateProfile,
        refreshUser: store.refreshUser,

        login: store.login,
        logout: store.logout,
        setUser: store.setUser,
        setLoading: store.setLoading,
        setError: store.setError,
        initialize: store.initialize,
    }
}