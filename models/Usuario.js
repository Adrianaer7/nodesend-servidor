const mongoose = require("mongoose")
const Schema = mongoose.Schema

const usuarioSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, //convierte los strings a minusculas
        trim: true  //elimina los espacios
    },
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    }
})

module.exports = mongoose.model("Usuarios", usuarioSchema)  //Si todavia no fue creado ningun usuario, MongoDB crea automaticamente colecciones de nuestro registro. En este caso seria usuarios