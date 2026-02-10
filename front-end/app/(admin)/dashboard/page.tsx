// app/admin/page.tsx
import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'

export default function DashboardPage() {
  // Data statistik
  const stats = [
    {
      title: 'Total Produk',
      value: '1,254',
      icon: Package,
      change: '+12%',
      trending: 'up' as const,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Pengguna',
      value: '8,542',
      icon: Users,
      change: '+8%',
      trending: 'up' as const,
      color: 'bg-green-500',
    },
    {
      title: 'Total Pesanan',
      value: '3,124',
      icon: ShoppingCart,
      change: '+15%',
      trending: 'up' as const,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Pendapatan',
      value: 'Rp 45,2 Jt',
      icon: DollarSign,
      change: '+22%',
      trending: 'up' as const,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin</h1>
        <p className="text-gray-600 mt-2">Ringkasan performa marketplace Anda</p>
      </div>

      {/* Statistik Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.trending === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${stat.trending === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} dari bulan lalu
                    </span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}