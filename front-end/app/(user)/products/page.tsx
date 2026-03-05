'use client'
import { useState, useEffect, useCallback } from 'react'
import { ShoppingCart, Search, Filter, ChevronLeft, ChevronRight, CheckCircle  } from 'lucide-react'
import { productApi, categoryApi } from '@/lib/apis'
import { formatPrice } from '@/lib/utils/formatters'
import type { Product } from '@/lib/apis/productApi'
import type { Category } from '@/lib/apis/categoryApi'

// component
import Loading from '@/components/user/loading'
import ErrorMessage from '@/components/user/error'
import EmptyMessage from '@/components/user/empty'
import { useCart } from '@/lib/stores/cartStore'
import { useAuth } from '@/lib/stores/authStore'

export default function ProductPage(){
  const {isAuthenticated, hasProfile}= useAuth()
  // state core
  const [allProducts, setAllProducts]= useState<Product[]>([])
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]) // Produk yang ditampilkan
  const [loading, setLoading]= useState(true)
  const [error, setError]= useState<string | null>(null)

  // state filter & search
  const [searchTerm, setSearchTerm]= useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'stock_desc' >('newest')

  // state pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 12

  // categories
  const [categories, setCategories]= useState<Category[]>([])
  const fetchCategories= async()=> {
    try {
      const response= await categoryApi.getAllCategories()
      setCategories(response)
      
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  // Di fetchProducts function, perbaiki bagian category filter
const fetchProducts = async()=> {
  try {
    setLoading(true)
    setError(null)

    const response= await productApi.getProducts()
    setAllProducts(response)
  } catch (err) {
    console.error('Error fetching products:', err)
    setError('Gagal memuat data produk. Silakan coba lagi.')
  } finally {
    setLoading(false)
  }
}

  useEffect(()=> {
    fetchCategories()
    fetchProducts()
  }, [])

  const applyFillters= useCallback(()=> {
    let filteredProducts= [...allProducts]

    // apply search filter
    if(searchTerm.trim()){
      const searchTermLower= searchTerm.toLowerCase().trim()
      filteredProducts= filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchTermLower)
      )
    }

    // category filter
    if(selectedCategory !== 'all') {
      filteredProducts= filteredProducts.filter(product => 
        product.category.name === selectedCategory
      )
    }

    // apply sort
    switch(sortBy) {
      case 'newest':
        filteredProducts.sort((a, b)=> b.id - a.id)
        break
      case 'price_asc':
        filteredProducts.sort((a, b)=> a.price - b.price) // rendah ke tinggi
        break
      case 'price_desc':
        filteredProducts.sort((a, b)=> b.price - a.price) // tinggi ke rendah
        break
      case 'stock_desc':
        filteredProducts.sort((a, b)=> b.stock - a.stock)
        break
    }

    // apply pagination
    const startIndex= (currentPage - 1) * itemsPerPage
    const endIndex= startIndex + itemsPerPage
    const paginatedProducts= filteredProducts.slice(startIndex, endIndex)

    // update total pages
    setTotalPages(Math.ceil(filteredProducts.length / itemsPerPage))
    // set displayed products
    setDisplayedProducts(paginatedProducts)
  }, [allProducts, searchTerm, selectedCategory, sortBy, currentPage])

  // apply filters ketika ada perubahan
  useEffect(()=> {
    if(allProducts.length > 0) {
      applyFillters()
    }
  }, [allProducts, applyFillters])

  // reset ke page 1 ketika filter berubah
  useEffect(()=> {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory, sortBy])

  const handlePageChange= (page: number)=> {
    if(page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({top: 0, behavior: 'smooth'})
    }
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSortBy('newest')
    setCurrentPage(1)
  }

  // add cart
  const [isAdding, setIsAdding] = useState(false)
  const [addedSuccess, setAddedSuccess] = useState(false)
  const {addItem, isLoading: cartLoading}= useCart()

  const handleAddToCart = async (productId: number)=>  {
    if(isAdding || cartLoading) return
    try {
      setIsAdding(true)
      setAddedSuccess(false)

      await addItem(productId)
      setAddedSuccess(true)

      // reset kembali setelah 2 detik
      setTimeout(() => {
        setAddedSuccess(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setIsAdding(false)
    }
    
  }

  if(loading){
    return (<Loading/>)
  }
  if(error){
    return (<ErrorMessage title='Gagal Memuat Product' message={error} onRetry={fetchProducts} />)
  }
  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='container mx-auto px-4'>
        {/* success message add cart */}
        { addedSuccess && (
            <div className="fixed top-4 right-4 z-50 animate-fade-in">
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Produk berhasil ditambahkan ke keranjang!</span>
              </div>
          </div>
          )
        }
        {/* header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Temukan Produk{' '}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Terbaik
            </span>
          </h1>
          <p className="text-gray-600 text-lg">
            Jelajahi berbagai produk berkualitas dari berbagai kategori
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Menampilkan {allProducts.length} produk dari database
          </div>
        </div>

        {/* filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="text"
                    placeholder="Cari nama produk..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
            </div>
            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none appearance-none"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                        {category.name}
                    </option>
                  ))}
                </select>
            </div>
            {/* Sort Filter */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy )}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              >
                <option value="newest">Terbaru</option>
                <option value="price_asc">Harga Terendah</option>
                <option value="price_desc">Harga Tertinggi</option>
                <option value="stock_desc">Stok Terbanyak</option>
              </select>
            </div>
        </div>
        {/* Results Info */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-gray-600">
              Menampilkan <span className="font-semibold text-purple-600">{displayedProducts.length}</span> dari{' '}
              <span className="font-semibold">{allProducts.length}</span> produk
              {selectedCategory !== 'all' && ` dalam kategori ${selectedCategory}`}
            </p>
            {(searchTerm || selectedCategory !== 'all' ) && (
              <button
                onClick={handleResetFilters}
                className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Reset Filter
              </button>
            )}
          </div>
                    
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Urutkan:</span>
            <span className="font-medium text-purple-600">
              {sortBy === 'newest' && 'Terbaru'}
              {sortBy === 'price_asc' && 'Harga Terendah'}
              {sortBy === 'price_desc' && 'Harga Tertinggi'}
              {sortBy === 'stock_desc' && 'Stok Terbanyak'}
            </span>
          </div>
          </div>
        </div>

        {/* product */}
        {displayedProducts.length === 0 ? (
          <EmptyMessage 
            title="Produk Tidak Ditemukan" 
            message="Coba ubah filter pencarian Anda"
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedProducts.map(product => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  {/* Product Image */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-50">
                    <div 
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${product.image_url})` }}
                    />
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-purple-700">
                        {product.category.name}
                      </span>
                    </div>
                    {/* Stock Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.stock > 20 
                          ? 'bg-green-100 text-green-700'
                          : product.stock > 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {product.stock > 0 ? `${product.stock} stok tersedia` : 'Stok habis'}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    {/* Product Name */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                      {product.name}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Price and Stock Info */}
                    <div className="mb-6">
                      <div className="text-2xl font-bold text-purple-600 mb-2">
                        {formatPrice(product.price)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Stok: {product.stock} unit
                      </div>
                    </div>
                    {/* Action Button */}
                    {isAuthenticated && hasProfile ? (
                        <button
                          onClick={() => handleAddToCart(product.id)}
                          disabled={product.stock === 0 || isAdding || addedSuccess}
                          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                            product.stock === 0
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple-200'
                          }`}
                        >
                        <ShoppingCart className="w-5 h-5" />
                        {product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
                      </button>
                    ) : (
                      <button
                          disabled
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-gray-100 text-gray-400 cursor-not-allowed"
                        >
                        <ShoppingCart className="w-5 h-5" />
                        {!isAuthenticated ? 'Login Dulu' : 'Lengkapi Profil'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-gray-600">
                  Halaman {currentPage} dari {totalPages} • Total {allProducts.length} produk
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {/* First Page */}
                    {currentPage > 3 && (
                      <>
                        <button
                          onClick={() => handlePageChange(1)}
                          className="w-10 h-10 rounded-lg hover:bg-gray-100"
                        >
                          1
                        </button>
                        {currentPage > 4 && (
                          <span className="px-2">...</span>
                        )}
                      </>
                    )}

                    {/* Middle Pages */}
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1
                      if (
                        pageNum === currentPage ||
                        pageNum === currentPage - 1 ||
                        pageNum === currentPage + 1 ||
                        (currentPage === 1 && pageNum <= 3) ||
                        (currentPage === totalPages && pageNum >= totalPages - 2)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 rounded-lg font-medium ${
                              currentPage === pageNum
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      }
                      return null
                    })}

                    {/* Last Page */}
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && (
                          <span className="px-2">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(totalPages)}
                          className="w-10 h-10 rounded-lg hover:bg-gray-100"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </div>

    </div>
  )
}