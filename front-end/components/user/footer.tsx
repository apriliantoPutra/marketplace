export default function Footer(){
    const currentYear= new Date().getFullYear()
    return (
        <footer className="bg-gradient-to-r from-purple-900 to-purple-950 text-white py-8 mt-16">
            <div className="container mx-auto px-4 text-center">
                <p className="mb-4">© {currentYear} Marketplace App. All rights reserved.</p>
                <p className="text-gray-400 text-sm">
                    Belanja online mudah dan aman
                </p>
            </div>
      </footer>
    )
}