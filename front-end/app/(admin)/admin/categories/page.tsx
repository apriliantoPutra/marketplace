'use client'

import ErrorMessage from "@/components/user/error"
import Loading from "@/components/user/loading"
import categoryApi, { Category, CategoryData } from "@/lib/apis/categoryApi"
import { AxiosError } from "axios"
import { useEffect, useState } from "react"
import { Plus, Tag, FileText, Trash2, XCircle, CheckCircle } from "lucide-react"

export default function AdminCategoryPage(){
    // state untuk categories
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // state untuk modal
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    
    // state untuk form
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [createForm, setCreateForm] = useState<CategoryData>({
        name: '',
        description: '',
    })

    const fetchCategories = async() => {
        try {
            setLoading(true)
            setError(null)
            const response = await categoryApi.getAllCategories()
            setCategories(response)
        } catch (err) {
            if (err instanceof AxiosError) {
                setError(err.response?.data?.error || 'Gagal memuat data kategori');
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Gagal memuat data kategori');
            }
        } finally {
            setLoading(false)
        }
    }
    
    useEffect(() => {
        fetchCategories()
    }, [])

    // handle create category
    const handleCreateCategory = async () => {
        try {
            setLoading(true)
            await categoryApi.createCategory(createForm)
    
            // reset form dan fetch ulang
            setCreateForm({
                name: '',
                description: '',
            })
            setShowCreateModal(false)
            fetchCategories()
        } catch (err) {
            if (err instanceof AxiosError) {
                setError(err.response?.data?.error || 'Gagal membuat kategori');
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Gagal membuat kategori');
            }
        } finally {
            setLoading(false)
        }
    }

    // handle delete category
    const handleDeleteCategory = async () => {
        if (!selectedCategory) return
        try {
            setLoading(true)
            await categoryApi.deleteCategory(selectedCategory.id)
    
            // reset dan fetch ulang
            setSelectedCategory(null)
            setShowDeleteConfirm(false)
            fetchCategories()
        } catch (err) {
            if (err instanceof AxiosError) {
                setError(err.response?.data?.error || 'Gagal menghapus kategori');
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Gagal menghapus kategori');
            }
        } finally {
            setLoading(false)
        }
    }

    // open delete confirmation
    const openDeleteConfirm = (category: Category) => {
        setSelectedCategory(category)
        setShowDeleteConfirm(true)
    }
    
    // reset forms
    const resetForms = () => {
        setCreateForm({ 
            name: '',
            description: '' 
        })
        setSelectedCategory(null)
    }
    
    if(loading && categories.length === 0){
        return <Loading/>
    }
    
    if(error && categories.length === 0) {
        return (
            <ErrorMessage
                title="Gagal Memuat Data"
                message={error}
                onRetry={fetchCategories}
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
                                Manajemen Kategori
                            </h1>
                            <p className="text-gray-600">
                                Kelola kategori produk
                            </p>
                        </div>
                        
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Tambah Kategori
                        </button>
                    </div>
                    
                    {/* Stats - Simple Version */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-xl p-4 shadow-sm border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Tag className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Total Kategori</div>
                                    <div className="text-xl font-bold text-gray-900">{categories.length}</div>
                                </div>
                            </div>
                        </div>
                        
                        
                    </div>
                </div>
                
                {/* Categories Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nama Kategori
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Deskripsi
                                    </th>
                                   
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {categories.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                    <Tag className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {category.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {category.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-xs">
                                                {category.description ? (
                                                    <span className="text-gray-900 line-clamp-2">
                                                        {category.description}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 italic">
                                                        Tidak ada deskripsi
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openDeleteConfirm(category)}
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
                    {categories.length === 0 && (
                        <div className="text-center py-12">
                            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Tidak ada kategori ditemukan
                            </h3>
                            <p className="text-gray-500 mb-4">
                                Mulai dengan menambahkan kategori baru
                            </p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                            >
                                <Plus className="w-4 h-4 inline mr-2" />
                                Tambah Kategori
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Create Category Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">
                                    Tambah Kategori Baru
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
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Kategori *
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.name}
                                        onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder="Masukkan nama kategori"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Deskripsi (Opsional)
                                    </label>
                                    <textarea
                                        value={createForm.description}
                                        onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder="Masukkan deskripsi kategori"
                                        rows={3}
                                    />
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
                                    onClick={handleCreateCategory}
                                    disabled={!createForm.name.trim()}
                                    className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                                        !createForm.name.trim()
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg'
                                    }`}
                                >
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && selectedCategory && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-md">
                        <div className="p-6">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                    <Trash2 className="w-8 h-8 text-red-600" />
                                </div>
                                
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Hapus Kategori
                                </h3>
                                
                                <p className="text-gray-600 mb-6">
                                    Apakah Anda yakin ingin menghapus kategori <span className="font-bold">{selectedCategory.name}</span>? 
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
                                        onClick={handleDeleteCategory}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                                    >
                                        Hapus
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