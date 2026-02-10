import type { Metadata } from 'next'
import Navbar from '@/components/user/navbar'
import Footer from '@/components/user/footer'

export const metadata: Metadata = {
  title: 'Marketplace App',
  description: 'Selamat berbelanja di Marketplace App',
}
export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`min-h-screen flex flex-col bg-gray-100 text-gray-800`} >
        <Navbar/>
        <main className='container mx-auto px-4 py-16'>
            {children}
        </main>
        <Footer/>
    </div>
  )
}