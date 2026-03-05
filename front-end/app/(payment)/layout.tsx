import type { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'Pembayaran Marketplace App',
  description: 'Pembayaran di MarketPlace mudah dan cepat',
}

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
        {children}
    </div>
  )
}