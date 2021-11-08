const Usuario = require("../models/Usuario")    //importo el modelo
const bcrypt = require("bcrypt")    //para hashear la contraseña
const {validationResult} = require("express-validator") //obtiene el resultado de la validacion que se realiza en la ruta

exports.nuevoUsuario = async (req, res) => {

    //Mostrar mensajes de error
    const errores = validationResult(req)   //me devuelve el array con el mensaje de error que definí en la ruta, junto con el campo al que se le atribuye el error, y el body, que es de donde lo traigo
    if(!errores.isEmpty()) {    //si hay errores
        return res.status(400).json({errores: errores.array()}) //muestro el array de errores
    }

    //Verificar si el usuario ya existe
    const {email, password} = req.body    //leo todo el req.body pero solo extraigo el email y password

    let usuario = await Usuario.findOne({email})    //si el email del nuevo usuario ya está siendo usado en otro usuario, pongo el usuario ya creado en la variable
    if(usuario) {
        return res.status(400).json({msg: "El usuario ya está registrado"})
    }

    //Crear un nuevo usuario
    usuario = new Usuario(req.body) //creo un nuevo usuario con postman usando el modelo importado 

    //Hashear el password
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt)

    try {
        await usuario.save()
        res.json({msg: "Usuario creado correctamente"})
    } catch (error) {
        console.log(error)
    }

}