'use client'

import { useState, useEffect } from 'react'
import Link from "next/link";
import {ShoppingCart, Menu, X, User, LogOut, ShoppingBag} from 'lucide-react'
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/stores/authStore';
import Loading from './loading';
import { useCart } from '@/lib/stores/cartStore';
import { formatPrice } from '@/lib/utils/formatters';

export default function Navbar(){
    const [isMenuOpen, setIsMenuOpen]= useState(false)
    const router= useRouter()

    // hook dari auth store
    const {user, isAuthenticated, isLoading, logout}= useAuth()
    // hook dari cart store
    const {items: cartItems, summary: cartSummary, isLoading: cartLoading, totalQuantity}= useCart()
     const safeCartSummary = cartSummary || {
        total_items: 0,
        total_quantity: 0,
        total_amount: 0
    }

    const handleLogout= async()=> {
      try {
        await logout()
        setIsMenuOpen(false)
        
        router.push('/login')
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    if(isLoading) {
      return (<Loading/>)
    }
    return (
      <nav className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                <span className="text-purple-700 font-bold text-2xl">M</span>
              </div>
              <h1 className="text-2xl font-bold tracking-wider hidden sm:block">
                <span className="text-white">Market</span>
                <span className="text-purple-200">Place</span>
              </h1>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="/products" 
                className="hover:text-purple-200 font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
              >
                Products
              </Link>
              {isAuthenticated ? (
                <>
                  <Link 
                      href="/profil" 
                      className="hover:text-purple-200 font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
                    >
                      Profil {user?.username}
                  </Link>
                  <Link 
                      href="/orders" 
                      className="hover:text-purple-200 font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
                    >
                      Order
                  </Link>
                  <button onClick={handleLogout} className='className="hover:text-purple-200 font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors duration-200"'>
                    Logout
                  </button>
                </>
              ) : (
                  <Link 
                    href="/login" 
                    className="hover:text-purple-200 font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
                    >
                      Login
                  </Link>
              )}
              {isAuthenticated && user?.role != 'admin' && (
                <>
                  {/* Cart with Dropdown */}
                  <div className="relative group">
                    <button className="flex items-center gap-2 bg-purple-900 hover:bg-purple-800 px-4 py-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                      <ShoppingCart className="w-5 h-5" />
                      <span className="font-medium">Cart</span>
                      <span className="absolute -top-2 -right-2 bg-yellow-400 text-purple-900 font-bold text-xs rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                        {cartLoading ? '...' : totalQuantity}
                      </span>
                    </button>
                    
                    {/* Cart Dropdown */}
                    <div className="absolute right-0 mt-2 w-80 bg-white text-gray-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <p className="font-bold text-lg text-gray-900">Your Cart</p>
                          <span className="text-sm text-purple-600 font-semibold">{safeCartSummary.total_items} items</span>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {cartItems.length > 0 ? (
                            <>
                              {/* Tampilkan 3 item pertama */}
                              {cartItems.slice(0, 3).map((item) => (
                                <div key={item.cart_id} className="flex items-center gap-3 py-3 border-b">
                                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                                    {item.product.image_url ? (
                                      <img 
                                        src={item.product.image_url} 
                                        alt={item.product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                        <ShoppingCart className="w-6 h-6 text-gray-500" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{item.product.name}</p>
                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                  </div>
                                  <p className="font-bold text-purple-600">
                                    {formatPrice(item.subTotal)}
                                  </p>
                                </div>
                              ))}
                              
                              {/* KETERANGAN JIKA ITEM LEBIH DARI 3 */}
                              {cartItems.length > 3 && (
                                <div className="text-center py-3">
                                  <p className="text-sm text-gray-500 font-medium">
                                    +{cartItems.length - 3} more items in cart
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    Total: {formatPrice(safeCartSummary.total_amount)}
                                  </p>
                                </div>
                              )}
                            </>
                            ) : (
                              <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                                  <ShoppingCart className="w-8 h-8 text-purple-400" />
                                </div>
                                <p className="text-gray-600 font-medium">Your cart is empty</p>
                                <p className="text-sm text-gray-500 mt-1">Add some products to get started!</p>
                              </div>
                          )}
                        </div>
                        
                        <div className="pt-4 border-t">
                          <Link 
                            href="/products/cart" 
                            className="block w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 rounded-lg font-semibold text-center transition-all duration-300 shadow hover:shadow-lg"
                          >
                            View Cart
                          </Link>
                        </div>
                      </div>
                      
                      {/* Dropdown Arrow */}
                      <div className="absolute -top-2 right-6 w-4 h-4 bg-white transform rotate-45"></div>
                    </div>
                  </div>
                </>
              )}
            </div>
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
          {/* Mobile Menu */}
          <div className={`
            md:hidden overflow-hidden transition-all duration-300 ease-in-out
            ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
          `}>
            <div className="py-4 px-2 space-y-3 bg-purple-700 rounded-lg mt-2 shadow-lg mb-3">
              <Link 
                href="/products" 
                className="block hover:text-purple-200 font-medium px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              {
                isAuthenticated ? (
                  <>
                    <Link 
                      href="/profil" 
                      className="block hover:text-purple-200 font-medium px-4 py-3 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      {user?.username || 'Profil'}
                    </Link>
                    <Link 
                      href="/orders" 
                      className="block hover:text-purple-200 font-medium px-4 py-3 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Order
                    </Link>
                    
                    {/* Mobile Cart Section */}
                    <div className="pt-3 border-t border-purple-600">
                      {/* Logout Button */}
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full mb-3 flex items-center justify-center gap-2 text-red-300 hover:text-white font-medium px-4 py-3 rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/30 hover:border-red-500/50"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                      {
                        user?.role != 'admin' && (
                          <Link 
                            href="/products/cart" 
                            className="flex items-center justify-between px-4 py-3 bg-purple-800 rounded-lg hover:bg-purple-900 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <ShoppingCart className="w-5 h-5" />
                                <span className="absolute -top-2 -right-2 bg-yellow-400 text-purple-900 font-bold text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                  {cartLoading ? '...' : totalQuantity}
                                </span>
                              </div>
                              <span className="font-medium">Shopping Cart</span>
                            </div>
                            <span className="text-sm text-purple-200">{safeCartSummary.total_items} items</span>
                          </Link>
                        )
                      }
                    </div>
                  </>
                ) : (
                  <Link 
                    href="/login" 
                    className="block hover:text-purple-200 font-medium px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                )
              }
            </div>
          </div>
        </div>
      </nav>
    )
}