import { ProfilData } from "../apis/profilApi"

export interface UserProfile {
    full_name?: string
    address?: string
    phone?: string
    avatar_url?: string | null
}

export interface User {
    id: number
    username: string
    email: string
    role: string
    profile?: UserProfile
}

export interface AuthState {
    // Core state
    token: string | null
    user: User | null
    isLoading: boolean
    error: string | null
    
    // Actions
    login: (token: string) => Promise<void>
    logout: () => Promise<void>
    createProfile: (profileData: ProfilData) => Promise<void>
    updateProfile: (profileData: ProfilData) => Promise<void>
    refreshUser: () => Promise<void>

    setUser: (user: User | null) => void
    setLoading: (isLoading: boolean) => void
    setError: (error: string | null) => void
    initialize: () => Promise<void>
    
    // Computed (function)
    isAuthenticated: () => boolean
    hasProfile: () => boolean
    isAdmin: () => boolean
}