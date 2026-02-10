import Link from "next/link";
import Navbar from "@/components/user/navbar";
import Footer from "@/components/user/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800">
      <Navbar/>
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Selamat Datang di Marketplace
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Platform belanja online terpercaya dengan berbagai produk berkualitas. 
            Dapatkan pengalaman belanja yang mudah, aman, dan menyenangkan.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login" 
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Login ke Akun Anda
            </Link>
            
            <Link 
              href="/register" 
              className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
            >
              Buat Akun Baru
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="text-xl font-semibold mb-2">Produk Lengkap</h3>
            <p className="text-gray-600">
              Ribuan produk dari berbagai kategori
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="text-xl font-semibold mb-2">Harga Terbaik</h3>
            <p className="text-gray-600">
              Harga kompetitif dengan kualitas terjamin
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="text-xl font-semibold mb-2">Pengiriman Cepat</h3>
            <p className="text-gray-600">
              Pengiriman ke seluruh Indonesia
            </p>
          </div>
        </div>
      </main>
      <Footer/>
    </div>
  );
}
