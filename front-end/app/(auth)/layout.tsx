import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

export const metadata: Metadata = {
  title: 'Daftar ke Marketplace App',
  description: 'Daftarkan dirimu ke Marketplace App',
}
const inter = Inter({ subsets: ['latin'] })
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${inter.className} min-h-screen flex items-center justify-center bg-purple-300`} >
        {children}
    </div>
  )
}