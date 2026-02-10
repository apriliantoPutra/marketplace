'use client'

import { useEffect, useState } from 'react'
import AdminNavbar from '@/components/admin/navbar'
import AdminSidebar from '@/components/admin/sidebar'
import { useAuth } from '@/lib/stores/authStore'
import { useRouter } from 'next/navigation'
import Loading from '@/components/user/loading'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const {isAuthenticated, isAdmin, isLoading}= useAuth()
  const router= useRouter()

  // cek apakah terautentikasi dan admin
  useEffect(()=> {
    if(!isLoading) {
      if(!isAuthenticated) {
        console.log('❌ Not authenticated, redirecting to login')
        router.push('/login')
        return
      }

      if(!isAdmin) {
        console.log('❌ Not admin, redirecting to home')
        router.push('/')
        return
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, router])

  if (isLoading) {
    return <Loading />
  }
  
   // Jika tidak terautentikasi atau bukan admin, jangan render layout
  if(!isAuthenticated || !isAdmin) {
    return null
  }

  return (
    <>
      <AdminNavbar />
      <div className="flex pt-16">
        <AdminSidebar 
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className={`flex-1 p-6 transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          {children}
        </main>
      </div>
    </>
  )
}