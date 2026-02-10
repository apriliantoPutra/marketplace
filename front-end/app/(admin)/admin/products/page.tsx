'use client'

import categoryApi, { Category } from "@/lib/apis/categoryApi"
import productApi, { Product, ProductData } from "@/lib/apis/productApi"
import { useCallback, useEffect, useState } from "react"
import { Plus, Search, Filter, Edit, Trash2, XCircle, Package, DollarSign, Layers, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react"
import ErrorMessage from "@/components/user/error"
import Loading from "@/components/user/loading"
import { AxiosError } from "axios"

export default function AdminProductPage(){
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
          case 'price_desc':
            filteredProducts.sort((a, b)=> a.price - b.price)
            break
          case 'price_asc':
            filteredProducts.sort((a, b)=> b.price - a.price)
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

    // state untuk modal
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    
    // state untuk form
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [createForm, setCreateForm] = useState<ProductData>({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        category_id: 0,
        product: null
    })
    const [editForm, setEditForm] = useState<ProductData>({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        category_id: 0,
        product: null
    })
    const [formError, setFormError] = useState<string | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    // handle create product
    const handleCreateProduct = async () => {
        try {
            setLoading(true)
            setFormError(null)
            
            // Validasi
            if (!createForm.name.trim()) {
                setFormError('Nama produk harus diisi')
                return
            }
            if (createForm.price <= 0) {
                setFormError('Harga harus lebih dari 0')
                return
            }
            if (createForm.stock < 0) {
                setFormError('Stok tidak boleh negatif')
                return
            }
            if (createForm.category_id === 0) {
                setFormError('Kategori harus dipilih')
                return
            }

            await productApi.createProduct(createForm)
            
            // Reset form dan fetch ulang
            setCreateForm({
                name: '',
                description: '',
                price: 0,
                stock: 0,
                category_id: 0,
                product: null
            })
            setImagePreview(null)
            setShowCreateModal(false)
            fetchProducts()
            
        } catch (err) {
            if (err instanceof AxiosError) {
                setFormError(err.response?.data?.error || 'Gagal memuat data product');
            } else if (err instanceof Error) {
                setFormError(err.message);
            } else {
                setFormError('Gagal memuat data product');
        }} finally {
            setLoading(false)
        }
    }

    // handle edit product
    const handleEditProduct = async () => {
        if (!selectedProduct) return
        
        try {
            setLoading(true)
            setFormError(null)
            
            // Validasi
            if (!editForm.name.trim()) {
                setFormError('Nama produk harus diisi')
                return
            }
            if (editForm.price <= 0) {
                setFormError('Harga harus lebih dari 0')
                return
            }
            if (editForm.stock < 0) {
                setFormError('Stok tidak boleh negatif')
                return
            }
            if (editForm.category_id === 0) {
                setFormError('Kategori harus dipilih')
                return
            }

            await productApi.updateProduct(selectedProduct.id, editForm)
            
            // Reset form dan fetch ulang
            setSelectedProduct(null)
            setEditForm({
                name: '',
                description: '',
                price: 0,
                stock: 0,
                category_id: 0,
                product: null
            })
            setImagePreview(null)
            setShowEditModal(false)
            fetchProducts()
            
        } catch (err) {
            if (err instanceof AxiosError) {
                setFormError(err.response?.data?.error || 'Gagal update data product');
            } else if (err instanceof Error) {
                setFormError(err.message);
            } else {
                setFormError('Gagal update data product');
        }} finally {
            setLoading(false)
        }
    }

    // handle delete product
    const handleDeleteProduct = async () => {
        if (!selectedProduct) return
        
        try {
            setLoading(true)
            await productApi.deleteProduct(selectedProduct.id)
            
            // Reset dan fetch ulang
            setSelectedProduct(null)
            setShowDeleteConfirm(false)
            fetchProducts()
            
        } catch (err) {
            if (err instanceof AxiosError) {
                setFormError(err.response?.data?.error || 'Gagal menghapus data product');
            } else if (err instanceof Error) {
                setFormError(err.message);
            } else {
                setFormError('Gagal menghapus data product');
        }} finally {
            setLoading(false)
        }
    }

    // open edit modal
    const openEditModal = (product: Product) => {
        setSelectedProduct(product)
        setEditForm({
            name: product.name,
            description: product.description || '',
            price: product.price,
            stock: product.stock,
            category_id: product.category.id,
            product: null
        })
        if (product.image_url) {
            setImagePreview(product.image_url)
        }
        setShowEditModal(true)
    }

    // open delete confirmation
    const openDeleteConfirm = (product: Product) => {
        setSelectedProduct(product)
        setShowDeleteConfirm(true)
    }

    // reset forms
    const resetForms = () => {
        setCreateForm({
            name: '',
            description: '',
            price: 0,
            stock: 0,
            category_id: 0,
            product: null
        })
        setEditForm({
            name: '',
            description: '',
            price: 0,
            stock: 0,
            category_id: 0,
            product: null
        })
        setSelectedProduct(null)
        setImagePreview(null)
        setFormError(null)
    }

    // handle image upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
        const file = e.target.files?.[0]
        if (file) {
            if (isEdit) {
                setEditForm({...editForm, product: file})
            } else {
                setCreateForm({...createForm, product: file})
            }
            
            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    // format price
    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price)
    }

    // calculate statistics
    const totalValue = allProducts.reduce((sum, product) => sum + (product.price * product.stock), 0)
    const averagePrice = allProducts.length > 0 ? totalValue / allProducts.reduce((sum, product) => sum + product.stock, 1) : 0
    const lowStockProducts = allProducts.filter(product => product.stock < 10).length
    const outOfStockProducts = allProducts.filter(product => product.stock === 0).length

    if (loading && allProducts.length === 0) {
        return <Loading />
    }

    if (error && allProducts.length === 0) {
        return (
            <ErrorMessage
                title="Gagal Memuat Data"
                message={error}
                onRetry={fetchProducts}
            />
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Manajemen Produk
                            </h1>
                            <p className="text-gray-600">
                                Kelola produk di marketplace
                            </p>
                        </div>
                        
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Tambah Produk
                        </button>
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-xl p-4 shadow-sm border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Package className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Total Produk</div>
                                    <div className="text-xl font-bold text-gray-900">{allProducts.length}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl p-4 shadow-sm border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Total Nilai</div>
                                    <div className="text-xl font-bold text-gray-900">
                                        {formatPrice(totalValue)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl p-4 shadow-sm border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <Package className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Stok Rendah</div>
                                    <div className="text-xl font-bold text-gray-900">{lowStockProducts}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl p-4 shadow-sm border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <Package className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Stok Habis</div>
                                    <div className="text-xl font-bold text-gray-900">{outOfStockProducts}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Search and Filter */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search Input */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Cari nama produk..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                />
                            </div>
                            
                            {/* Category Filter */}
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-gray-400" />
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
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
                                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                >
                                    <option value="newest">Terbaru</option>
                                    <option value="price_asc">Harga Tertinggi</option>
                                    <option value="price_desc">Harga Terendah</option>
                                    <option value="stock_desc">Stok Terbanyak</option>
                                </select>
                            </div>
                        </div>

                        {/* Results Info */}
                        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <p className="text-gray-600">
                                Menampilkan {displayedProducts.length} dari {allProducts.length} produk
                            </p>
                            {(searchTerm || selectedCategory !== 'all') && (
                                <button
                                    onClick={handleResetFilters}
                                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                                >
                                    Reset Filter
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Products Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Produk
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Harga
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stok
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kategori
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {displayedProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3 overflow-hidden">
                                                    {product.image_url ? (
                                                        <img 
                                                            src={product.image_url} 
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <ImageIcon className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {product.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 line-clamp-1">
                                                        {product.description || 'Tidak ada deskripsi'}
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        ID: {product.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">
                                                {formatPrice(product.price)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                product.stock > 20 
                                                    ? 'bg-green-100 text-green-800'
                                                    : product.stock > 0
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {product.stock} unit
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                                                    <Layers className="w-3 h-3 text-blue-600" />
                                                </div>
                                                <span className="text-gray-900">{product.category.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(product)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                
                                                <button
                                                    onClick={() => openDeleteConfirm(product)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Empty State */}
                    {displayedProducts.length === 0 && (
                        <div className="text-center py-12">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Tidak ada produk ditemukan
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {searchTerm || selectedCategory !== 'all' 
                                    ? 'Coba ubah filter pencarian Anda' 
                                    : 'Mulai dengan menambahkan produk baru'}
                            </p>
                            <button
                                onClick={() => {
                                    setSearchTerm('')
                                    setSelectedCategory('all')
                                    setShowCreateModal(true)
                                }}
                                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                            >
                                <Plus className="w-4 h-4 inline mr-2" />
                                Tambah Produk
                            </button>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-gray-600 text-sm">
                                    Halaman {currentPage} dari {totalPages}
                                </div>
                                
                                <div className="flex items-center gap-2">
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

                                    <div className="flex items-center gap-1">
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
                                                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                                                                : 'hover:bg-gray-100'
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                )
                                            }
                                            return null
                                        })}
                                    </div>

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
                        </div>
                    )}
                </div>
            </div>
            
            {/* Create Product Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">
                                    Tambah Produk Baru
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false)
                                        resetForms()
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <XCircle className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            
                            {formError && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
                                    {formError}
                                </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column - Image Upload */}
                                <div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Gambar Produk
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, false)}
                                                className="hidden"
                                                id="product-image-upload"
                                            />
                                            <label htmlFor="product-image-upload" className="cursor-pointer">
                                                {imagePreview ? (
                                                    <div className="relative">
                                                        <img 
                                                            src={imagePreview} 
                                                            alt="Preview" 
                                                            className="w-full h-48 object-cover rounded-lg mb-2"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setImagePreview(null)
                                                                setCreateForm({...createForm, product: null})
                                                            }}
                                                            className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                                        <p className="text-sm text-gray-600">
                                                            Klik untuk upload gambar
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            PNG, JPG, JPEG (Max 5MB)
                                                        </p>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Right Column - Form Fields */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nama Produk *
                                        </label>
                                        <input
                                            type="text"
                                            value={createForm.name}
                                            onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                            placeholder="Masukkan nama produk"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Deskripsi
                                        </label>
                                        <textarea
                                            value={createForm.description}
                                            onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                            placeholder="Masukkan deskripsi produk"
                                            rows={3}
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Harga *
                                            </label>
                                            <input
                                                type="number"
                                                value={createForm.price || ''}
                                                onChange={(e) => setCreateForm({...createForm, price: parseInt(e.target.value) || 0})}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                                placeholder="0"
                                                min="0"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Stok *
                                            </label>
                                            <input
                                                type="number"
                                                value={createForm.stock || ''}
                                                onChange={(e) => setCreateForm({...createForm, stock: parseInt(e.target.value) || 0})}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                                placeholder="0"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Kategori *
                                        </label>
                                        <select
                                            value={createForm.category_id}
                                            onChange={(e) => setCreateForm({...createForm, category_id: parseInt(e.target.value)})}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                        >
                                            <option value="0">Pilih Kategori</option>
                                            {categories.map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false)
                                        resetForms()
                                    }}
                                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleCreateProduct}
                                    disabled={loading || !createForm.name.trim() || 
                                        createForm.price <= 0 || 
                                        createForm.stock < 0 || 
                                        createForm.category_id === 0
                                    }
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Edit Product Modal */}
            {showEditModal && selectedProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">
                                    Edit Produk
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false)
                                        resetForms()
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <XCircle className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            
                            {formError && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
                                    {formError}
                                </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column - Image Upload */}
                                <div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Gambar Produk
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, true)}
                                                className="hidden"
                                                id="edit-product-image-upload"
                                            />
                                            <label htmlFor="edit-product-image-upload" className="cursor-pointer">
                                                {imagePreview ? (
                                                    <div className="relative">
                                                        <img 
                                                            src={imagePreview} 
                                                            alt="Preview" 
                                                            className="w-full h-48 object-cover rounded-lg mb-2"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setImagePreview(selectedProduct.image_url || null)
                                                                setEditForm({...editForm, product: null})
                                                            }}
                                                            className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                                        <p className="text-sm text-gray-600">
                                                            Klik untuk upload gambar baru
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Kosongkan jika tidak ingin mengganti
                                                        </p>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Right Column - Form Fields */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nama Produk *
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                            placeholder="Masukkan nama produk"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Deskripsi
                                        </label>
                                        <textarea
                                            value={editForm.description}
                                            onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                            placeholder="Masukkan deskripsi produk"
                                            rows={3}
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Harga *
                                            </label>
                                            <input
                                                type="number"
                                                value={editForm.price || ''}
                                                onChange={(e) => setEditForm({...editForm, price: parseInt(e.target.value) || 0})}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                                placeholder="0"
                                                min="0"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Stok *
                                            </label>
                                            <input
                                                type="number"
                                                value={editForm.stock || ''}
                                                onChange={(e) => setEditForm({...editForm, stock: parseInt(e.target.value) || 0})}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                                placeholder="0"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Kategori *
                                        </label>
                                        <select
                                            value={editForm.category_id}
                                            onChange={(e) => setEditForm({...editForm, category_id: parseInt(e.target.value)})}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                        >
                                            <option value="0">Pilih Kategori</option>
                                            {categories.map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => {
                                        setShowEditModal(false)
                                        resetForms()
                                    }}
                                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleEditProduct}
                                    disabled={loading }
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && selectedProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-md">
                        <div className="p-6">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                    <Trash2 className="w-8 h-8 text-red-600" />
                                </div>
                                
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Hapus Produk
                                </h3>
                                
                                <p className="text-gray-600 mb-6">
                                    Apakah Anda yakin ingin menghapus produk <span className="font-bold">{selectedProduct.name}</span>? 
                                    Tindakan ini tidak dapat dibatalkan.
                                </p>
                                
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowDeleteConfirm(false)
                                            resetForms()
                                        }}
                                        className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleDeleteProduct}
                                        disabled={loading}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Menghapus...' : 'Hapus'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}