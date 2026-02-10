'use client'

import { useEffect, useState } from "react"
import { useAuth } from "../stores/authStore"
import Loading from "@/components/user/loading"
import { useRouter } from "next/navigation"

interface AuthProviderProps {
    children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
    const router= useRouter()
    const { initialize, isLoading, isAuthenticated, isAdmin } = useAuth()
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        const init = async () => {
            await initialize()
            setIsInitialized(true)
        }
        
        init()
    }, [initialize])

    if(!isInitialized || isLoading) {
        return <Loading/>
    }
    
    return <>{children}</>
}