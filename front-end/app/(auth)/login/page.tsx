'use client'
import { useState } from "react"
import { useRouter } from "next/navigation" 
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { useAuth, useAuthStore } from "@/lib/stores/authStore"
import authApi from "@/lib/apis/authApi"
import { AxiosError } from "axios"

export default function LoginPage(){
    const router= useRouter()
    const [showPassword, setShowPassword]= useState(false)
    const [formData, setFormData]= useState({
        username: '',
        password: ''
    })

    // state auth store
    const {login, isLoading, error, setLoading, setError}= useAuth()

    const handleSubmit= async(e: React.FormEvent)=> {
        e.preventDefault();
        setLoading(true)
        setError(null)

        try {
            const response= await authApi.login(formData)
            // simpan token dan user ke store
            await login(response.tokenJWT)

            if(response.data.role == 'admin'){
                router.push('/dashboard')    
            } else {
                router.push('/') 
            }
        } catch (err) {
            if (err instanceof AxiosError) {
                setError(err.response?.data?.error || 'Login failed');
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Login failed');
            }
        } finally {
            setLoading(false)
        }
    }
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value,
        });

        if(error) {
            setError(null)
        }
    };

    return(
        <div className="bg-white rounded-2xl shadow-2xl py-8 px-4 w-full max-w-md">
            <div className="flex justify-center mb-2">
                <Link 
                    href="/" 
                    className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                    <span className="text-white font-bold text-4xl">M</span>
                </Link>
            </div>
            <h1 className="text-3xl font-bold text-purple-700 text-center mb-2">Login</h1>
            <form className="space-y-4" onSubmit={handleSubmit}>
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}
                
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input id="username" name="username" value={formData.username} onChange={handleChange} type="text" placeholder="Masukkan username" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div className="relative">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input id="password" name="password" value={formData.password} onChange={handleChange}
                        type={showPassword ? "text" : "password"} placeholder="Masukkan password"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-8 text-gray-500 hover:text-purple-600"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition cursor-pointer">
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <p className="text-center text-sm text-gray-600 mt-6">
                Belum punya akun? <Link href="/register" className="text-purple-400 font-medium hover:underline" >Daftar</Link>
            </p>
        </div>
    )
}