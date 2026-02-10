import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from '@/lib/providers/authProvider'
import CartProvider from '@/lib/providers/cartProvider'


export const metadata: Metadata = {
  title: 'Marketplace App',
  description: 'Belanja online mudah dan aman',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body >
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}