'use client'

import ErrorMessage from "@/components/user/error";
import Loading from "@/components/user/loading";
import { User } from "@/lib/apis/authApi";
import userApi, { CreateUserData, UpdateUserData } from "@/lib/apis/userApi";
import { AxiosError } from "axios";
import { CheckCircle, Edit, Eye, Filter, Mail, MapPin, Phone, Plus, Search, Shield, Trash2, User2, UserCheck, UserX, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function AdminUserPage(){
    // state untuk users
    const [users, setUsers]= useState<User[]>([])
    const [loading, setLoading]= useState(true)
    const [error, setError]= useState<string | null>(null)

    // state untuk modal
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showDetailModal, setShowDetailModal] = useState(false)

    // state untuk form
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [createForm, setCreateForm] = useState<CreateUserData>({
        username: '',
        email: '',
        password: '',
        role: 'user'
    })
    const [editForm, setEditForm] = useState<UpdateUserData>({
        username: '',
        email: '',
        password: '',
        role: 'user'
    })

    // State untuk search dan filter
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')

    // fetch users data
    const fetchUsers= async() => {
        try {
            setLoading(true)
            setError(null)
            const response= await userApi.getUsers()
            setUsers(response)

        } catch (err) {
            if (err instanceof AxiosError) {
                setError(err.response?.data?.error || 'Gagal memuat data pengguna');
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Gagal memuat data pengguna');
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(()=>{
        fetchUsers()
    }, [])

    // Filter users berdasarkan search dan role
    const filteredUsers= users.filter(user => {
        const matchesSearch= 
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole= roleFilter === 'all' || user.role === roleFilter

        return matchesSearch && matchesRole
    })

    // helper function untuk cek profile
    const hasProfile= (user: User): boolean => {
        return !!user.profile && 
               !!user.profile.full_name && 
               !!user.profile.address && 
               !!user.profile.phone
    }

    // handle create user
    const handleCreateUser= async ()=> {
        try {
            setLoading(true)
            await userApi.createUser(createForm)

            // reset form dan fetch ulang
            setCreateForm({
                username: '',
                email: '',
                password: '',
                role: 'user'
            })
            setShowCreateModal(false)
            fetchUsers()

        } catch (err) {
            if (err instanceof AxiosError) {
                setError(err.response?.data?.error || 'Gagal membuat pengguna');
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Gagal membuat pengguna');
            }
        } finally {
            setLoading(false)
        }
    }

    // handle edit user
    const handleEditUser= async()=> {
        if (!selectedUser) return

        try {
            setLoading(true)
            await userApi.updateUser(selectedUser.id, editForm)

            // Reset form dan fetch ulang
            setSelectedUser(null)
            setEditForm({
                username: '',
                email: '',
                password: '',
                role: 'user'
            })
            setShowEditModal(false)
            fetchUsers()
            
        } catch (err) {
            if (err instanceof AxiosError) {
                setError(err.response?.data?.error || 'Gagal memperbarui pengguna');
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Gagal memperbarui pengguna');
            }
        } finally {
            setLoading(false)
        }
    }

    // handle delete user
    const handleDeleteUser= async()=> {
        if (!selectedUser) return
        try {
            setLoading(true)
            await userApi.deleteUser(selectedUser.id)

            // reset dan fetch ulang
            setSelectedUser(null)
            setShowDeleteConfirm(false)
            fetchUsers()
            
        } catch (err) {
            if (err instanceof AxiosError) {
                setError(err.response?.data?.error || 'Gagal menghapus pengguna');
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Gagal menghapus pengguna');
            }
        } finally {
            setLoading(false)
        }
    }

    // open modal detail
    const openDetailModal= (user: User)=> {
        setSelectedUser(user)
        setShowDetailModal(true)
    }

    // open edit modal
    const openEditModal= (user: User)=> {
        setSelectedUser(user)
        setEditForm({
            username: user.username,
            email: user.email,
            role: user.role as 'admin' | 'user'
        })
        setShowEditModal(true)
    }

    // open delete confirmation
    const openDeleteConfirm= (user: User)=> {
        setSelectedUser(user)
        setShowDeleteConfirm(true)
    }

    // reset forms
    const resetForms= ()=> {
        setCreateForm({ username: '', email: '', password: '', role: 'user' })
        setEditForm({ username: '', email: '', password: '', role: 'user' })
        setSelectedUser(null)
    }

    if(loading && users.length === 0){
        return <Loading/>
    }
    if(error && users.length === 0) {
        return (
            <ErrorMessage
                title="Gagal Memuat Data"
                message={error}
                onRetry={fetchUsers}
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
                                Manajemen Pengguna
                            </h1>
                            <p className="text-gray-600">
                                Kelola data pengguna sistem
                            </p>
                        </div>
                        
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Tambah Pengguna
                        </button>
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-xl p-4 shadow-sm border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <User2 className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Total Pengguna</div>
                                    <div className="text-xl font-bold text-gray-900">{users.length}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl p-4 shadow-sm border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Admin</div>
                                    <div className="text-xl font-bold text-gray-900">
                                        {users.filter(u => u.role === 'admin').length}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl p-4 shadow-sm border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <UserCheck className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Profile Lengkap</div>
                                    <div className="text-xl font-bold text-gray-900">
                                        {users.filter(hasProfile).length}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl p-4 shadow-sm border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <UserX className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Profile Kosong</div>
                                    <div className="text-xl font-bold text-gray-900">
                                        {users.filter(u => !hasProfile(u)).length}
                                    </div>
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
                                    placeholder="Cari username atau email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                />
                            </div>
                            
                            {/* Role Filter */}
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-gray-400" />
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                >
                                    <option value="all">Semua Role</option>
                                    <option value="admin">Admin</option>
                                    <option value="user">User</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Username
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Profile
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                                    <User2 className="w-4 h-4 text-purple-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {user.username}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {user.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-gray-900">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                user.role === 'admin'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {user.role === 'admin' ? 'Administrator' : 'Regular User'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {hasProfile(user) ? (
                                                    <>
                                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                                        <span className="text-green-700 font-medium">Lengkap</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="w-4 h-4 text-red-500 mr-2" />
                                                        <span className="text-red-700 font-medium">Belum</span>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                
                                                <button
                                                    onClick={() => openDeleteConfirm(user)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        openDetailModal(user)
                                                    }}
                                                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                    title="Detail"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Empty State */}
                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12">
                            <User2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Tidak ada pengguna ditemukan
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {searchTerm || roleFilter !== 'all' 
                                    ? 'Coba ubah filter pencarian Anda' 
                                    : 'Mulai dengan menambahkan pengguna baru'}
                            </p>
                            <button
                                onClick={() => {
                                    setSearchTerm('')
                                    setRoleFilter('all')
                                    setShowCreateModal(true)
                                }}
                                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                            >
                                <Plus className="w-4 h-4 inline mr-2" />
                                Tambah Pengguna
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail User Modal */}
            {showDetailModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-lg">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-900">
                                    Detail Pengguna
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowDetailModal(false)
                                        setSelectedUser(null)
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <XCircle className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            
                            {/* User Info */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                                        {selectedUser.profile?.avatar_url ? (
                                            <img 
                                                src={selectedUser.profile.avatar_url} 
                                                alt={selectedUser.username}
                                                className="w-16 h-16 rounded-full object-cover"
                                            />
                                        ) : (
                                            <User2 className="w-6 h-6 text-purple-600" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">
                                            {selectedUser.profile?.full_name || selectedUser.username}
                                        </h4>
                                        <p className="text-sm text-gray-600">{selectedUser.email}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">User ID</span>
                                        <span className="font-medium text-gray-900">#{selectedUser.id}</span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Username</span>
                                        <span className="font-medium text-gray-900">{selectedUser.username}</span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Role</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            selectedUser.role === 'admin'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-green-100 text-green-800'
                                        }`}>
                                            {selectedUser.role === 'admin' ? 'Administrator' : 'User'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Status Profil</span>
                                        <span className={`font-medium ${
                                            hasProfile(selectedUser) ? 'text-green-600' : 'text-yellow-600'
                                        }`}>
                                            {hasProfile(selectedUser) ? 'Lengkap' : 'Belum Lengkap'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Profile Details */}
                            {hasProfile(selectedUser) && (
                                <div className="mb-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Detail Profil</h4>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                        {selectedUser.profile?.full_name && (
                                            <div>
                                                <div className="text-sm text-gray-500 mb-1">Nama Lengkap</div>
                                                <div className="font-medium text-gray-900">{selectedUser.profile.full_name}</div>
                                            </div>
                                        )}
                                        
                                        {selectedUser.profile?.phone && (
                                            <div>
                                                <div className="text-sm text-gray-500 mb-1">Nomor Telepon</div>
                                                <div className="font-medium text-gray-900">{selectedUser.profile.phone}</div>
                                            </div>
                                        )}
                                        
                                        {selectedUser.profile?.address && (
                                            <div>
                                                <div className="text-sm text-gray-500 mb-1">Alamat</div>
                                                <div className="font-medium text-gray-900 text-sm">
                                                    {selectedUser.profile.address}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t">
                                <button
                                    onClick={() => {
                                        setShowDetailModal(false)
                                        openEditModal(selectedUser)
                                    }}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">
                                    Tambah Pengguna Baru
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
                                        Username *
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.username}
                                        onChange={(e) => setCreateForm({...createForm, username: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                        placeholder="Masukkan username"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={createForm.email}
                                        onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                        placeholder="Masukkan email"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password *
                                    </label>
                                    <input
                                        type="password"
                                        value={createForm.password}
                                        onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                        placeholder="Masukkan password"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Role *
                                    </label>
                                    <select
                                        value={createForm.role}
                                        onChange={(e) => setCreateForm({...createForm, role: e.target.value as 'admin' | 'user'})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                    >
                                        <option value="user">Regular User</option>
                                        <option value="admin">Administrator</option>
                                    </select>
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
                                    onClick={handleCreateUser}
                                    disabled={!createForm.username || !createForm.email || !createForm.password}
                                    className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                                        !createForm.username || !createForm.email || !createForm.password
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg'
                                    }`}
                                >
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">
                                    Edit Pengguna
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
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.username || ''}
                                        onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                        placeholder="Masukkan username"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={editForm.email || ''}
                                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                        placeholder="Masukkan email"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password (Kosongkan jika tidak diubah)
                                    </label>
                                    <input
                                        type="password"
                                        value={editForm.password || ''}
                                        onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                        placeholder="Masukkan password baru"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Role
                                    </label>
                                    <select
                                        value={editForm.role || 'user'}
                                        onChange={(e) => setEditForm({...editForm, role: e.target.value as 'admin' | 'user'})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                    >
                                        <option value="user">Regular User</option>
                                        <option value="admin">Administrator</option>
                                    </select>
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
                                    onClick={handleEditUser}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg"
                                >
                                    Simpan Perubahan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-md">
                        <div className="p-6">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                    <Trash2 className="w-8 h-8 text-red-600" />
                                </div>
                                
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Hapus Pengguna
                                </h3>
                                
                                <p className="text-gray-600 mb-6">
                                    Apakah Anda yakin ingin menghapus pengguna <span className="font-bold">{selectedUser.username}</span>? 
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
                                        onClick={handleDeleteUser}
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