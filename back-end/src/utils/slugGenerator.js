function generateSlug(){
    const chars= 'abcdefghijklmnopqrstuvwxyz0123456789'
    let firstPart= ''
    let secondPart= ''

    // buat bagian pertama dengan 5 karakter
    for (let i=0; i<5; i++){
        const randomIndex= Math.floor(Math.random() * chars.length)
        firstPart += chars[randomIndex]
    }

    // buat bagian kedua dengan 5 karakter
    for (let i=0; i<5; i++){
        const randomIndex= Math.floor(Math.random() * chars.length)
        secondPart += chars[randomIndex]
    }

    return `${firstPart}-${secondPart}`
}
module.exports= generateSlug