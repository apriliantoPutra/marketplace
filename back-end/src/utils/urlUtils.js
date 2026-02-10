require('dotenv').config()

const urlUtils= {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    BASE_URL: process.env.BASE_URL || `http://localhost:3000`,

    getBaseUrl: function(){
        return this.BASE_URL
    },

    getAPIUrl: function(){
        return `${this.BASE_URL}/api`
    },


}
module.exports= urlUtils

