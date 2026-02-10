// components/admin/AdminNavbar.tsx
import { Bell, Search, User } from 'lucide-react'

export default function AdminNavbar() {
  return (
    <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-800">
              Marketplace Admin
            </h1>
          </div>
          <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-gray-700 font-medium">Admin</span>
        </button>
        </div>
      </div>
    </nav>
  )
}