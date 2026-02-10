'use client'
import React, { useState, useEffect } from "react"
import { User, Mail, MapPin, Phone, Edit, Plus, Camera, Save, X, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/stores/authStore"
import Loading from "@/components/user/loading"
import ErrorMessage from "@/components/user/error"
import { AxiosError } from "axios"


export default function ProfilPage(){
    const {user: UserData, isLoading: authLoading, error: authError, isAuthenticated, hasProfile, createProfile, updateProfile, refreshUser}= useAuth()
    // State untuk modal
    const [showAddModal, setShowAddModal]= useState(false)
    const [showEditModal, setShowEditModal]= useState(false)
    const [isLoading, setIsLoading]= useState(false)
    const [formError, setFormError] = useState<string | null>(null)

    // state form
    const [formData, setFormData] = useState({
    full_name: '',
    address: '',
    phone: '',
    avatar: null as File | null
  })
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // Initialize form data dari user data
  useEffect(()=> {
    if(UserData?.profile) {
      setFormData({
        full_name: UserData.profile.full_name || '',
        address: UserData.profile.address || '',
        phone: UserData.profile.phone || '',
        avatar: null
      })

      if(UserData.profile.avatar_url) {
        setPreviewImage(UserData.profile.avatar_url)
      }
    }
  }, [UserData])

    // Handle form input changes
    const handleInputChange= (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> )=> {
        const {name, value}= e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Clear error saat user mulai mengetik
        if (formError) setFormError(null)
    }

    // handle avatar upload
    const handleAvatarChange= (e: React.ChangeEvent<HTMLInputElement>)=> {
      const file= e.target.files?.[0]
      if(!file) return
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setFormError('File harus berupa gambar')
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Ukuran gambar maksimal 5MB')
        return
      }
      
      setFormData(prev => ({...prev, avatar: file}))
      // create preview
      const reader= new FileReader()
      reader.onloadend= ()=> {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }

    // Validate form
    const validateForm = () => {
      if (!formData.full_name.trim()) {
        return 'Nama lengkap harus diisi'
      }
      if (!formData.phone.trim()) {
        return 'Nomor telepon harus diisi'
      }
      if (!formData.address.trim()) {
        return 'Alamat harus diisi'
      }
      if (formData.phone.length < 7) {
        return 'Nomor telepon minimal 7 digit'
      }
      return null
    }

    // Handle create profile
    const handleCreateProfile = async () => {
      const validationError = validateForm()
      if (validationError) {
        setFormError(validationError)
        return
      }

      setIsLoading(true)
      setFormError(null)

      try {
        await createProfile(formData)
        setShowAddModal(false)
        
      } catch (err) {
        if (err instanceof AxiosError) {
          setFormError(err.response?.data?.error || 'Terjadi kesalahan saat menambah profil');
        } else if (err instanceof Error) {
          setFormError(err.message);
        } else {
          setFormError('Terjadi kesalahan saat menambah profil');
        }} finally {
        setIsLoading(false)
      }
    }

    // Handle update profile
    const handleUpdateProfile = async () => {
      const validationError = validateForm()
      if (validationError) {
        setFormError(validationError)
        return
      }

      setIsLoading(true)
      setFormError(null)

      try {
        await updateProfile(formData)
        setShowEditModal(false)
        
      } catch (err) {
        if (err instanceof AxiosError) {
          setFormError(err.response?.data?.error || 'Terjadi kesalahan saat mengedit profil');
        } else if (err instanceof Error) {
          setFormError(err.message);
        } else {
          setFormError('Terjadi kesalahan saat mengedit profil');
        }} finally {
        setIsLoading(false)
      }
    }

    // Reset form
    const resetForm = () => {
      if (UserData?.profile) {
        setFormData({
          full_name: UserData.profile.full_name || '',
          address: UserData.profile.address || '',
          phone: UserData.profile.phone || '',
          avatar: null
        })
        setPreviewImage(UserData.profile.avatar_url || null)
      } else {
        setFormData({
          full_name: '',
          address: '',
          phone: '',
          avatar: null
        })
        setPreviewImage(null)
      }
      setFormError(null)
    }

    // Handle cancel
    const handleCancel = () => {
      resetForm()
      setShowAddModal(false)
      setShowEditModal(false)
    }

    if (authLoading) {
      return <Loading />
    }

    if (authError) {
      return (
        <ErrorMessage
          title="Gagal Memuat Data"
          message={authError}
          onRetry={refreshUser}
        />
      )
    }
    if (!isAuthenticated) {
      return (
        <ErrorMessage
          title="Akses Ditolak"
          message="Anda harus login untuk mengakses halaman ini"
          showBackButton={true}
          onBack={() => window.location.href = '/login'}
        />
      )
    }
    if (!UserData) {
      return (
        <ErrorMessage
          title="Data Tidak Ditemukan"
          message="Data user tidak ditemukan"
          onRetry={refreshUser}
        />
      )
    }

    return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Profil Pengguna
          </h1>
          <p className="text-gray-600">
            Kelola informasi profil dan akun Anda
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Avatar Section */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center overflow-hidden">
                    {previewImage || UserData.profile?.avatar_url ? (
                      <img 
                        src={previewImage || UserData.profile?.avatar_url || ''}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-white/70" />
                    )}
                  </div>
                  <label className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg cursor-pointer">
                    <Camera className="w-5 h-5 text-purple-600" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {hasProfile ? UserData.profile?.full_name : UserData.username}
                  </h2>
                  <p className="text-white/90 mb-1 flex items-center justify-center sm:justify-start gap-2">
                    <Mail className="w-4 h-4" />
                    {UserData.email}
                  </p>
                  <p className="text-white/90 flex items-center justify-center sm:justify-start gap-2">
                    <User className="w-4 h-4" />
                    @{UserData.username}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4 sm:mt-0">
                  {!hasProfile ? (
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Tambah Profil
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Edit className="w-5 h-5" />
                      Edit Profil
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-6">
              {hasProfile ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Informasi Pribadi
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                          <User className="w-4 h-4" />
                          <span className="text-sm">Nama Lengkap</span>
                        </div>
                        <p className="text-gray-900 font-medium">
                          {UserData.profile?.full_name}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                          <Mail className="w-4 h-4" />
                          <span className="text-sm">Email</span>
                        </div>
                        <p className="text-gray-900 font-medium">
                          {UserData.email}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                          <Phone className="w-4 h-4" />
                          <span className="text-sm">Telepon</span>
                        </div>
                        <p className="text-gray-900 font-medium">
                          {UserData.profile?.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      Alamat Pengiriman
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">Alamat Lengkap</span>
                        </div>
                        <p className="text-gray-900 font-medium">
                          {UserData.profile?.address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Empty Profile State
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-purple-400" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Profil Belum Dilengkapi
                  </h3>
                  
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Lengkapi informasi profil Anda untuk pengalaman berbelanja yang lebih baik
                  </p>
                  
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Tambah Profil Sekarang
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Account Info Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              Informasi Akun
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">Username</div>
                <div className="text-gray-900 font-medium">{UserData.username}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Email</div>
                <div className="text-gray-900 font-medium">{UserData.email}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Role</div>
                <div className="text-gray-900 font-medium">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    UserData.role === 'admin' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {UserData.role === 'admin' ? 'Administrator' : 'Regular User'}
                  </span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">ID Pengguna</div>
                <div className="text-gray-900 font-medium font-mono">{UserData.id}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal untuk Create/Edit Profile */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {showAddModal ? 'Tambah Profil' : 'Edit Profil'}
                </h3>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Error Message */}
              {formError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>{formError}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* Avatar Upload */}
                <div className="text-center">
                  <label className="inline-block cursor-pointer">
                    <div className="w-32 h-32 mx-auto rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-purple-400 transition-colors">
                      {previewImage ? (
                        <img 
                          src={previewImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <Camera className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                          <span className="text-sm text-gray-500">Upload Foto</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Maksimal 5MB. Format: JPG, PNG, GIF
                  </p>
                </div>

                {/* Form Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Telepon *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    placeholder="Contoh: 081234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat Lengkap *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                    placeholder="Masukkan alamat lengkap (RT/RW, jalan, kecamatan, kota)"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={showAddModal ? handleCreateProfile : handleUpdateProfile}
                  disabled={isLoading || !formData.full_name || !formData.phone || !formData.address}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                    isLoading || !formData.full_name || !formData.phone || !formData.address
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {showAddModal ? 'Simpan Profil' : 'Perbarui Profil'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}