//Todo esto se requiere para conectar con MongoDB
const mongoose = require("mongoose")
require("dotenv").config({path: 'variables.env'})   //las variables que va a leer dotenv se van a leer en el archivo variables.env

const conectarDB = async () => {
    try {   
        await mongoose.connect(process.env.DB_URL)
        console.log("DB conectada") 
    } catch (error) {
        console.log(error)
        process.exit(1) //En caso de que haya un error en la app, detenerla
    }
}

module.exports = conectarDB;