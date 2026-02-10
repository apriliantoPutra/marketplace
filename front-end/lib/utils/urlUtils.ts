
const urlUtils = {
  // Ambil dari environment variables
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  
  /**
   * Dapatkan full URL untuk static files
   */
  getStaticUrl: (path: string): string => {
    if (!path) return ''
    // Hilangkan slash depan jika ada
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    return `${urlUtils.BASE_URL}/${cleanPath}`
  },

  /**
   * Dapatkan full URL untuk API endpoint
   */
  getApiUrl: (endpoint: string): string => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    return `${urlUtils.API_URL}${cleanEndpoint}`
  },

  /**
   * Generate product image URL
   */
  getProductImageUrl: (imagePath: string | null): string | null => {
    if (!imagePath) return null
    return urlUtils.getStaticUrl(imagePath)
  }
}

export default urlUtils